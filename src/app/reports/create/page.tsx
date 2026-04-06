"use client";

import { useSession } from "next-auth/react";
import { ArrowLeft, Send, Loader2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [rawAiText, setRawAiText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    unit: "",
    content: "",
    losses200: 0,
    losses300: 0,
    losses500: 0,
    ammoLevel: "1.0",
    fuelLevel: "1.0",
    location: "",
    status: "normal"
  });

  // ФУНКЦІЯ ПАРСИНГУ ТЕКСТУ ЧЕРЕЗ ШІ (БЕЗ ЗБЕРЕЖЕННЯ В БД)
  const handleAiFill = async () => {
    if (!rawAiText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/analyze/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawAiText }),
      });
      const data = await res.json();
      if (res.ok) {
        // Оновлюємо стан форми отриманими даними
        setFormData(prev => ({ ...prev, ...data.parsed }));
      }
    } catch (err) {
      alert("ПОМИЛКА МОДУЛЯ АНАЛІЗУ");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, author: session?.user?.name }),
      });
      if (res.ok) router.push('/reports');
    } catch (err) {
      alert("ПОМИЛКА ЗБЕРЕЖЕННЯ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-mono uppercase italic">
      <div className="max-w-4xl mx-auto">
        <Link href="/reports" className="flex items-center gap-2 text-zinc-600 hover:text-white mb-8 transition-all">
          <ArrowLeft size={16} /> <span className="text-[10px] font-black tracking-widest">ПОВЕРНУТИСЯ</span>
        </Link>

        {/* ШІ-АСИСТЕНТ (ПЕРШИЙ КРОК) */}
        <div className="mb-10 bg-blue-600/5 border border-blue-600/20 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <Sparkles size={18} />
            <h2 className="text-xs font-black tracking-widest">ШВШИДКА ОБРОБКА ТЕКСТУ (ШІ)</h2>
          </div>
          <textarea 
            value={rawAiText}
            onChange={(e) => setRawAiText(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm mb-4 focus:border-blue-600 outline-none resize-none lowercase"
            placeholder="вставте сирий текст донесення..."
            rows={3}
          />
          <button 
            type="button"
            onClick={handleAiFill}
            disabled={aiLoading}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black text-[9px] tracking-[0.2em] transition-all"
          >
            {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
            АВТОЗАПОВНЕННЯ ФОРМИ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] text-zinc-500 font-black">ТЕМА</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0d1117] border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none"/>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-zinc-500 font-black">ПІДРОЗДІЛ</label>
              <input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-[#0d1117] border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none"/>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[8px] text-red-500 mb-1 font-black">200 (ЗАГИБЛІ)</p>
              <input type="number" value={formData.losses200} onChange={e => setFormData({...formData, losses200: +e.target.value})} className="bg-transparent text-2xl font-black w-full outline-none text-red-500"/>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[8px] text-yellow-500 mb-1 font-black">300 (ПОРАНЕНІ)</p>
              <input type="number" value={formData.losses300} onChange={e => setFormData({...formData, losses300: +e.target.value})} className="bg-transparent text-2xl font-black w-full outline-none text-yellow-500"/>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-[8px] text-zinc-500 mb-1 font-black">500 (СЗЧ)</p>
              <input type="number" value={formData.losses500} onChange={e => setFormData({...formData, losses500: +e.target.value})} className="bg-transparent text-2xl font-black w-full outline-none text-zinc-400"/>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-zinc-500 font-black">ЗМІСТ</label>
            <textarea rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-[#0d1117] border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none resize-none lowercase"/>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl font-black tracking-[0.4em] transition-all shadow-xl shadow-blue-900/20">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "ЗБЕРЕГТИ ДОНЕСЕННЯ"}
          </button>
        </form>
      </div>
    </div>
  );
}