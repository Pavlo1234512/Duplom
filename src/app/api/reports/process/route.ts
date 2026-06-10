import { NextResponse } from 'next/server';
import { processUnparsedReports } from '@/lib/worker'; // Припустимо, у вас є така функція

export async function GET() {
  try {
    // Викликаємо функцію, яка пробіжиться по всіх звітах
    await processUnparsedReports(); 
    
    return NextResponse.json({ message: "Усі нові звіти успішно проаналізовані!" });
  } catch (error) {
    console.error("Помилка воркера:", error);
    return NextResponse.json({ error: "Помилка при обробці" }, { status: 500 });
  }
}