import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect(); // Просто підключаємось, db() більше не потрібен
    const { userId, action } = await request.json();

    if (action === 'approve') {
      await User.findByIdAndUpdate(userId, { role: 'OPERATOR', status: 'approved' });
    } else if (action === 'reject') {
      await User.findByIdAndDelete(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}