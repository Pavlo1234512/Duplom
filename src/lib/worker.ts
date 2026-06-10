import dbConnect from '@/lib/db';
import BattleReport from '@/models/BattleReport'; // Використовуємо вашу модель
import { parseMilitaryReport } from '@/lib/ai';

export async function processUnparsedReports() {
  await dbConnect();

  // Шукаємо звіти, які ще не пройшли аналіз (is_processed: false)
  // Припускаємо, що narrative_summary містить текст, який треба проаналізувати
  const unprocessed = await BattleReport.find({ is_processed: { $ne: true } });

  for (const report of unprocessed) {
    try {
      console.log(`Початок аналізу звіту ID: ${report._id}`);
      
      // Парсимо текст (використовуємо narrative_summary як джерело)
      const aiData = await parseMilitaryReport(report.narrative_summary);
      
      if (aiData) {
        // Оновлюємо звіт: додаємо ai_analysis та ставимо прапорець is_processed: true
        await BattleReport.updateOne(
          { _id: report._id }, 
          { 
            ai_analysis: aiData, 
            is_processed: true,
            status: 'processed'
          }
        );
        console.log(`Звіт ${report._id} успішно проаналізовано.`);
      }
    } catch (err) {
      console.error(`Помилка обробки звіту ${report._id}:`, err);
    }
  }
}