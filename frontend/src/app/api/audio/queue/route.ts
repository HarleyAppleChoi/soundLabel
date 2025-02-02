import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader'
import { GetAudioQueueResponse } from 'audio';
export async function GET() {
  try {
    const pd = protoLoader.loadSync(process.cwd() + '/../backend/proto/audio.proto');
        const protoDescriptor = grpc.loadPackageDefinition(pd);
        const AudioService = (protoDescriptor as any).audio.AudioService;
        const client = new AudioService("localhost:50051", grpc.credentials.createInsecure());

        const data = await new Promise<GetAudioQueueResponse>((resolve, reject) => {
            client.getAudioQueue(({ }), (err: any, response: any) => {
              if (err) {
                console.log("error", err);
                reject(err);
              } else {
                console.log("response", response);
                resolve(response);
              }
            });
        })
  
          return NextResponse.json({ data: data.recordingIds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audio queue:", error);
    return NextResponse.json({ error: 'Failed to fetch audio queue' }, { status: 500 });
  }
}
