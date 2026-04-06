"use client";
import React, { useEffect, useState } from 'react';
import { User as UserIcon, ShieldCheck, Save, X, Edit3, Loader2, Sun, Moon, Calendar, FileText } from "lucide-react";

interface DataBlockProps {
  label: string;
  value: string;
  theme: 'dark' | 'light';
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  theme: 'dark' | 'light';
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [reportCount, setReportCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [lang, setLang] = useState<'UA' | 'EN'>('UA');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Переконайся, що тут є unit
  const [formData, setFormData] = useState({ 
    lastName: "", firstName: "", rank: "", position: "", unit: "" 
  });

  const t = {
    UA: { pos: "Посада", unit: "Підрозділ", id: "ID", reg: "В системі з", act: "Активність", reports: "Звітів", edit: "Редагувати анкету", save: "Зберегти", rank: "НЕ ВКАЗАНО", sec: "2FA АКТИВНО" },
    EN: { pos: "Position", unit: "Unit", id: "ID", reg: "Since", act: "Activity", reports: "Reports", edit: "Edit Profile", save: "Save", rank: "NOT SET", sec: "2FA ACTIVE" }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as 'UA' | 'EN';
    const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light';
    if (savedLang) setLang(savedLang);
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light-mode', savedTheme === 'light');
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    async function loadData() {
      try {
        const resProfile = await fetch('/api/user/profile', { cache: 'no-store' });
        if (resProfile.ok) {
          const data = await resProfile.json();
          setUser(data);
          // Зчитуємо unit з бази даних (data.unit)
          setFormData({
            lastName: data.lastName || "",
            firstName: data.firstName || "",
            rank: data.rank || "",
            position: data.position || "",
            unit: data.unit || "" 
          });
        }
      } catch (err) {
        console.error("Profile API unreachable");
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }

      fetch('/api/user/stats').then(r => r.json()).then(data => setReportCount(data.count || 0)).catch(() => setReportCount(0));
    }

    loadData();
    return () => clearTimeout(safetyTimer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
  };

  const changeLang = (newLang: 'UA' | 'EN') => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) setIsEditing(false);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#05070a]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-blue-600/50 font-black text-[10px] uppercase tracking-widest animate-pulse">Встановлення зв'язку...</p>
      </div>
    </div>
  );

  return (
    <main className={`flex-1 p-8 min-h-screen transition-all duration-500 ${theme === 'dark' ? 'bg-[#05070a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            {lang === 'UA' ? 'Особова справа' : 'Personnel File'} <span className="text-blue-600">№{user?._id?.slice(-5).toUpperCase() || '—'}</span>
          </h1>
          <div className="flex gap-4">
            <div className={`flex border rounded-2xl p-1 ${theme === 'dark' ? 'bg-[#0d1117] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <button onClick={() => changeLang('UA')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'UA' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>UA</button>
              <button onClick={() => changeLang('EN')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>EN</button>
            </div>
            <button onClick={toggleTheme} className={`p-3 border rounded-2xl transition-all ${theme === 'dark' ? 'bg-[#0d1117] border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className={`border rounded-[2.5rem] p-8 text-center relative overflow-hidden ${theme === 'dark' ? 'bg-[#0d1117] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className={`w-32 h-32 rounded-[2rem] mx-auto mb-6 flex items-center justify-center border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                <UserIcon size={60} className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} />
              </div>
              <h2 className="text-2xl font-black uppercase italic leading-tight">{formData.lastName || "—"}</h2>
              <h3 className="text-lg font-bold uppercase italic text-blue-600 mb-4">{formData.firstName || "—"}</h3>
              <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] pt-4 border-t border-white/5">
                {formData.rank || t[lang].rank}
              </p>
            </div>

            <div className={`border rounded-[2.5rem] p-6 space-y-4 ${theme === 'dark' ? 'bg-[#0d1117] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <Calendar size={18} className="text-blue-500" />
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t[lang].reg}</p>
                  <p className="text-xs font-bold uppercase">12.01.2024</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <FileText size={18} className="text-blue-500" />
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t[lang].act}</p>
                  <p className="text-xs font-bold uppercase">{t[lang].reports}: <span className="text-blue-600 font-black">{reportCount}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`border rounded-[3rem] p-10 h-full ${theme === 'dark' ? 'bg-[#0d1117] border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label={lang === 'UA' ? "Прізвище" : "Last Name"} value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} theme={theme} />
                  <InputField label={lang === 'UA' ? "Ім'я" : "First Name"} value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} theme={theme} />
                  <InputField label={lang === 'UA' ? "Посада" : "Position"} value={formData.position} onChange={(v) => setFormData({...formData, position: v})} theme={theme} />
                  <InputField label={lang === 'UA' ? "Звання" : "Rank"} value={formData.rank} onChange={(v) => setFormData({...formData, rank: v})} theme={theme} />
                  
                  {/* ДОДАНО: Поле введення підрозділу в режимі редагування */}
                  <InputField label={t[lang].unit} value={formData.unit} onChange={(v) => setFormData({...formData, unit: v})} theme={theme} />
                  
                  <div className="md:col-span-2 flex gap-3 mt-6">
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 p-4 rounded-2xl text-[11px] font-black text-white flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-blue-700 transition-all">
                      {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {t[lang].save}
                    </button>
                    <button onClick={() => setIsEditing(false)} className={`px-6 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100 hover:bg-red-100'}`}><X size={20}/></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10">
                    <DataBlock label={t[lang].pos} value={formData.position || "—"} theme={theme} />
                    
                    {/* ТУТ ВИВОДИТЬСЯ UNIT */}
                    <DataBlock label={t[lang].unit} value={formData.unit || "—"} theme={theme} />
                    
                    <DataBlock label={t[lang].id} value={user?._id?.toUpperCase() || "—"} theme={theme} />
                    <div className={`flex items-center gap-3 border p-4 rounded-2xl w-fit ${theme === 'dark' ? 'bg-blue-600/5 border-blue-600/10' : 'bg-blue-50 border-blue-100'}`}>
                      <ShieldCheck className="text-blue-500" size={20} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t[lang].sec}</span>
                    </div>
                  </div>
                  
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 text-[11px] font-black uppercase text-blue-500 border-b border-blue-500/20 pb-2 hover:text-blue-400 transition-all tracking-widest">
                    <Edit3 size={16}/> {t[lang].edit}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DataBlock({ label, value, theme }: DataBlockProps) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em]">{label}</p>
      <p className={`text-[15px] font-bold italic uppercase tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function InputField({ label, value, onChange, theme }: InputFieldProps) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">{label}</label>
      <input 
        type="text" 
        className={`w-full border p-4 rounded-2xl text-sm outline-none focus:border-blue-600 transition-all ${theme === 'dark' ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}