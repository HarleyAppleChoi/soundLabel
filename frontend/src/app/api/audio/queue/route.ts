import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader'
import { GetAudioQueueResponse } from 'audio';
import client from '../../utils/grpcClient';

/**
 * 
 * @returns  The audio segment id queue from the server
 */
export async function GET() {
  try {
    const grpcClient = client.getClient();

        const data: any = await new Promise((resolve, reject) => {
            grpcClient.getAudioQueue(({ }), (err: any, response: any) => {
              if (err) {
                console.log("error", err);
                reject(err);
              } else {
                console.log("response", response);
                if (response && response.recordingIds) {
                  resolve(response);
                } else {
                  reject(new Error("Invalid response structure"));
                }
              }
            });
        })
  
    return NextResponse.json({ data: data.recordingIds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audio queue:", error);
    return NextResponse.json({ error: 'Failed to fetch audio queue' }, { status: 500 });
  }
}
