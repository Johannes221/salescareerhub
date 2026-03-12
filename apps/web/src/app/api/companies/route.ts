import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Öffentliche Unternehmensprofile sind deaktiviert',
  }, { status: 404 });
}
