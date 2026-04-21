import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";

function corsResponse(data: any, status: number) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const login = data.login?.trim().toLowerCase() || "";
    const password = data.password || "";
    const token = data.code || "";

    // Обов'язково додаємо .select("+password")
    const user = await User.findOne({ login }).select("+password");

    if (!user) return corsResponse({ error: "КОРИСТУВАЧА НЕ ЗНАЙДЕНО" }, 401);
    if (user.status !== "APPROVED") return corsResponse({ error: "АКАУНТ НЕ АКТИВОВАНО" }, 403);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return corsResponse({ error: "НЕВІРНИЙ ПАРОЛЬ" }, 401);

    if (user.twoFactorSecret) {
      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 1
      });
      if (!isTokenValid) return corsResponse({ error: "НЕВІРНИЙ КОД 2FA" }, 401);
    }

    // Віддаємо повний набір даних
    return corsResponse({
      success: true,
      user: {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        role: user.role || "Курсант", 
        unit: user.unit || "ВІТІ ім. Героїв Крут"
      }
    }, 200);

  } catch (error: any) {
    return corsResponse({ error: "ПОМИЛКА СЕРВЕРА: " + error.message }, 500);
  }
}