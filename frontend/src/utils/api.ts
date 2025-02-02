"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import type { AudioSegment } from '@/types/audio';
import axios from 'axios';

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

  async updateSegmentLabels(recordingId: string, segments: AudioSegment[]): Promise<void> {
    const response = axios.post(`${API_BASE_URL}/api/segments/labels`, {
      recordingId,
      segments: segments.map(segment => ({
      recordingId: segment.recordingId,
      startTime: segment.startTime,
      endTime: segment.endTime,
      transcript: segment.transcript,
      label: segment.label
      }))
    }, {
      headers: {
      'Content-Type': 'application/json',
      }
    });
  },

  async ping(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/ping`);
    if (!response.ok) {
      throw new Error('Failed to ping server');
    }
    return response.json();
  },
};
