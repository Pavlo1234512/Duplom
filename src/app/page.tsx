"use client";
import React, { useEffect, useState } from 'react';

interface Report {
  _id: string;
  unit: string;
  location: string;
  enemy_killed: number;
  our_killed: number;
  our_wounded: number;
  vehicles: { count: number; detail: string };
  infrastructure: { count: number; detail: string };
  createdAt: string;
}

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Розрахунок загальної статистики
  const totals = reports.reduce((acc, curr) => ({
    enemyKilled: acc.enemyKilled + (Number(curr.enemy_killed) || 0),
    ourKilled: acc.ourKilled + (Number(curr.our_killed) || 0),
    ourWounded: acc.ourWounded + (Number(curr.our_wounded) || 0),
    vehicles: acc.vehicles + (Number(curr.vehicles?.count) || 0),
    infrastructure: acc.infrastructure + (Number(curr.infrastructure?.count) || 0),
  }), { enemyKilled: 0, ourKilled: 0, ourWounded: 0, vehicles: 0, infrastructure: 0 });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#05070a]">
      <div className="text-blue-500 animate-pulse font-mono uppercase tracking-[0.3em] text-xs">
        Система ініціалізації бази даних...
      </div>
    </div>
  );

  return (
    // Видалено <aside>, бо він вже є у твойому layout.tsx
    <main className="flex-1 p-8 bg-[#05070a] min-h-screen overflow-y-auto">
      {/* Заголовок панелі */}
      <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            СИТУАЦІЙНИЙ ЦЕНТР <span className="text-blue-600">ВІТІ</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mt-2 opacity-60">
            Система моніторингу бойових донесень v2.5
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">STATUS: ONLINE</span>
          </div>
          <p className="text-xs font-mono text-blue-400 opacity-80" suppressHydrationWarning>
            {new Date().toLocaleTimeString('uk-UA')}
          </p>
        </div>
      </header>

      {/* Віджети статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-12">
        <StatCard label="Ворог (200)" value={totals.enemyKilled} color="text-red-500" border="border-red-600" />
        <StatCard label="Наші (200)" value={totals.ourKilled} color="text-yellow-500" border="border-yellow-600" />
        <StatCard label="Наші (300)" value={totals.ourWounded} color="text-blue-400" border="border-blue-500" />
        <StatCard label="Техніка" value={totals.vehicles} color="text-orange-500" border="border-orange-600" />
        <StatCard label="Об'єкти" value={totals.infrastructure} color="text-purple-500" border="border-purple-600" />
      </div>

      {/* Основна таблиця - Журнал */}
      <div className="bg-[#0d1117]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-white">Журнал бойових дій</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Усього записів:</span>
            <span className="text-[11px] bg-blue-600 text-white px-4 py-1.5 rounded-full font-black uppercase shadow-lg shadow-blue-600/20">
              {reports.length} Звітів
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.25em] border-b border-white/5">
                <th className="p-8 font-black">Час / Підрозділ</th>
                <th className="p-8 font-black">Локація</th>
                <th className="p-8 font-black text-red-500">Втрати ворога</th>
                <th className="p-8 font-black text-yellow-500 text-right">Наші (200 / 300)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-blue-600/[0.03] transition-all group">
                  <td className="p-8">
                    <p className="text-[10px] text-slate-600 mb-1 font-mono tracking-wider">
                      {new Date(report.createdAt).toLocaleString('uk-UA')}
                    </p>
                    <p className="font-black text-blue-500 uppercase italic text-sm group-hover:text-blue-400 transition-colors">
                      {report.unit}
                    </p>
                  </td>
                  <td className="p-8 text-xs font-bold text-slate-400 italic uppercase tracking-tight">
                    {report.location}
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-red-600 text-2xl tracking-tighter">-{report.enemy_killed}</span>
                      <span className="text-[9px] font-black text-red-600/40 uppercase">KIA</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-yellow-500 font-black text-lg">{report.our_killed}</span>
                      <span className="text-white/10 font-thin text-2xl">/</span>
                      <span className="text-blue-400 font-black text-lg">{report.our_wounded}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reports.length === 0 && (
            <div className="p-20 text-center text-slate-700 font-black uppercase italic tracking-widest text-xs opacity-20">
              Дані відсутні або завантажуються...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  border: string;
}

function StatCard({ label, value, color, border }: StatCardProps) {
  return (
    <div className={`bg-white/[0.02] border-t-2 ${border} p-6 rounded-3xl hover:bg-white/[0.04] hover:translate-y-[-4px] transition-all duration-300 shadow-xl`}>
      <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 mb-3 opacity-80">{label}</p>
      <div className="flex items-end justify-between">
        <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-[8px] text-slate-700 font-black uppercase tracking-tighter mb-1">одиниць</span>
      </div>
    </div>
  );
}