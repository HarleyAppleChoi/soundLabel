"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useWavesurfer } from '../../hooks/useWavesurfer';
import { api, AudioSegment } from '../../utils/api';

const parseTimeToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

export default function AnnotationTool() {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { isPlaying, togglePlayPause, seekTo } = useWavesurfer({
    audioUrl,
    container: 'waveform',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [url, segmentsData] = await Promise.all([
          api.getAudioUrl(),
          api.getSegments(),
        ]);
        setAudioUrl(url);
        setSegments(segmentsData);
      } catch (err) {
        setError('Failed to load audio data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLabel = (segmentId: string, label: 'noise' | 'silence' | 'speech') => {
    setSegments(segments.map(segment => 
      segment.id === segmentId ? { ...segment, label } : segment
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.saveAnnotations({
        segments: segments
          .filter(s => s.label)
          .map(s => ({
            segmentId: s.id,
            label: s.label!,
          })),
      });
      setError(null);
    } catch (err) {
      setError('Failed to save annotations');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSegmentClick = (startTime: string) => {
    const timeInSeconds = parseTimeToSeconds(startTime);
    seekTo(timeInSeconds);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Audio Annotation Tool
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Box id="waveform" />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <IconButton
              onClick={togglePlayPause}
              size="large"
              sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {segments.map((segment) => (
            <Box
              key={segment.id}
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
              onClick={() => handleSegmentClick(segment.startTime)}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  [{segment.startTime} - {segment.endTime}]
                </Typography>
                <Typography>{segment.transcript}</Typography>
              </Box>
              <ButtonGroup variant="outlined" size="small" onClick={e => e.stopPropagation()}>
                <Button
                  onClick={() => handleLabel(segment.id, 'noise')}
                  variant={segment.label === 'noise' ? 'contained' : 'outlined'}
                >
                  noise
                </Button>
                <Button
                  onClick={() => handleLabel(segment.id, 'silence')}
                  variant={segment.label === 'silence' ? 'contained' : 'outlined'}
                >
                  silence
                </Button>
                <Button
                  onClick={() => handleLabel(segment.id, 'speech')}
                  variant={segment.label === 'speech' ? 'contained' : 'outlined'}
                >
                  speech
                </Button>
              </ButtonGroup>
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || segments.some(s => s.label === null)}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Annotations'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
