import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    // Тут можна додати перевірку на адміна для безпеки

    await dbConnect();
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}