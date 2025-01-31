package auth

import (
	"time"

	"github.com/HarleyAppleChoi/interview-polyAI/backend/internal/models"
)

type AuthenticationResult struct {
	Token      string
	User       *models.User
	ValidUntil time.Time
	Scopes     []string
}
