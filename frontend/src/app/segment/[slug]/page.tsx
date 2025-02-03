"use client"
import AudioPlayer from '@/components/AudioPlayer';
import { useSubmittedContext } from '@/constants/SubmittedContext';
import { useParams } from 'next/navigation';
import React from 'react';
import {useRouter} from 'next/navigation';
 
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
    return (
        <AudioPlayer recordingId={recordingID} afterSubmit={afterSubmit}/>
    );
};

export default SegmentPage;