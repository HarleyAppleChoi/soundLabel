import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader'

import { GetAudioSegmentsRequest, GetAudioSegmentsResponse } from '@/proto/audio';
import { AudioRequest, AudioResponse } from 'audio';
import { DataArrayRounded } from '@mui/icons-material';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
  }
  
   try{
  let audioChunks: Uint8Array[] = [];
  const pd = protoLoader.loadSync(process.cwd() + '/../backend/proto/audio.proto');
  const protoDescriptor = grpc.loadPackageDefinition(pd);
  const AudioService = (protoDescriptor as any).audio.AudioService;
  const client = new AudioService("localhost:50051", grpc.credentials.createInsecure());

const call = client.StreamAudio({ recordingId: recordingId } as AudioRequest);

const response = await new Promise<NextResponse>((resolve, reject) => {
    call.on('data', function(data: AudioResponse) {
        // Process the audio chunk
        audioChunks.push(data.chunk);
    });

    call.on('end', function() {
        // The server has finished sending
        const audioBuffer = Buffer.concat(audioChunks);
        resolve(new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.length.toString(),
            },
        }));
    });

    call.on('error', function(e: any) {
        // An error has occurred and the stream has been closed.
        reject(e);
    });

    call.on('status', function(status: any) {
        // process status
        console.log(status);
    });
});

return response;
} catch (error) {
  console.error('Error processing request:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
}
