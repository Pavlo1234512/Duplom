import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // 1. Перевірка обов'язкових полів
    const { 
      lastName, firstName, middleName, phone, 
      login, password, confirmPassword, unit, position 
    } = data;

    if (!lastName || !firstName || !login || !password || !unit) {
      return NextResponse.json({ 
        error: "ВІДСУТНІ ОБОВ'ЯЗКОВІ ДАНІ" 
      }, { status: 400 });
    }

    // 2. Серверна валідація пароля
    // Мінімум 8 символів, одна велика літера, один спецсимвол
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        error: "ПАРОЛЬ НЕ ВІДПОВІДАЄ КРИТЕРІЯМ БЕЗПЕКИ (8+ СИМВОЛІВ, ВЕЛИКА ЛІТЕРА, СПЕЦСИМВОЛ)" 
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ 
        error: "ПАРОЛІ НЕ ЗБІГАЮТЬСЯ" 
      }, { status: 400 });
    }

    // 3. Перевірка на унікальність логіна (та пошти, якщо вона вказана)
    const cleanLogin = login.trim().toLowerCase();
    const query: any = { login: cleanLogin };
    
    // Якщо користувач вказав email, перевіряємо і його теж
    if (data.email) {
      query.$or = [{ login: cleanLogin }, { email: data.email.toLowerCase().trim() }];
    }

    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      const field = existingUser.login === cleanLogin ? "ЛОГІН" : "EMAIL";
      return NextResponse.json({ 
        error: `КОРИСТУВАЧ З ТАКИМ ${field} ВЖЕ ЗАРЕЄСТРОВАНИЙ` 
      }, { status: 400 });
    }

    // 4. Генерація 2FA секрету
    // Це створить секретний ключ, який користувач відсканує в Google Authenticator
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `STRATCOM: ${cleanLogin}`,
      issuer: "STRATCOM_AI"
    });

    // 5. Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Збереження в базу даних
    await User.create({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      middleName: middleName?.trim() || "",
      phone: phone?.trim() || "",
      email: data.email ? data.email.toLowerCase().trim() : "",
      unit: unit.trim(),
      position: position?.trim() || "",
      login: cleanLogin,
      password: hashedPassword,
      twoFactorSecret: secret.base32, // КЛЮЧОВЕ ПОЛЕ: зберігаємо для перевірки при логіні
      status: "pending", // Юзер чекає на "approved" від адміна
      role: "USER"
    });

    // 7. Повертаємо дані для QR-коду на фронтенд
    return NextResponse.json({ 
      message: "Користувача створено",
      otpauth: secret.otpauth_url, // Це посилання для генерації QR-коду
      secret: secret.base32 
    }, { status: 201 });

  } catch (error: any) {
    console.error("REGISTRATION_SERVER_ERROR:", error);
    return NextResponse.json({ 
      error: "КРИТИЧНА ПОМИЛКА СЕРВЕРА: " + (error.message || "UNKNOWN ERROR") 
    }, { status: 500 });
  }
}