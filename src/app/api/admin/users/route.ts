import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // 1. Отримуємо куку, яку ми встановили в login.ts
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token');

    // 2. Перевіряємо, чи існує вона
    if (!sessionToken || sessionToken.value !== 'authenticated_user_session') {
      return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
    }

    // 3. Якщо все ок — віддаємо дані
    await dbConnect();
    
    // Примітка: ви робили User.find(), це повертає МАСИВ. 
    // Якщо Android очікує об'єкт користувача, змініть на .findOne()
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
    
  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}