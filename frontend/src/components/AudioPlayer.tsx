'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWavesurfer } from '@/hooks/useWavesurfer';
import type { AudioSegment } from '@/types/audio';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import { PlayArrow, Pause, Stop } from '@mui/icons-material';

interface AudioPlayerProps {
  recordingId: string;
}

export default function AudioPlayer({ recordingId }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const {
    wavesurfer,
    isPlaying,
    duration,
    togglePlayPause,
    seekTo
  } = useWavesurfer({
    container: containerRef,
    url: `/api/audio?recordingId=${recordingId}`,
    height: 100,
    waveColor: '#3f51b5',
    progressColor: '#1976d2',
    cursorColor: '#90caf9',
    normalize: true,
  });

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.on('audioprocess', (time: number) => {
        setCurrentTime(time);
      });
    }
  }, [wavesurfer]);

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch(`/api/segments?recordingId=${recordingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }
        const data = await response.json();
        setSegments(data.segments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch segments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSegments();
  }, [recordingId]);

  const handleSegmentClick = (startTime: number) => {
    if (wavesurfer) {
      seekTo(startTime);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
  };

  const handleStop = () => {
    if (wavesurfer) {
      wavesurfer.stop();
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box ref={containerRef} sx={{ mb: 2 }} />
        
        {wavesurfer && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              onClick={togglePlayPause}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStop}
            >
              Stop
            </Button>
          </Stack>
        )}
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Segments
          </Typography>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {segments.map((segment, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSegmentClick(segment.startTime)}
                  selected={currentTime >= segment.startTime && currentTime <= segment.endTime}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: currentTime >= segment.startTime && currentTime <= segment.endTime
                      ? 'primary.light'
                      : 'background.paper',
                  }}
                >
                  <ListItemText
                    primary={segment.transcript}
                    secondary={`${segment.startTime.toFixed(2)}s - ${segment.endTime.toFixed(2)}s`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </CardContent>
        </Card>
      </Box>
  );
}

