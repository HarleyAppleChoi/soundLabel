"use server"
import { NextRequest, NextResponse } from 'next/server';
import type { AudioSegment } from '@/types/audio';
import { UpdateSegmentLabelsRequest } from '@/proto/audio';
import client from '../../utils/grpcClient';

/**
 * 
 * @param request recording ID and segments labels to update
 * @returns success if successful
 */
export async function POST(request: NextRequest) {
  try {
    const { recordingId, segments } = await request.json() as { recordingId: string, segments: AudioSegment[] };

    if (!recordingId || !segments) {
      return NextResponse.json({ error: 'Recording ID and segments are required' }, { status: 400 });
    }

    const grpcClient = client.getClient();

    const submit =  new Promise((resolve, reject) => {
      grpcClient.UpdateSegmentLabels({ recordingId: recordingId, segments: segments } as UpdateSegmentLabelsRequest, (err: any, response: any) => {
        if (err) {
        reject(new Error('Failed to update segment labels'));
        } else {
        resolve(response);
        }
      });
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}