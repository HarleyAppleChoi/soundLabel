"use server"
import { NextRequest, NextResponse } from 'next/server';
import * as protobuf from 'protobufjs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path';
import * as fs from 'fs';
import type { AudioSegment } from '@/types/audio';
import { UpdateSegmentLabelsRequest } from '@/proto/audio';

// Load the proto file

export async function POST(request: NextRequest) {
  try {
    const { recordingId, segments } = await request.json() as { recordingId: string, segments: AudioSegment[] };
    const pd = protoLoader.loadSync(process.cwd() + '/../backend/proto/audio.proto');
    const protoDescriptor = grpc.loadPackageDefinition(pd) ;    
    const AudioService = (protoDescriptor as any).audio.AudioService;
    const client = new AudioService("localhost:50051", grpc.credentials.createInsecure());
    client.UpdateSegmentLabels({ recordingId: recordingId, segments: segments } as UpdateSegmentLabelsRequest, (err: any, response: any) => {
      if (err){
        return NextResponse.json({ error: 'Failed to update segment labels' }, { status: 500 });
      }else{
        console.log(response);
        return NextResponse.json({ success: true });
      }
    })
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}