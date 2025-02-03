import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WavesurferHookProps {
  container: React.RefObject<HTMLDivElement>;
  url: string;
  height: number;
  waveColor: string;
  progressColor: string;
  cursorColor: string;
  normalize: boolean;
}

export const useWavesurfer = ({
  container,
  url,
  height,
  waveColor,
  progressColor,
  cursorColor,
  normalize,
}: WavesurferHookProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!url) return;

    if (!container.current) return;

    const wavesurfer = WaveSurfer.create({
      container: container.current,
      height,
      waveColor,
      progressColor,
      cursorColor,
      normalize,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(url);

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    return () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
    };
  }, [url, container]);

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
    setIsPlaying,
    isPlaying,
    duration,
    togglePlayPause,
    seekTo,
  };
};
