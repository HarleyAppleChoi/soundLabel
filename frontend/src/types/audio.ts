export type SegmentLabel = 'noise' | 'silence' | 'speech' | '';

export interface AudioSegment {
  recordingId: string;
  startTime: number;
  endTime: number;
  transcript: string;
  label: SegmentLabel;
}

export interface GetAudioSegmentsResponse {
  segments: AudioSegment[];
}
