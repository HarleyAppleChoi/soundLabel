'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import AudioPlayer from '@/components/AudioPlayer';
import { api } from '@/utils/api';

export default function Home() {
  // Using one of the recording IDs from our dataset
  const sampleRecordingId = '9ea7b591-2331-4f35-a4ce-96d404f1e019';

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button variant="contained" color="primary" onClick={
          async () => {
            api.ping()
          }
        }>
          Ping
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Audio Transcription Player
        </Typography>
        <AudioPlayer recordingId={sampleRecordingId} />
      </Box>
    </Container>
  );
}
