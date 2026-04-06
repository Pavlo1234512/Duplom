import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userLogin = (session?.user as any)?.login;

    if (!userLogin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Шукаємо за логіном
    const user = await User.findOne({ login: userLogin }).maxTimeMS(2000);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Форматуємо ПІБ за твоїм стилем: Прізвище І. П.
    const f = user.firstName ? `${user.firstName.charAt(0)}.` : "";
    const m = user.middleName ? `${user.middleName.charAt(0)}.` : "";
    const formattedName = `${user.lastName} ${f}${m}`.trim();

    // Повертаємо об'єкт з базовими даними + відформатованим ім'ям
    return NextResponse.json({
      ...user._doc, // Всі дані з БД
      formattedName, // Готове ім'я для відображення
      unit: user.unit || "ВІТІ"
    });
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userLogin = (session?.user as any)?.login;

    if (!userLogin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { login: userLogin },
      { $set: data },
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}