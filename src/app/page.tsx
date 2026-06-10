"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function DashboardPage() {
  const [allReports, setAllReports] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'total'>('total');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' });
      const data = await res.json();
      setAllReports(data);
    } catch (e) {
      console.error("Помилка завантаження:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Функція для витягування першого числа з рядка (наприклад, "1 тепловізор" -> 1)
  const parseQuantity = (str: any) => {
    if (!str || typeof str !== 'string') return 0;
    const match = str.match(/^\d+/); // Шукає цифри на початку рядка
    return match ? parseInt(match[0], 10) : 0;
  };

  const filteredReports = viewMode === 'daily'
    ? allReports.filter((r: any) => new Date(r.createdAt).toDateString() === new Date().toDateString())
    : allReports;

  const stats = filteredReports.reduce((acc: any, curr: any) => {
    // Втрати ворога (equipment.destroyed - рядок)
    const enemyEquipStr = curr.enemy_losses?.equipment?.destroyed || "";
    
    // Втрати наші (масив own_equipment_losses, де кожен об'єкт має destroyed - рядок)
    const ourEquipTotal = (curr.own_equipment_losses || []).reduce((sum: number, item: any) => {
      return sum + parseQuantity(item.destroyed);
    }, 0);

    return {
      enemyPersonnel: acc.enemyPersonnel + (curr.enemy_losses?.personnel?.dead || 0),
      enemyVehicles: acc.enemyVehicles + parseQuantity(enemyEquipStr),
      shelling: acc.shelling + (curr.shelling?.total_count || 0),
      drones: acc.drones + (curr.airstrike?.count || 0),
      ourVehicles: acc.ourVehicles + ourEquipTotal,
    };
  }, { enemyPersonnel: 0, enemyVehicles: 0, shelling: 0, drones: 0, ourVehicles: 0 });

  return (
    <main className="p-8 bg-[#F4F6F4] min-h-screen">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1B2E1E]">Аналітичне зведення</h1>
          <p className="text-[#556B2F] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {viewMode === 'daily' ? 'Поточна доба' : 'За весь період'}
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          <button onClick={() => setViewMode('daily')} className={`px-6 py-2 text-[10px] font-black uppercase rounded ${viewMode === 'daily' ? 'bg-[#556B2F] text-white' : 'text-[#556B2F]'}`}>Доба</button>
          <button onClick={() => setViewMode('total')} className={`px-6 py-2 text-[10px] font-black uppercase rounded ${viewMode === 'total' ? 'bg-[#556B2F] text-white' : 'text-[#556B2F]'}`}>Всього</button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Ворог (полеглі)" value={stats.enemyPersonnel} color="text-[#8B0000]" />
        <StatCard label="Арт-обстріли" value={stats.shelling} color="text-[#B8860B]" />
        <StatCard label="Скиди БПЛА" value={stats.drones} color="text-[#2E5B82]" />
        <StatCard label="Знищена техніка ворога" value={stats.enemyVehicles} color="text-[#556B2F]" />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#A3B899]/30">
        <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#556B2F] mb-6">Порівняння втрат техніки (Ворог vs Наші)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={[
            { name: 'Кількість одиниць', Ворог: stats.enemyVehicles, Наші: stats.ourVehicles }
          ]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Ворог" name="Знищена техніка ворога" fill="#a10000" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Наші" name="Наша знищена техніка" fill="#008b2a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#A3B899]/30">
      <p className="text-[9px] uppercase font-black tracking-[0.2em] text-[#556B2F] mb-2">{label}</p>
      <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}