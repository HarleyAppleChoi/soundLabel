
import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader'

import { GetAudioSegmentsRequest, GetAudioSegmentsResponse } from '@/proto/audio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
  }

  /*
  try {
    const csvPath = path.join(process.cwd(), '..', 'backend', 'resources', 'segments.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    const segments: AudioSegment[] = records
      .filter((record: any) => record.recording_id === recordingId)
      .map((record: any) => ({
        recordingId: record.recording_id,
        startTime: parseFloat(record.start),
        endTime: parseFloat(record.end),
        transcript: record.transcript
      }));

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Error reading segments:', error);
    return NextResponse.json(
      { error: 'Failed to read segments' },
      { status: 500 }
    );
  }*/
    try {
        const pd = protoLoader.loadSync(process.cwd() + '/../backend/proto/audio.proto');
        const protoDescriptor = grpc.loadPackageDefinition(pd);
        const AudioService = (protoDescriptor as any).audio.AudioService;
        const client = new AudioService("localhost:50051", grpc.credentials.createInsecure());

        const data = await new Promise<GetAudioSegmentsResponse>((resolve, reject) => {
          client.GetAudioSegments({ recordingId: recordingId } as GetAudioSegmentsRequest, (err: any, response: any) => {
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
