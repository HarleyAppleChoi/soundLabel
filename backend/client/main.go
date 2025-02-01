package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	pb "my-project/backend/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"path/filepath"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("Usage: %s <recording_id>", os.Args[0])
	}
	recordingID := os.Args[1]

	conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewAudioServiceClient(conn)

	// Get segments
	segments, err := client.GetAudioSegments(context.Background(), &pb.GetAudioSegmentsRequest{
		RecordingId: recordingID,
	})
	if err != nil {
		log.Fatalf("Failed to get segments: %v", err)
	}

	fmt.Println("Segments:")
	for _, segment := range segments.Segments {
		fmt.Printf("Start: %.2f, End: %.2f, Transcript: %s\n", 
			segment.StartTime, 
			segment.EndTime, 
			segment.Transcript)
	}

	// Create output directory if it doesn't exist
	outputDir := "output"
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		log.Fatalf("Failed to create output directory: %v", err)
	}

	// Stream audio
	stream, err := client.StreamAudio(context.Background(), &pb.AudioRequest{
		RecordingId: recordingID,
	})
	if err != nil {
		log.Fatalf("Failed to stream audio: %v", err)
	}

	// Create output file
	outputPath := filepath.Join(outputDir, fmt.Sprintf("%s.wav", recordingID))
	outFile, err := os.Create(outputPath)
	if err != nil {
		log.Fatalf("Failed to create output file: %v", err)
	}
	defer outFile.Close()

	var totalBytes int64
	fmt.Printf("\nStreaming audio to %s\n", outputPath)

	// Process the stream
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Failed to receive audio chunk: %v", err)
		}

		n, err := outFile.Write(resp.Chunk)
		if err != nil {
			log.Fatalf("Failed to write audio chunk: %v", err)
		}
		totalBytes += int64(n)

		// Print progress
		fmt.Printf("\rReceived: %.2f MB", float64(totalBytes)/1024/1024)
	}

	fmt.Printf("\nAudio streaming completed. Total size: %.2f MB\n", float64(totalBytes)/1024/1024)
	fmt.Printf("File saved to: %s\n", outputPath)

	// Print segment information for the recording
	fmt.Println("\nSegment information:")
	for i, segment := range segments.Segments {
		fmt.Printf("%d. %.2fs - %.2fs: %s\n", 
			i+1,
			segment.StartTime, 
			segment.EndTime, 
			segment.Transcript)
	}
}
