"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/reports/grouped')
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження:", err);
        setLoading(false);
      });
  }, []);

  // Фільтрація за назвою підрозділу
  const filteredData = data.filter((group) =>
    (group._id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-xl font-bold animate-pulse">Завантаження аналітики...</p>
      </main>
    );
  }

  return (
    <main className="p-8 bg-[#F4F6F4] min-h-screen text-[#1B2E1E]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Вибір підрозділу</h1>
          <p className="text-[#556B2F] font-medium mt-2">Оберіть підрозділ за його офіційною назвою</p>
          
          {/* Поле пошуку */}
          <input
            type="text"
            placeholder="Пошук підрозділу..."
            className="mt-6 w-full md:w-1/3 p-4 rounded-xl border border-[#A3B899]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>
        
        {filteredData.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#A3B899]/30 text-center">
            <p className="text-xl font-bold text-[#556B2F]">Підрозділів не знайдено.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((group) => (
              <Link 
                key={group._id} 
                href={`/analytics/${encodeURIComponent(group._id)}`}
                className="block h-full"
              >
                {/* Картка з фіксованим стилем */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#A3B899]/30 hover:border-[#4CAF50] transition-all hover:shadow-lg h-full flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#A3B899] uppercase tracking-widest mb-2 block">Підрозділ</span>
                    <h2 className="text-xl font-black uppercase tracking-tight min-h-[3.5rem]">
                      {group._id || "Невідомий підрозділ"}
                    </h2>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-[#F4F6F4]">
                    <p className="text-[#1B2E1E] font-black text-4xl">
                      {group.count || 0}
                    </p>
                    <p className="text-[#556B2F] font-bold text-xs uppercase tracking-wider mt-1">активних донесень</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}