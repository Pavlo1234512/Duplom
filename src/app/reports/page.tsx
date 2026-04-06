"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Plus, ChevronRight, 
  Activity, Clock, AlertTriangle, Layers, Loader2
} from "lucide-react";
import Link from "next/link";

interface Report {
  _id: string;
  title: string;
  unit: string;
  createdAt: string;
  status: 'critical' | 'normal' | 'pending';
  author: string;
}

// ОСНОВНА ФУНКЦІЯ ПОВИННА МАТИ EXPORT DEFAULT
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Усі");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Створення динамічних вкладок на основі отриманих даних
  const dynamicUnits = ["Усі", ...Array.from(new Set(reports.map(r => r.unit?.toUpperCase() || "НЕВІДОМО")))];

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          // Переконуємося, що дані - це масив
          setReports(Array.isArray(data.reports) ? data.reports : []);
        }
      } catch (err) {
        console.error("Помилка завантаження звітів:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const filteredReports = activeTab === "Усі" 
    ? reports 
    : reports.filter(r => r.unit?.toUpperCase() === activeTab);

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-mono uppercase italic">
      
      {/* ВЕРХНЯ ПАНЕЛЬ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Реєстр <span className="text-blue-600">донесень</span></h1>
            <p className="text-[10px] text-blue-500/50 font-black tracking-[0.3em] not-italic mt-1">
              Активних документів: {reports.length}
            </p>
          </div>
        </div>

        <Link href="/reports/create">
          <button className="group bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl flex items-center gap-3 text-[12px] transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
            Створити донесення
          </button>
        </Link>
      </div>

      {/* ДИНАМІЧНІ ТАБИ (БРИГАДИ) */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {dynamicUnits.map((unit) => (
          <button
            key={unit}
            onClick={() => setActiveTab(unit)}
            className={`px-6 py-3 rounded-xl border text-[11px] font-black transition-all whitespace-nowrap
              ${activeTab === unit 
                ? 'border-blue-600 bg-blue-600/10 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                : 'border-white/5 bg-white/5 text-zinc-500 hover:border-white/20'}`}
          >
            {unit}
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] text-zinc-600 tracking-[0.5em]">Синхронізація з базою...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report._id} 
              className="group relative bg-[#0d1117] border border-white/5 p-6 rounded-3xl hover:border-blue-600/50 transition-all cursor-pointer overflow-hidden shadow-xl"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                ${report.status === 'critical' ? 'bg-red-600' : 
                  report.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-600'}`} 
              />

              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-blue-500 text-[9px] font-black tracking-widest">{report.unit?.toUpperCase()}</span>
                  <span className="text-zinc-600 text-[9px]">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className={`p-2 rounded-lg ${report.status === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-zinc-500'}`}>
                  {report.status === 'critical' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                </div>
              </div>

              <h3 className="text-[13px] leading-tight mb-6 group-hover:text-blue-400 transition-colors h-10 line-clamp-2 uppercase font-black">
                {report.title}
              </h3>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 italic lowercase">Доповів: {report.author}</span>
                <ChevronRight size={14} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ЯКЩО НЕМАЄ ЗВІТІВ */}
      {!loading && filteredReports.length === 0 && (
        <div className="text-center py-32 bg-[#0d1117]/30 rounded-[40px] border border-dashed border-white/5">
          <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
          <p className="text-zinc-600 text-[10px] tracking-widest font-black uppercase">Архів порожній. Нових донесень не знайдено.</p>
        </div>
      )}
    </div>
  );
}