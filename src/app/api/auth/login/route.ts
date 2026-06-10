import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Функція ручної перевірки TOTP (2FA) без сторонніх бібліотек
function verifyTOTP(token: string, secret: string): boolean {
  try {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    const cleanSecret = secret.toUpperCase().replace(/=/g, '');
    
    for (let i = 0; i < cleanSecret.length; i++) {
      const val = base32chars.indexOf(cleanSecret.charAt(i));
      if (val === -1) return false;
      bits += val.toString(2).padStart(5, '0');
    }
    
    const secretBytes = Buffer.alloc(Math.floor(bits.length / 8));
    for (let i = 0; i < secretBytes.length; i++) {
      secretBytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
    }

    const epoch = Math.floor(Date.now() / 1000);
    const timeCounter = Math.floor(epoch / 30);

    for (let errorWindow = -1; errorWindow <= 1; errorWindow++) {
      const timeBuffer = Buffer.alloc(8);
      let tempCounter = timeCounter + errorWindow;
      
      for (let i = 7; i >= 0; i--) {
        timeBuffer[i] = tempCounter & 0xff;
        tempCounter = tempCounter >> 8;
      }

      const hmac = crypto.createHmac('sha1', secretBytes);
      hmac.update(timeBuffer);
      const hmacResult = hmac.digest();

      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const calculatedToken = String(code % 1000000).padStart(6, '0');

      if (calculatedToken === token) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Помилка ручної генерації TOTP:", e);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, password, code } = body;
    
    await dbConnect();

    const user = await User.findOne({ login: login }).select('+password +twoFactorSecret');
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Користувач не знайдений" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Невірний пароль" }, { status: 401 });
    }

    if (user.twoFactorSecret) {
      if (!code) {
        return NextResponse.json({ success: false, message: "Необхідно ввести код 2FA" }, { status: 400 });
      }

      const cleanCode = String(code).trim();
      const is2faValid = verifyTOTP(cleanCode, user.twoFactorSecret);
      
      if (!is2faValid) {
        return NextResponse.json({ success: false, message: "Невірний код 2FA" }, { status: 401 });
      }
    }

    // Створюємо успішну відповідь
    const response = NextResponse.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        unit: user.unit
      }
    });

    // ВСТАНОВЛЕННЯ КУКИ (Критично важливо для Android)
    // Це дозволить JavaNetCookieJar в Android автоматично зберегти сесію
  response.cookies.set('session_token', user.login, { 
  httpOnly: true,
  secure: false, 
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 
});
    return response;

  } catch (error: any) {
    console.error("КРИТИЧНА ПОМИЛКА НА СЕРВЕРІ:", error.message);
    return NextResponse.json({ success: false, message: "Внутрішня помилка сервера" }, { status: 500 });
  }
}