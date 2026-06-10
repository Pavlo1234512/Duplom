// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BattleReport from '@/models/BattleReport';

export async function GET() {
  try {
    await dbConnect();
    const reports = await BattleReport.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Помилка:", error);
    return NextResponse.json({ error: "Помилка" }, { status: 500 });
  }
}