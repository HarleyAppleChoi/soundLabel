package main

import (
	"bufio"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"path/filepath"
	"strconv"
	pb "my-project/backend/proto"
	"google.golang.org/grpc"
)

type audioServer struct {
	pb.UnimplementedAudioServiceServer
	segments map[string][]*pb.AudioSegment
}

func newServer() *audioServer {
	server := &audioServer{
		segments: make(map[string][]*pb.AudioSegment),
	}
	if err := server.loadSegments("resources/segments.csv"); err != nil {
		log.Fatalf("Failed to load segments: %v", err)
	}
	return server
}

func (s *audioServer) loadSegments(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Skip header
	if _, err := reader.Read(); err != nil {
		return fmt.Errorf("failed to read CSV header: %v", err)
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to read CSV record: %v", err)
		}

		startTime, err := strconv.ParseFloat(record[1], 64)
		if err != nil {
			return fmt.Errorf("failed to parse start time: %v", err)
		}

		endTime, err := strconv.ParseFloat(record[2], 64)
		if err != nil {
			return fmt.Errorf("failed to parse end time: %v", err)
		}

		// Create segment with optional label field
		segment := &pb.AudioSegment{
			RecordingId: record[0],
			StartTime:   startTime,
			EndTime:     endTime,
			Transcript:  record[3],
			Label:       "", // Default empty label
		}
		
		// If label field exists in CSV, use it
		if len(record) > 4 {
			segment.Label = record[4]
		}

		s.segments[record[0]] = append(s.segments[record[0]], segment)
	}

	return nil
}

func (s *audioServer) GetAudioSegments(ctx context.Context, req *pb.GetAudioSegmentsRequest) (*pb.GetAudioSegmentsResponse, error) {
	segments, ok := s.segments[req.RecordingId]
	if !ok {
		return nil, fmt.Errorf("no segments found for recording ID: %s", req.RecordingId)
	}
	fmt.Println(segments)

	return &pb.GetAudioSegmentsResponse{
		Segments: segments,
	}, nil
}

func (s *audioServer) UpdateSegmentLabels(ctx context.Context, req *pb.UpdateSegmentLabelsRequest) (*pb.UpdateSegmentLabelsResponse, error) {
	// Get existing segments for the recording
	_, ok := s.segments[req.RecordingId]
	if !ok {
		return &pb.UpdateSegmentLabelsResponse{
			Success: false,
			Message: "No segments found for recording ID",
		}, nil
	}
	fmt.Println(req.Segments)
	filename := "resources/segments_with_labels.csv"

	var writer *csv.Writer

	if _, err := os.Stat(filename); os.IsNotExist(err) {
		// Create file if it does not exist
		file, err := os.Create(filename)
		if err != nil {
			return nil, fmt.Errorf("failed to create file: %v", err)
		}
		writer = csv.NewWriter(file)
			// Write header
	header := []string{"recording_id", "start_time", "end_time", "transcript", "label"}
	if err := writer.Write(header); err != nil {
		return nil, fmt.Errorf("failed to write CSV header: %v", err)
	}

	} else if err != nil {
		return nil, fmt.Errorf("failed to check file existence: %v", err)
	} else{
		// Open existing file
		file, err := os.OpenFile(filename, os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return nil, fmt.Errorf("failed to open file: %v", err)
		}
		writer = csv.NewWriter(file)
	}
	defer writer.Flush()

	// Append new segments to existing segments
	for _, segment := range req.Segments {
		record := []string{
			segment.RecordingId,
			strconv.FormatFloat(segment.StartTime, 'f', 3, 64),
			strconv.FormatFloat(segment.EndTime, 'f', 3, 64),
			segment.Transcript,
			segment.Label,
		}
		if err := writer.Write(record); err != nil {
			return nil, fmt.Errorf("failed to write CSV record: %v", err)
		}
	}
	return &pb.UpdateSegmentLabelsResponse{
		Success: true,
		Message: "Segments updated successfully",
	}, nil
}

func (s *audioServer) StreamAudio(req *pb.AudioRequest, stream pb.AudioService_StreamAudioServer) error {
	audioPath := filepath.Join("resources/audio", req.RecordingId+".wav")
	file, err := os.Open(audioPath)
	if err != nil {
		return fmt.Errorf("failed to open audio file: %v", err)
	}
	defer file.Close()

	reader := bufio.NewReader(file)
	buffer := make([]byte, 1024*4) // 4KB chunks

	for {
		n, err := reader.Read(buffer)
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("error reading audio file: %v", err)
		}

		if err := stream.Send(&pb.AudioResponse{
			Chunk: buffer[:n],
		}); err != nil {
			return fmt.Errorf("error streaming audio chunk: %v", err)
		}
	}

	return nil
}

// Ping implements audio.AudioServiceServer.Ping
func (s *audioServer) Ping(ctx context.Context, in *pb.PingRequest) (*pb.PingResponse, error) {
	return &pb.PingResponse{
		PingResponse: "Pong",
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterAudioServiceServer(s, newServer())

	log.Printf("Server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
