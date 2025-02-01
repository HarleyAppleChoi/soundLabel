export interface AudioSegment {
  recordingId: string;
  startTime: number;
  endTime: number;
  transcript: string;
}

export interface GetAudioSegmentsResponse {
  segments: AudioSegment[];
}
