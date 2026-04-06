import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Отримуємо всіх користувачів зі статусом PENDING
    const requests = await db
      .collection("users")
      .find({ status: "PENDING" })
      .sort({ createdAt: -1 }) // Нові зверху
      .toArray();

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Помилка отримання заявок:", error);
    return NextResponse.json({ error: "Помилка бази даних" }, { status: 500 });
  }
}