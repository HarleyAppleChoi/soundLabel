package handlers

import (
	"encoding/json"
	"net/http"
	"path/filepath"

	"my-project/backend/internal/models"
)

type AudioHandler struct {
	// TODO: Add dependencies like database client
}

func NewAudioHandler() *AudioHandler {
	return &AudioHandler{}
}

// GetAudio returns the audio file
func (h *AudioHandler) GetAudio(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement actual audio file serving
	audioPath := filepath.Join("assets", "audio", "sample.mp3")
	http.ServeFile(w, r, audioPath)
}

// GetSegments returns the audio segments with transcripts
func (h *AudioHandler) GetSegments(w http.ResponseWriter, r *http.Request) {
	// TODO: Fetch from database
	segments := []models.AudioSegment{
		{
			ID:        "1",
			AudioID:   "sample",
			StartTime: "00:04",
			EndTime:   "00:10",
			Transcript: "this is some transcript",
		},
		{
			ID:        "2",
			AudioID:   "sample",
			StartTime: "00:15",
			EndTime:   "00:35",
			Transcript: "more transcripts",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(segments)
}

// SaveAnnotations saves the segment labels
func (h *AudioHandler) SaveAnnotations(w http.ResponseWriter, r *http.Request) {
	var req models.AudioAnnotationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Save annotations to database
	// For now, just return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Annotations saved successfully",
	})
}
