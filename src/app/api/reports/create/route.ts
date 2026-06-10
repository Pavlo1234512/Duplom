import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BattleReport from '@/models/BattleReport';
import User from '@/models/User'; 
import { parseMilitaryReport } from '@/lib/ai';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Визначаємо інтерфейс для втрат, щоб уникнути помилок 'any'
interface LossItem {
  [key: string]: any;
  unit?: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    // 1. Отримуємо назву підрозділу автора
    let userUnit = (session?.user as any)?.unit;
    
    if (!userUnit && session?.user?.id) {
      const userFromDb = await User.findById(session.user.id).select("unit");
      userUnit = userFromDb?.unit || "Невідомий підрозділ";
    } else if (!userUnit) {
      userUnit = "Невідомий підрозділ";
    }

    const body = await req.json();
    const rawText = body.narrative_summary;

    if (!rawText) {
      return NextResponse.json({ error: "Немає тексту донесення" }, { status: 400 });
    }

    // 2. Аналіз тексту через AI
    const enhancedText = `Аналізуй текст донесення. 
    ВАЖЛИВО: Твій підрозділ - "${userUnit}". Всі дані в масивах 'unit' повинні відповідати саме "${userUnit}". 
    Не використовуй назви інших підрозділів, якщо вони згадані в тексті. 
    Текст донесення: ${rawText}`;
    
    const aiAnalysis = await parseMilitaryReport(enhancedText);

    if (!aiAnalysis) {
      return NextResponse.json({ error: "Не вдалося розпізнати дані через AI" }, { status: 500 });
    }

    // 3. Формуємо дані звіту з типізацією
    // Використовуємо інтерфейс LossItem для чіткого визначення типу
    const reportData = {
      ...aiAnalysis,
      reporting_unit: userUnit,
      
      own_personnel_losses: (aiAnalysis.own_personnel_losses || []).map((item: LossItem) => ({
        ...item,
        unit: userUnit 
      })),
      
      own_equipment_losses: (aiAnalysis.own_equipment_losses || []).map((item: LossItem) => ({
        ...item,
        unit: userUnit
      })),
      
      is_processed: true,
      status: 'active'
    };

    console.log("DEBUG: Зберігаємо звіт для підрозділу:", reportData.reporting_unit);

    // 4. Зберігаємо звіт
    const newReport = new BattleReport(reportData);
    await newReport.save();

    return NextResponse.json({ success: true, id: newReport._id });
    
  } catch (error: unknown) {
    console.error("КРИТИЧНА ПОМИЛКА:", error);
    const message = error instanceof Error ? error.message : "Невідома помилка";
    return NextResponse.json({ error: `Помилка сервера: ${message}` }, { status: 500 });
  }
}