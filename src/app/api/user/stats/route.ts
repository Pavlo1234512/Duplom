import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import dbConnect from '@/lib/db';
import Report from '@/models/BattleReport';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: any) {
  try {
    await dbConnect();
    
    // 1. Уніфікована ідентифікація (Android + Веб)
    let login = null;
    const sessionToken = req.cookies.get('session_token')?.value;
    
    if (sessionToken) {
      login = sessionToken;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.login) login = token.login;
    }

    if (!login) return NextResponse.json({ count: 0 }, { status: 401 });

    // 2. Рахуємо звіти
    // ВАЖЛИВО: Переконайтеся, що в моделі BattleReport поле називається саме authorLogin
    const count = await Report.countDocuments({ authorLogin: login });
    
    return NextResponse.json({ count });
  } catch (e) {
    console.error("Помилка статистики:", e);
    return NextResponse.json({ count: 0 });
  }
}