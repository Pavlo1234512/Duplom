import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Очищаємо логін від пробілів та переводимо в нижній регістр (як при реєстрації)
    const login = data.login?.trim().toLowerCase();
    const password = data.password;
    const token = data.code; // 2FA код

    console.log("СПРОБА ВХОДУ ДЛЯ:", login);

    // 1. Пошук користувача
    const user = await User.findOne({ login: login });

    if (!user) {
      console.log("ПОМИЛКА: Користувача з логіном", login, "не знайдено в базі");
      return NextResponse.json({ 
        error: "КОРИСТУВАЧА НЕ ЗНАЙДЕНО" 
      }, { status: 401 });
    }

    // 2. Перевірка статусу (активовано чи ні)
    // Якщо ти в базі написав "active", то перевіряємо на "active"
    if (user.status !== "active") {
      return NextResponse.json({ 
        error: "АКАУНТ НЕ АКТИВОВАНО. ЗВЕРНІТЬСЯ ДО АДМІНІСТРАТОРА" 
      }, { status: 403 });
    }

    // 3. Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "НЕВІРНИЙ ПАРОЛЬ" 
      }, { status: 401 });
    }

    // 4. ПЕРЕВІРКА 2FA (TOTP)
    // Важливо: перевіряємо ТІЛЬКИ якщо у юзера є збережений секрет
    if (user.twoFactorSecret) {
      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 1 // Дозволяємо похибку в 30 секунд
      });

      if (!isTokenValid) {
        return NextResponse.json({ 
          error: "НЕВІРНИЙ КОД 2FA" 
        }, { status: 401 });
      }
    }

    // 5. Успіх
    console.log("АВТОРИЗАЦІЯ УСПІШНА:", login);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        login: user.login,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("LOGIN_SERVER_ERROR:", error);
    return NextResponse.json({ 
      error: "ПОМИЛКА СЕРВЕРА: " + error.message 
    }, { status: 500 });
  }
}