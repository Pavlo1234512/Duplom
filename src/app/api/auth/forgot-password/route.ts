import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { Resend } from 'resend';

// Ініціалізація Resend з твоїм ключем
const resend = new Resend("re_LPa5XCt1_D2qBjNZYXanggLawMDR1wRHV");

export async function POST(req: Request) {
  try {
    console.log("--- ЗАПУСК ВІДНОВЛЕННЯ З ВІДПРАВКОЮ ЛИСТА ---");
    await dbConnect();

    const { login, email } = await req.json();

    // 1. Пошук користувача
    const searchLogin = login.trim();
    const searchEmail = email.toLowerCase().trim();

    const user = await User.findOne({ 
      login: searchLogin, 
      email: searchEmail 
    });

    if (!user) {
      console.log("Користувача не знайдено:", searchLogin);
      return NextResponse.json({ error: "ДАНІ НЕ ЗБІГАЮТЬСЯ" }, { status: 404 });
    }

    // 2. Генерація токена
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 година

    // 3. ЗАПИС У БАЗУ (Критично важливо!)
    const dbUpdate = await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: token, 
          resetTokenExpiry: expiry 
        } 
      }
    );
    console.log("Результат запису в БД:", dbUpdate);

    // 4. Формування посилання
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/forgot-password?token=${token}`;

    // 5. ВІДПРАВКА ЛИСТА ЧЕРЕЗ RESEND
    const { data, error } = await resend.emails.send({
      from: 'Security Hub <onboarding@resend.dev>',
      to: [user.email],
      subject: 'RESET YOUR PASSWORD',
      html: `
        <div style="background:#000; color:#fff; padding:20px; font-family:monospace; border:1px solid #2563eb;">
          <h2 style="color:#2563eb;">AUTHORIZATION REQUIRED</h2>
          <p>Ви запросили зміну пароля для: <b>${user.login}</b></p>
          <p>Натисніть кнопку нижче для доступу:</p>
          <a href="${resetUrl}" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
            ВСТАНОВИТИ НОВИЙ ПАРОЛЬ
          </a>
          <p style="margin-top:20px; font-size:10px; color:#666;">Це посилання дійсне 60 хвилин.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Помилка Resend:", error);
      return NextResponse.json({ error: "ПОМИЛКА ВІДПРАВКИ" }, { status: 500 });
    }

    console.log("ЛИСТ ВІДПРАВЛЕНО УСПІШНО!");
    console.log("Токен у базі:", token);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("ГЛОБАЛЬНА ПОМИЛКА:", err);
    return NextResponse.json({ error: "SERVER ERROR" }, { status: 500 });
  }
}