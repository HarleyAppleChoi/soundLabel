"use client"
import AudioPlayer from '@/components/AudioPlayer';
import { useSubmittedContext } from '@/constants/SubmittedContext';
import { useParams } from 'next/navigation';
import React from 'react';
import {useRouter} from 'next/navigation';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { Grid, Typography } from '@mui/material';
 
const SegmentPage: React.FC = () => {
    const { context } = useSubmittedContext();
    const { slug } = useParams();
    const router = useRouter();
    const recordingID = slug as string;
    const afterSubmit = () => {
        const index = context.queue.indexOf(recordingID);
        if (index > -1) {
            context.queue.splice(index, 1);
            context.setQueue([...context.queue]);
        }
        if (context.queue.length > 0) {
            router.push('/segment/' + context.queue[0]);
        }
        if (context.queue.length == 0){
            router.push('/finish');
        }
    }


function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }} gutterBottom>
                Queue Progress
                </Typography>
            </Grid>
        <Grid item xs={12}>

        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
        </Grid>
        </Grid>
      </Box>
    );
  }
  

    return (
<>
                <Box sx={{ p: 2 }}>
                    <LinearProgressWithLabel variant="determinate" value={((context.queueSize-context.queue.length)/context.queueSize)*100} />
                </Box>
                <AudioPlayer recordingId={recordingID} afterSubmit={afterSubmit}/>
            </>
    );
};

export default SegmentPage;