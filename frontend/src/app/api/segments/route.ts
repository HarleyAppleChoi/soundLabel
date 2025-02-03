
import { NextRequest, NextResponse } from 'next/server';

import { GetAudioSegmentsRequest, GetAudioSegmentsResponse } from '@/proto/audio';
import client from '../utils/grpcClient';

/**
 * 
 * @param request recordingId that the audio is associated with
 * @returns Segment data from the server
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
  }
    try {
        const grpcClient = client.getClient();

        const data = await new Promise<GetAudioSegmentsResponse>((resolve, reject) => {
          grpcClient.GetAudioSegments({ recordingId: recordingId } as GetAudioSegmentsRequest, (err: any, response: any) => {
            if (err) {
              console.log("error", err);
              reject(err);
            } else {
              console.log("response", response);
              resolve(response);
            }
          });
        });

        return NextResponse.json({ segments: data.segments }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
