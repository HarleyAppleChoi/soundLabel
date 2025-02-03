"use client"
import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import {useRouter} from 'next/navigation';

const FinishPage: React.FC = () => {
    const router = useRouter();
    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Finish Page
            </Typography>
            <Typography variant="body1" gutterBottom>
                Congratulations! You have completed the task.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push("/")}>
                Go back
            </Button>
        </Container>
    );
};

export default FinishPage;