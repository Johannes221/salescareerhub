import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: user });
}
