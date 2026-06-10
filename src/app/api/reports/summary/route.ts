import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BattleReport from "@/models/BattleReport";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { unit, date } = await req.json(); // Очікуємо формат "YYYY-MM-DD_YYYY-MM-DD"
    await dbConnect();

    // 1. Парсинг дат (як у генераторі docx)
    const [fromStr, toStr] = date.split('_');
    const startDate = new Date(fromStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(toStr || fromStr);
    endDate.setHours(23, 59, 59, 999);

    // 2. Отримання звітів
    const reports = await BattleReport.find({
      "header.from_unit": unit,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    if (reports.length === 0) {
      return NextResponse.json({ error: "Немає даних за вибраний період" }, { status: 404 });
    }

    // 3. Кодова агрегація (рахуємо цифри в коді, не довіряємо це AI)
    const stats = reports.reduce((acc, r: any) => {
      const data = r.ai_analysis || {};
      acc.dead += Number(data.p4_dead) || 0;
      acc.wound += Number(data.p4_wound) || 0;
      acc.reportsCount += 1;
      return acc;
    }, { dead: 0, wound: 0, reportsCount: 0 });

    // 4. Підготовка даних для AI (передаємо лише сухі факти)
    const context = reports.map(r => {
      const data = (r as any).ai_analysis || {};
      return `Час: ${new Date((r as any).createdAt).toLocaleString()}. 
              Бойові дії: ${data.p3 || "н/д"}. 
              Втрати: ${data.p4_dead || 0}/${data.p4_wound || 0}. 
              Техніка: ${data.p4_2 || "н/д"}.`;
    }).join("\n");

    // 5. Аналітика через AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Ти — військовий аналітик штабу. На основі сухих фактів та статистики склади короткий аналітичний висновок для начальника штабу." 
        },
        { 
          role: "user", 
          content: `Статистика за період: ${JSON.stringify(stats)}. 
                    Деталі: ${context}. 
                    Висновок має бути структурований: 1. Загальна оцінка ситуації. 2. Аналіз втрат. 3. Рекомендації.` 
        }
      ]
    });

    return NextResponse.json({
      success: true,
      stats,
      summary: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("SUMMARY_ERROR:", error);
    return NextResponse.json({ error: "Помилка при генерації звіту" }, { status: 500 });
  }
}