import { NextResponse } from 'next/server';
import { parseCombatReport } from '@/lib/ai';

export async function GET() {
  const testData = "Втрати: 2 одиниці техніки, 1 поранений. Підрозділ утримує позиції.";
  const analysis = await parseCombatReport(testData);
  
  return NextResponse.json({ 
    input: testData,
    ai_analysis: analysis 
  });
}