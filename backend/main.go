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

		segment := &pb.AudioSegment{
			RecordingId: record[0],
			StartTime:   startTime,
			EndTime:     endTime,
			Transcript:  record[3],
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

	return &pb.GetAudioSegmentsResponse{
		Segments: segments,
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
