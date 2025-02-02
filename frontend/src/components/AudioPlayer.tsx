'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWavesurfer } from '@/hooks/useWavesurfer';
import type { AudioSegment, SegmentLabel } from '@/types/audio';
import { api } from '@/utils/api';
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
  Stack,
} from '@mui/material';
import { PlayArrow, Pause, Stop } from '@mui/icons-material';
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AudioPlayerProps {
  recordingId: string;
}

export default function AudioPlayer({ recordingId }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const segmentsWithLabels = data.segments.map((segment: AudioSegment) => ({
          ...segment,
          label: '' // Initialize label to empty string
        }));
        setSegments(segmentsWithLabels);
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


  const handleLabelChange = (index: number, label: SegmentLabel) => {
    const newSegments = [...segments];
    newSegments[index].label = label;
    setSegments(newSegments);
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
                    display: 'flex', // Enable flexbox for alignment
                    justifyContent: 'space-between', // Distribute space between text and buttons
                    alignItems: 'center', // Vertically align items
                  }}
                >
                  <ListItemText
                    primary={segment.transcript}
                    secondary={`${segment.startTime.toFixed(2)}s - ${segment.endTime.toFixed(2)}s`}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Button
                      size="small"
                      variant={segment.label === 'noise' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => handleLabelChange(index, 'noise')}
                      sx={{ mr: 1 }}
                    >
                      Noise
                    </Button>
                    <Button
                      size="small"
                      variant={segment.label === 'silence' ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => handleLabelChange(index, 'silence')}
                      sx={{ mr: 1 }}
                    >
                      Silence
                    </Button>
                    <Button
                      size="small"
                      variant={segment.label === 'speech' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => handleLabelChange(index, 'speech')}
                    >
                      Speech
                    </Button>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </CardContent>
        </Card>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                setIsSubmitting(true);
                const response = await axios.post(`${API_BASE_URL}/api/segments/labels`, {
                  recordingId,
                  segments: segments.map(segment => ({
                  recordingId: segment.recordingId,
                  startTime: segment.startTime,
                  endTime: segment.endTime,
                  transcript: segment.transcript,
                  label: segment.label
                  }))
                }, {
                  headers: {
                  'Content-Type': 'application/json',
                  }
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to submit labels');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit Labels'
            )}
          </Button>
        </Box>
      </Box>
  );
}
