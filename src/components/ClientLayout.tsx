"use client";
import React, { useState } from "react";
import { Palette, Monitor, Zap, Save, RefreshCw } from "lucide-react";

export default function AppearancePage() {
  const [accent, setAccent] = useState("blue");
  const [isSaving, setIsSaving] = useState(false);

  const themes = [
    { name: "TACTICAL BLUE", color: "bg-blue-600", border: "border-blue-600", key: "blue" },
    { name: "COMBAT RED", color: "bg-red-600", border: "border-red-600", key: "red" },
    { name: "TERRAIN GREEN", color: "bg-emerald-600", border: "border-emerald-600", key: "emerald" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="p-10 max-w-5xl mx-auto text-white min-h-screen">
      {/* Header */}
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
          Оформлення <span className="text-blue-600">систем</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3 italic">
          Візуальна конфігурація інтерфейсу STRATCOM AI V2.5
        </p>
      </header>

      <div className="grid gap-8">
        {/* Color Scheme Section */}
        <section className="bg-[#0a0d12] p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Palette className="text-blue-600" size={24} />
            <h2 className="font-black italic uppercase tracking-widest text-lg">Колірна схема інтерфейсу</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setAccent(t.key)}
                className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-6 ${
                  accent === t.key 
                    ? `border-white bg-white/5 shadow-[0_0_30px_-10px_${t.border}]` 
                    : "border-white/5 bg-[#05070a] hover:border-white/20"
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl ${t.color} shadow-lg`} />
                <span className="text-[11px] font-black uppercase tracking-widest">{t.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Display Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-[#0a0d12] p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="text-slate-400" size={20} />
              <h2 className="font-black italic uppercase tracking-widest text-sm">Відображення</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-[#05070a]">
                <span className="text-[10px] font-bold uppercase italic text-slate-400">Компактний режим</span>
                <div className="w-10 h-5 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-700 transition-colors"></div>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-[#05070a]">
                <span className="text-[10px] font-bold uppercase italic text-slate-400">Анімації HUD</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full cursor-pointer relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0a0d12] p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-yellow-600" size={20} />
              <h2 className="font-black italic uppercase tracking-widest text-sm">Продуктивність</h2>
            </div>
            <p className="text-[11px] text-slate-500 italic leading-relaxed mb-6">
              Примусове відключення фонових процесів рендерингу для підвищення швидкодії системи на термінальних вузлах.
            </p>
            <button className="w-full py-3 text-[10px] border border-white/10 rounded-xl hover:bg-white/5 transition-all font-black uppercase italic tracking-widest">
              Оптимізувати графіку
            </button>
          </section>
        </div>

        {/* Save Action */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 w-full bg-blue-600 p-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? "ЗБЕРЕЖЕННЯ..." : "ЗБЕРЕГТИ НАЛАШТУВАННЯ"}
        </button>
      </div>
    </div>
  );
}