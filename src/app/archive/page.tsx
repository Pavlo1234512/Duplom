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
    <div className="p-8 bg-[#F4F6F4] min-h-screen text-[#1B2E1E] font-sans">
      <div className="flex justify-between items-center mb-10 border-b border-[#A3B899]/30 pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          АРХІВ <span className="text-[#4CAF50]">ЗВІТІВ</span>
        </h1>
        <input 
          type="text" 
          placeholder="Пошук підрозділу..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-[#81C784] text-[#1B2E1E] rounded-xl px-4 py-2 text-sm focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none w-64 placeholder:text-[#A3B899]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-[#556B2F] animate-pulse uppercase font-mono text-sm font-bold">Доступ до бази даних...</div>
        ) : filteredReports.map((report) => (
          <div key={report._id} className="bg-white border border-[#81C784] rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#556B2F] font-bold uppercase text-xs mb-1">{report.unit}</p>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#1B2E1E]">{report.location}</h3>
                <p className="text-[10px] text-[#A3B899] mt-2 italic">
                  {new Date(report.createdAt).toLocaleString('uk-UA')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#A3B899] uppercase font-bold">Ліквідовано</p>
                <p className="text-2xl font-black text-[#8B0000]">{report.enemy_killed}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#A3B899]/20 pt-4">
              <div>
                <p className="text-[10px] text-[#556B2F] font-bold uppercase">Техніка: {report.vehicles?.count}</p>
                <p className="text-[11px] text-[#1B2E1E] italic mt-0.5">{report.vehicles?.detail}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#556B2F] font-bold uppercase">Об'єкти: {report.infrastructure?.count}</p>
                <p className="text-[11px] text-[#1B2E1E] italic mt-0.5">{report.infrastructure?.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}