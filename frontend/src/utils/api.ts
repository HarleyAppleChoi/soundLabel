const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AudioSegment {
  id: string;
  audioId: string;
  startTime: string;
  endTime: string;
  transcript: string;
  label: 'noise' | 'silence' | 'speech' | null;
}

export interface AnnotationRequest {
  segments: {
    segmentId: string;
    label: string;
  }[];
}

export const api = {
  async getAudioUrl(): Promise<string> {
    return `${API_BASE_URL}/api/audio`;
  },

  async getSegments(): Promise<AudioSegment[]> {
    const response = await fetch(`${API_BASE_URL}/api/segments`);
    if (!response.ok) {
      throw new Error('Failed to fetch segments');
    }
    return response.json();
  },

  async saveAnnotations(annotations: AnnotationRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(annotations),
    });

    if (!response.ok) {
      throw new Error('Failed to save annotations');
    }
  },
};
