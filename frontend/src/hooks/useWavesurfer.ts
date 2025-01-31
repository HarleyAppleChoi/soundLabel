import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WavesurferHookProps {
  audioUrl: string;
  container: string;
}

export const useWavesurfer = ({ audioUrl, container }: WavesurferHookProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;

    const wavesurfer = WaveSurfer.create({
      container: `#${container}`,
      waveColor: '#4a9eff',
      progressColor: '#1976d2',
      height: 100,
      normalize: true,
      backend: 'WebAudio',
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(audioUrl);

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, container]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const seekTo = (timeInSeconds: number) => {
    if (wavesurferRef.current && duration > 0) {
      const position = Math.min(Math.max(timeInSeconds / duration, 0), 1);
      wavesurferRef.current.seekTo(position);
    }
  };

  return {
    wavesurfer: wavesurferRef.current,
    isPlaying,
    duration,
    togglePlayPause,
    seekTo,
  };
};
