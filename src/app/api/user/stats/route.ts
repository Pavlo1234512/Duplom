import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Report from '@/models/Report'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userLogin = (session?.user as any)?.login;
    
    if (!userLogin) {
      return NextResponse.json({ count: 0 });
    }

    await dbConnect();

    // Рахуємо звіти, де поле authorLogin або схоже дорівнює логіну юзера
    // Переконайся, що в моделі Report у тебе поле для логіна, а не пошти
    const count = await Report.countDocuments({ authorLogin: userLogin }).maxTimeMS(3000);
    
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}