import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BattleReport from '@/models/BattleReport';
import { generateAiReport } from '@/lib/ai';

export async function GET(req: Request) {
  // Перевірка секретного ключа для безпеки
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // 1. Отримуємо список усіх активних підрозділів
 const units = (await BattleReport.distinct("unit")) as string[];

for (const unit of units) {
  // 2. Тепер TypeScript знає, що 'unit' - це рядок
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const reports = await BattleReport.find({ unit, createdAt: { $gte: yesterday } }).lean();

  if (reports.length > 0) {
    // 3. Тепер помилки не буде, бо unit точно string
    const reportText = await generateAiReport(reports, unit);
    console.log(`Звіт для ${unit} згенеровано автоматично.`);
  }
}

  return NextResponse.json({ success: true, message: "Автоматична генерація завершена" });
}