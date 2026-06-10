"use client";
import React, { useEffect, useState } from 'react';
import { User as UserIcon, ShieldCheck, Save, X, Edit3, Loader2, Calendar } from "lucide-react";

interface DataBlockProps {
  label: string;
  value: string;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function formatDate(dateString: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<'UA' | 'EN'>('UA');

  const [formData, setFormData] = useState({ 
    lastName: "", firstName: "", rank: "", position: "", unit: "" 
  });

  const t = {
    UA: { pos: "Посада", unit: "Підрозділ", id: "ID", reg: "В системі з", edit: "Редагувати анкету", save: "Зберегти", rank: "НЕ ВКАЗАНО", sec: "2FA АКТИВНО" },
    EN: { pos: "Position", unit: "Unit", id: "ID", reg: "Since", edit: "Edit Profile", save: "Save", rank: "NOT SET", sec: "2FA ACTIVE" }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as 'UA' | 'EN';
    if (savedLang) setLang(savedLang);

    async function loadData() {
      setLoading(true);
      try {
        const resProfile = await fetch('/api/user/profile', { cache: 'no-store' });
        if (resProfile.ok) {
          const data = await resProfile.json();
          setUser(data);
          setFormData({
            lastName: data.lastName || "",
            firstName: data.firstName || "",
            rank: data.rank || "",
            position: data.position || "",
            unit: data.unit || "" 
          });
        }
      } catch (err) {
        console.error("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
      if (res.ok) {
        const updatedRes = await fetch('/api/user/profile');
        const updatedData = await updatedRes.json();
        setUser(updatedData);
        setIsEditing(false);
      }
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4F6F4]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#4CAF50]" size={48} />
        <p className="text-[#556B2F] font-black text-[10px] uppercase tracking-widest animate-pulse">Встановлення зв'язку...</p>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-8 min-h-screen transition-all duration-500 bg-[#F4F6F4] text-[#1B2E1E]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[#1B2E1E]">
            {lang === 'UA' ? 'Особистий кабінет' : 'Personal Cabinet'}
          </h1>
          <div className="flex border border-[#A3B899]/30 rounded-2xl p-1 bg-white shadow-sm">
            <button onClick={() => changeLang('UA')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'UA' ? 'bg-[#4CAF50] text-white' : 'text-[#A3B899]'}`}>UA</button>
            <button onClick={() => changeLang('EN')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-[#4CAF50] text-white' : 'text-[#A3B899]'}`}>EN</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="border border-[#81C784] rounded-[2.5rem] p-8 text-center relative overflow-hidden bg-white shadow-lg">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4CAF50]"></div>
              <div className="w-32 h-32 rounded-[2rem] mx-auto mb-6 flex items-center justify-center border bg-[#F4F6F4] border-[#A3B899]/30">
                <UserIcon size={60} className="text-[#A3B899]" />
              </div>
              <h2 className="text-2xl font-black uppercase italic leading-tight text-[#1B2E1E]">{formData.lastName || "—"}</h2>
              <h3 className="text-lg font-bold uppercase italic text-[#4CAF50] mb-4">{formData.firstName || "—"}</h3>
              <p className="text-[#556B2F] font-black text-[9px] uppercase tracking-[0.3em] pt-4 border-t border-[#A3B899]/20">
                {formData.rank || t[lang].rank}
              </p>
            </div>

            <div className="border border-[#81C784] rounded-[2.5rem] p-6 space-y-4 bg-white shadow-md">
              <div className="flex items-center gap-4">
                <Calendar size={18} className="text-[#4CAF50]" />
                <div>
                  <p className="text-[9px] font-black uppercase text-[#A3B899] tracking-widest">{t[lang].reg}</p>
                  <p className="text-xs font-bold uppercase text-[#1B2E1E]">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-[#81C784] rounded-[3rem] p-10 h-full bg-white shadow-lg">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label={lang === 'UA' ? "Прізвище" : "Last Name"} value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />
                  <InputField label={lang === 'UA' ? "Ім'я" : "First Name"} value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} />
                  <InputField label={lang === 'UA' ? "Посада" : "Position"} value={formData.position} onChange={(v) => setFormData({...formData, position: v})} />
                  <InputField label={lang === 'UA' ? "Звання" : "Rank"} value={formData.rank} onChange={(v) => setFormData({...formData, rank: v})} />
                  <InputField label={t[lang].unit} value={formData.unit} onChange={(v) => setFormData({...formData, unit: v})} />
                  
                  <div className="md:col-span-2 flex gap-3 mt-6">
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#4CAF50] p-4 rounded-2xl text-[11px] font-black text-white flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-[#43a047] transition-all shadow-md">
                      {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {t[lang].save}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-6 rounded-2xl transition-all bg-[#F4F6F4] hover:bg-red-50 text-[#556B2F] hover:text-red-600 border border-[#A3B899]/30"><X size={20}/></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10">
                    <DataBlock label={t[lang].pos} value={formData.position || "—"} />
                    <DataBlock label={t[lang].unit} value={formData.unit || "—"} />
                    <DataBlock label={t[lang].id} value={user?._id?.toUpperCase() || "—"} />
                    <div className="flex items-center gap-3 border p-4 rounded-2xl w-fit bg-green-50 border-[#81C784]/30">
                      <ShieldCheck className="text-[#4CAF50]" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#4CAF50]">{t[lang].sec}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 text-[11px] font-black uppercase text-[#4CAF50] border-b border-[#4CAF50]/20 pb-2 hover:text-[#43a047] transition-all tracking-widest">
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

function DataBlock({ label, value }: DataBlockProps) {
  return (
    <div>
      <p className="text-[10px] text-[#A3B899] uppercase font-black mb-2 tracking-[0.2em]">{label}</p>
      <p className="text-[15px] font-bold italic uppercase tracking-tight text-[#1B2E1E]">{value}</p>
    </div>
  );
}

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="text-[9px] font-black text-[#556B2F] uppercase tracking-widest ml-1 mb-2 block">{label}</label>
      <input 
        type="text" 
        className="w-full border p-4 rounded-2xl text-sm outline-none bg-[#F4F6F4] border-[#81C784] text-[#1B2E1E] focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] transition-all" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}