import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Report from '@/models/BattleReport';
import { parseMilitaryReport } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 1. АВТОРИЗАЦІЯ
    let login = null;
    const sessionToken = req.cookies.get('session_token')?.value;

    if (sessionToken) {
      login = sessionToken;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.login) {
        login = token.login;
      }
    }

    if (!login) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. ОТРИМАННЯ ДАНИХ
    const body = await req.json();
    const text = body.rawText;
    
    if (!text) {
      return NextResponse.json({ error: "Текст звіту відсутній" }, { status: 400 });
    }

    // 3. ЗАПУСК ФОНОВОЇ ОБРОБКИ
    processReportInBackground(text, login, body).catch(err => 
      console.error("Фонова помилка ШІ:", err)
    );

    return NextResponse.json({ success: true, message: "Звіт прийнято в обробку" });
    
  } catch (error: any) {
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}

async function processReportInBackground(text: string, login: string, body: any) {
  try {
    const aiData = await parseMilitaryReport(text);
    
    // Перевірка: чи прийшли взагалі дані
    if (!aiData || Object.keys(aiData).length === 0) {
      console.error("ШІ не повернув даних або помилка парсингу!");
      return;
    }

    console.log("Дані від ШІ для збереження:", JSON.stringify(aiData, null, 2));

    const stringifyValue = (val: any): string => {
      if (val === undefined || val === null) return "Немає даних";
      return String(val);
    };

    const reportData = {
      header: {
        from_unit: body.unit || "ВІТІ",
        time_report: new Date(),
        report_type: 'БОЙОВЕ ДОНЕСЕННЯ'
      },
      location: {
        area_description: aiData.area_description || "Район не вказано"
      },
      narrative_summary: aiData.narrative_summary || text.substring(0, 200),
      
      ai_analysis: {
        p1_1: stringifyValue(aiData.p1_1),
        p1_2: stringifyValue(aiData.p1_2),
        p1_3: stringifyValue(aiData.p1_3),
        p1_4: stringifyValue(aiData.p1_4),
        p1_5: stringifyValue(aiData.p1_5),
        p1_6: stringifyValue(aiData.p1_6),
        p1_7: stringifyValue(aiData.p1_7),
        p1_8: stringifyValue(aiData.p1_8),
        p1_9: stringifyValue(aiData.p1_9),
        p1_10: stringifyValue(aiData.p1_10),
        p2: stringifyValue(aiData.p2),
        p3: stringifyValue(aiData.p3),
        p5: stringifyValue(aiData.p5_1),
        chronology: stringifyValue(aiData.chronology),
        
        // Перевірка на число, якщо ШІ прислав рядок "2"
     p4_dead: parseInt(String(aiData.p4_dead)) || 0,
        p4_wound: parseInt(String(aiData.p4_wound)) || 0,
        p4_2: stringifyValue(aiData.p4_2), // Це тепер рядок (техніка)
        p4_3: stringifyValue(aiData.p4_3)  // Це тепер рядок (БПЛА)
      },
      is_processed: true,
      status: 'active'
    };

    await Report.create(reportData);
    console.log("Звіт успішно збережено в БД!");
    
  } catch (e: any) {
    if (e.name === 'ValidationError') {
      console.error("Помилка валідації Mongoose:", JSON.stringify(e.errors, null, 2));
    }
    console.error("КРИТИЧНА ПОМИЛКА:", e);
  }
}