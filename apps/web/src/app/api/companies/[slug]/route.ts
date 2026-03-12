import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  return NextResponse.json({
    success: false,
    error: 'Öffentliche Unternehmensprofile sind deaktiviert',
  }, { status: 404 });
}
