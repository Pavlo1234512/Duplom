import dbConnect from '@/lib/db';
import BattleReport from '@/models/BattleReport';

export default async function UnitPage({ params }: { params: { unitName: string } }) {
  await dbConnect();

  // 1. Витягуємо дані. 
  // Використовуємо .lean(), щоб отримати чистий об'єкт, який легше рендерити в React.
  const reports = await BattleReport.find({ "header.from_unit": params.unitName })
    .sort({ "header.time_report": -1 })
    .lean();

  return (
    <main className="p-8">
      <h1 className="text-4xl font-black uppercase text-[#1B2E1E] mb-8 italic">
        Підрозділ: <span className="text-[#4CAF50]">{params.unitName}</span>
      </h1>
      
      <div className="grid gap-4">
        {reports.map((r: any) => (
           <div 
             key={r._id.toString()} 
             className="bg-white p-6 rounded-lg border border-[#A3B899]/30 shadow-sm"
           >
             {/* Відображаємо дані з вашої складної моделі */}
             <div className="flex justify-between mb-4 border-b pb-2">
                <p className="font-bold text-[#556B2F]">
                   Дата: {new Date(r.header.time_report).toLocaleDateString()}
                </p>
                <p className="text-xs uppercase bg-[#E8EBE8] px-2 py-1 rounded">
                   {r.header.report_type}
                </p>
             </div>
             
             <p className="text-[#1B2E1E] text-sm mb-4">{r.narrative_summary}</p>

             <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block font-bold text-red-600">Втрати ворога (о/с):</span>
                  {r.enemy_losses_inflicted.personnel_killed}
                </div>
                <div>
                  <span className="block font-bold text-yellow-700">Наші втрати (о/с):</span>
                  {r.own_losses.personnel_killed}
                </div>
             </div>
           </div>
        ))}
      </div>
    </main>
  );
}