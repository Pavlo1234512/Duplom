"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReportGenerator from "@/components/ReportGenerator";

export default function UnitReportsPage() {
  const params = useParams();
  const unitParam = params.unit ? decodeURIComponent(params.unit as string) : "";
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!unitParam) return;

    setLoading(true);
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((r: any) => {
          const dbUnit = r.reporting_unit?.toString().toLowerCase().trim() || "";
          const targetUnit = unitParam.toLowerCase().trim();
          return dbUnit.includes(targetUnit) || targetUnit.includes(dbUnit);
        });
        setReports(filtered);
      })
      .catch(err => console.error("Помилка завантаження:", err))
      .finally(() => setLoading(false));
  }, [unitParam]);

  const handleCheckAndGenerate = () => {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    const hasReports = reports.some((r) => {
      const reportDate = new Date(r.createdAt).getTime();
      return reportDate >= from && reportDate <= (to + 86400000);
    });
    if (!hasReports) { setShowError(true); return false; }
    setShowError(false); return true;
  };

  return (
    <main className="p-8 bg-[#F4F6F4] min-h-screen text-[#1B2E1E]">
      <div className="mb-10 border-b border-[#A3B899]/30 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">{unitParam || "Невідомий підрозділ"}</h1>
        <p className="text-[#556B2F] font-bold uppercase tracking-widest text-xs mt-2">Архів бойових донесень</p>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-[#A3B899]">Завантаження даних...</div>
      ) : (
        <>
          <div className="mb-8 p-8 bg-white rounded-3xl border border-[#A3B899]/30 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#A3B899] mb-4">Вибір періоду звітності</h2>
            <div className="flex items-center gap-4 mb-6">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-3 border rounded-2xl bg-[#F4F6F4] text-sm font-bold outline-none" />
              <span className="text-[#A3B899]">—</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-3 border rounded-2xl bg-[#F4F6F4] text-sm font-bold outline-none" />
            </div>
            {showError && <p className="text-red-500 font-bold text-[10px] uppercase mb-4">За вказаний період даних не знайдено!</p>}
            <ReportGenerator 
              units={[unitParam]} 
              selectedDate={`${dateFrom}_${dateTo}`}
              onBeforeGenerate={handleCheckAndGenerate}
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-[#A3B899]/30 p-4 shadow-sm">
            {reports.length > 0 ? (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-[#A3B899] uppercase text-[10px] font-black border-b border-[#A3B899]/20">
                    <th className="p-4">Дата</th>
                    <th className="p-4 text-center">Скиди БПЛА</th>
                    <th className="p-4 text-center">Арт-удари</th>
                    <th className="p-4 text-center">Загиблі (наші)</th>
                    <th className="p-4 text-center">Поранені (наші)</th>
                    <th className="p-4 text-center">Загиблі (ворог)</th>
                    <th className="p-4 text-center">Знищена техніка</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const pers = report.own_personnel_losses?.[0] || {};
                    const equip = report.own_equipment_losses?.[0] || {};
                    const enemyDead = report.enemy_losses?.personnel?.dead || 0;
                    
                    return (
                      <tr key={report._id} className="border-b border-[#A3B899]/10">
                        <td className="p-4 font-bold">{new Date(report.createdAt).toLocaleDateString('uk-UA')}</td>
                        <td className="p-4 text-center">{report.airstrike?.count || 0}</td>
                        <td className="p-4 text-center">{report.shelling?.total_count || 0}</td>
                        <td className="p-4 text-center text-red-600 font-bold">{pers.total_on_shield || 0}</td>
                        <td className="p-4 text-center text-orange-500 font-bold">{pers.w300_total || 0}</td>
                        <td className="p-4 text-center text-black font-bold">{enemyDead}</td>
                        <td className="p-4 text-center font-bold">{equip.destroyed || "0"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-[#A3B899] font-bold py-10">Немає звітів для цього підрозділу.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}