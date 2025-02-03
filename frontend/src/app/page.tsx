'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { api } from '@/utils/api';
import React, { useEffect, useState } from 'react';
import { useSubmittedContext } from '@/constants/SubmittedContext';

export default function Home() {
  // Using one of the recording IDs from our dataset
  const router = useRouter();
  const {context}= useSubmittedContext();
  const [firstLoaded, setFirstLoaded] = useState(false);

  useEffect(() => {
    if (context.queue.length !== 0) {
      return;
    }
    api.getAudioQueue().then((queue) => {
      context.setQueue(queue);
      console.log(queue)
      context.setQueueSize(queue.length);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audio Transcription Player
        </Typography>
<Button variant="contained" color="primary" onClick={() => { router.push('/segment/' + context.queue[0]); }}>
  Start Transcribing
</Button>
      </Box>
    </Container>
  );
}
