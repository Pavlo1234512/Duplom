"use client";
import React, { useEffect, useState } from 'react';

interface Report {
  _id: string;
  unit: string;
  location: string;
  enemy_killed: number;
  our_killed: number;
  our_wounded: number;
  vehicles: { count: number; detail: string; };
  infrastructure: { count: number; detail: string; };
  rawText: string;
  createdAt: string;
}

export default function ArchivePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
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

  const filteredReports = reports.filter(r => 
    r.unit?.toLowerCase().includes(search.toLowerCase()) || 
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-sans">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          АРХІВ <span className="text-blue-600">ЗВІТІВ</span>
        </h1>
        <input 
          type="text" 
          placeholder="Пошук підрозділу..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0d1117] border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-blue-600 outline-none w-64"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-blue-500 animate-pulse uppercase font-mono">Доступ до бази даних...</div>
        ) : filteredReports.map((report) => (
          <div key={report._id} className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-400 font-bold uppercase text-xs mb-1">{report.unit}</p>
                <h3 className="text-xl font-black uppercase tracking-tight">{report.location}</h3>
                <p className="text-[10px] text-slate-600 mt-2 italic">
                  {new Date(report.createdAt).toLocaleString('uk-UA')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Ліквідовано</p>
                <p className="text-2xl font-black text-red-600">-{report.enemy_killed}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <p className="text-[10px] text-orange-500 font-bold uppercase">Техніка: {report.vehicles?.count}</p>
                <p className="text-[11px] text-slate-400 italic">{report.vehicles?.detail}</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-500 font-bold uppercase">Об'єкти: {report.infrastructure?.count}</p>
                <p className="text-[11px] text-slate-400 italic">{report.infrastructure?.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}