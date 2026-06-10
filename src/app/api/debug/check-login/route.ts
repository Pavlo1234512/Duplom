import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const login = body?.login?.toString().trim().toLowerCase();
    const password = body?.password?.toString() || '';

    if (!login) return NextResponse.json({ error: 'login required' }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ login }).select('+password');

    if (!user) return NextResponse.json({ found: false });

    const match = await bcrypt.compare(password, user.password || '');

    return NextResponse.json({ found: true, match });
  } catch (err: any) {
    console.error('debug/check-login error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'unexpected error' }, { status: 500 });
  }
}
