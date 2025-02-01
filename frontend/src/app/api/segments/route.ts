import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { AudioSegment } from '@/types/audio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
  }

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
  }
}
