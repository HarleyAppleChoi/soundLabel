import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
  }

  try {
    const audioPath = path.join(process.cwd(), '..', 'backend', 'resources', 'audio', `${recordingId}.wav`);
    
    if (!fs.existsSync(audioPath)) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }

    const audioData = fs.readFileSync(audioPath);

    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioData.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error reading audio file:', error);
    return NextResponse.json(
      { error: 'Failed to read audio file' },
      { status: 500 }
    );
  }
}
