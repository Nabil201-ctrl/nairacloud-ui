import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  try {
    const data = await api().get('/v1/settings');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ liveChat: { provider: 'none' } });
  }
}