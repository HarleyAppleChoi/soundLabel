'use client';

import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import AudioPlayer from '@/components/AudioPlayer';
import { api } from '@/utils/api';
import { useEffect, useState } from 'react';

export default function Home() {
  // Using one of the recording IDs from our dataset
  const sampleRecordingId = '9ea7b591-2331-4f35-a4ce-96d404f1e019';
  const [queue, setQueue] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);

  useEffect(() => {
    if (queue.length !== 0) {
      return;
    }
    api.getAudioQueue().then((queue) => {
      setQueue(queue);
      setFirstLoaded(true);
    }
    );
  }
  , []);

  if (firstLoaded === false){
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Audio Transcription Player
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Container>
    )
  }

  if (queue.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Audio Transcription Player
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Finish all the recordings
          </Typography>
        </Box>
      </Container>
    );
  }

  if (submitted){
    setQueue(queue.slice(1));
    setSubmitted(false);
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audio Transcription Player
        </Typography>
        <AudioPlayer recordingId={queue[0]} setSubmitted={setSubmitted}/>
      </Box>
    </Container>
  );
}
