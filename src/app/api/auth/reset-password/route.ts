import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    console.log("--- СПРОБА ЗМІНИ ПАРОЛЯ ---");

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: "НЕДОПУСТИМІ ДАНІ" }, { status: 400 });
    }

    // Шукаємо юзера за токеном
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      console.log("ПОМИЛКА: Токен не знайдено в БД");
      return NextResponse.json({ error: "ПОСИЛАННЯ НЕМАЄ АБО ВОНО ЗАСТАРІЛО" }, { status: 400 });
    }

    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Оновлюємо пароль та чистимо токени
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }, 
      }
    );

    console.log(`УСПІХ: Пароль для ${user.login} змінено.`);
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Критична помилка API:", err);
    return NextResponse.json({ error: "SERVER ERROR" }, { status: 500 });
  }
}