import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { userId, role, status } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "ID користувача обов'язкове" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, status },
      { new: true } // Повертає вже оновлений об'єкт
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}