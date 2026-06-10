import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BattleReport from "@/models/BattleReport";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseMilitaryReport } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { rawText, unit } = body;

    if (!rawText) return NextResponse.json({ error: "Немає тексту" }, { status: 400 });

    await dbConnect();

    // 1. Отримуємо дані від ШІ
    const parsedData = await parseMilitaryReport(rawText);
    
    // ВАЖЛИВО: Якщо ШІ повернув пустий об'єкт або помилку
    if (!parsedData || Object.keys(parsedData).length === 0) {
      return NextResponse.json({ error: "ШІ не розпізнав дані у тексті" }, { status: 422 });
    }

    console.log("Дані для збереження:", JSON.stringify(parsedData, null, 2));

    // 2. Створення об'єкта звіту
    const reportData = {
      ...parsedData,
      is_processed: true,
      status: 'active',
      createdAt: new Date()
    };

    // 3. Спроба збереження
    const report = await BattleReport.create(reportData);
    
    return NextResponse.json({ success: true, id: report._id });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error("КРИТИЧНА ПОМИЛКА БЕКЕНДУ:", error);
    return NextResponse.json({ error: `Помилка аналізу: ${errorMessage}` }, { status: 500 });
  }
}