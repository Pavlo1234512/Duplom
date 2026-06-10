"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    // Завантажуємо профіль для отримання даних автора та підрозділу
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Помилка завантаження профілю", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    
    setLoading(true);

    const payload = {
      unit: profile?.unit || "НЕВІДОМИЙ",
      authorName: `${profile?.lastName || ""} ${profile?.firstName || ""}`.trim(),
      narrative_summary: rawText,
      is_processed: false 
    };

    try {
      const res = await fetch('/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Донесення успішно відправлено на обробку!");
        router.push('/'); 
      } else {
        alert("Помилка при відправці донесення");
      }
    } catch (err) {
      console.error("Помилка відправки:", err);
      alert("Виникла помилка під час запиту");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 bg-[#F4F6F4] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[3rem] border border-[#A3B899]/30 shadow-lg">
        <h1 className="text-2xl font-black uppercase italic mb-8 text-[#1B2E1E]">Створення донесення</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-[#556B2F] tracking-widest ml-1 mb-2 block">
              Введіть текст донесення (AI розпізнає дані автоматично)
            </label>
            <textarea 
              required 
              rows={12}
              // Додано text-[#1B2E1E] для кольору тексту, щоб він був видимим на світлому фоні
              className="w-full p-6 border-2 rounded-[2rem] bg-[#F4F6F4] text-[#1B2E1E] text-sm font-medium outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] transition-all" 
              placeholder="Опишіть події..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-3 bg-[#4CAF50] text-white p-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#43a047] transition-all shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} 
            ВІДПРАВИТИ ДОНЕСЕННЯ
          </button>
        </form>
      </div>
    </main>
  );
}