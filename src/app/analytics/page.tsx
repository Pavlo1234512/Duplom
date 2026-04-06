"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Zap, Info } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      });

      const data = await res.json();
      
      if (res.ok) {
        router.push('/reports');
        router.refresh();
      } else {
        setError(data.error || "ПОМИЛКА ОБРОБКИ. ПЕРЕВІРТЕ ФОРМАТ ТЕКСТУ.");
      }
    } catch (err) {
      setError("СЕРВЕР АНАЛІЗУ STRATCOM НЕДОСТУПНИЙ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 font-mono uppercase italic">
      <div className="max-w-5xl mx-auto">
        <Link href="/reports" className="inline-flex items-center gap-2 text-zinc-600 hover:text-blue-500 mb-10 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black tracking-[0.3em]">ПОВЕРНУТИСЯ ДО РЕЄСТРУ</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-2 h-12 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic">
              AI <span className="text-blue-600">ANALYTICS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl text-blue-400 text-[10px] font-black tracking-widest">
            <Sparkles size={14} /> МОДУЛЬ ОБРОБКИ ДАНИХ
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[32px] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="relative w-full h-[500px] bg-[#0d1117] border border-white/5 rounded-[32px] p-8 text-xl font-mono focus:border-blue-600 outline-none transition-all shadow-2xl resize-none placeholder:text-zinc-800 lowercase"
                placeholder="вставте текст оперативного донесення для автоматичного розпізнавання..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !text}
              className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 py-10 rounded-2xl font-black text-xl tracking-[0.5em] transition-all active:scale-[0.98] shadow-2xl shadow-blue-900/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>ЗАПУСТИТИ АНАЛІЗ <Zap size={24} className="fill-current" /></>}
              </div>
            </button>
            
            {error && <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-500 font-black text-center text-xs animate-pulse">⚠ {error}</div>}
          </div>

          <div className="space-y-6 lowercase">
            <div className="bg-[#0d1117] border border-white/5 p-8 rounded-[32px]">
              <div className="flex items-center gap-3 mb-6 text-blue-500">
                <Info size={18} />
                <h3 className="text-xs font-black tracking-[0.2em] uppercase italic">ІНСТРУКЦІЯ</h3>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-8">
                система автоматично розпізнає втрати (200/300), номер донесення та підрозділ.
              </p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-[9px] font-mono text-zinc-400">
                приклад: "донесення №5. 1-ша рота. втрати за ніч: 200-1, 300-4."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}