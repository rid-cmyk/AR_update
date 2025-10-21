import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const suratId = searchParams.get('suratId');

    if (suratId) {
      // Get specific surat details
      const response = await fetch(`https://equran.id/api/v2/surat/${suratId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch surat data');
      }
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Get all surat list
      const response = await fetch('https://equran.id/api/v2/surat');
      if (!response.ok) {
        throw new Error('Failed to fetch surat list');
      }
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching Quran data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Quran data' },
      { status: 500 }
    );
  }
}