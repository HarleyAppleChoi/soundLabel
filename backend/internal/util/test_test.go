package util_test

import (
	"testing"

	"github.com/HarleyAppleChoi/interview-polyAI/backend/internal/util"
	"github.com/stretchr/testify/require"
)

func TestRunningInTest(t *testing.T) {
	require.True(t, util.RunningInTest(), "Should be true while we are running in the test env/context")
}
