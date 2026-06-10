"use client";
import React, { useState } from "react";
import { FileText, Loader2, ClipboardList } from "lucide-react";

interface ReportGeneratorProps {
  units: string[];
  selectedDate?: string; // Тепер приймаємо одну дату
  onBeforeGenerate?: () => boolean; // Функція для перевірки перед генерацією
}

export default function ReportGenerator({ units, selectedDate, onBeforeGenerate }: ReportGeneratorProps) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    // Викликаємо перевірку перед початком (чи є дані на цю дату)
    if (onBeforeGenerate && !onBeforeGenerate()) {
      return; 
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          unit: selectedUnit,
          date: selectedDate // Передаємо одну дату на сервер
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Помилка генерації");
        } else {
          throw new Error("Не вдалося згенерувати звіт");
        }
      }

      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CombatReport_${selectedUnit}_${selectedDate || 'all'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Не вдалося згенерувати файл");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#E8EBE8] border border-[#A3B899]/30 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="text-[#4CAF50] w-6 h-6" />
        <h2 className="text-lg font-black uppercase text-[#1B2E1E]">Генератор бойових звітів</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select 
          className="bg-white border border-[#A3B899] p-2 rounded-lg text-sm font-bold text-[#1B2E1E]"
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-black italic uppercase transition-all flex items-center gap-2 text-white
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#3d8b40]'}`}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {loading ? "Формування..." : "Завантажити звіт (.docx)"}
        </button>
      </div>

      <div className="text-xs text-[#1B2E1E]/60 italic">
        *Звіт буде сформовано для підрозділу <span className="font-bold">{selectedUnit}</span> 
        {selectedDate ? ` за дату: ${selectedDate}.` : " за весь доступний час."}
      </div>
    </div>
  );
}