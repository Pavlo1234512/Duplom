"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, RefreshCcw, UserCircle2, Clock } from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error("Помилка завантаження");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const role = selectedRoles[userId] || 'OPERATOR';
      
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action,
          role 
        }),
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== userId));
      } else {
        const errorData = await res.json();
        alert(`Помилка: ${errorData.error || 'Не вдалося виконати дію'}`);
      }
    } catch (e) {
      console.error("Помилка при виконанні дії:", e);
      alert("Серверна помилка. Перевірте підключення.");
    }
  };

  return (
    <main className="flex-1 p-8 bg-[#F4F6F4] min-h-screen text-[#1B2E1E]">
      <header className="mb-10 flex justify-between items-end border-b border-[#A3B899]/30 pb-8">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#1B2E1E]">
            ВЕРИФІКАЦІЯ <span className="text-[#4CAF50]">ПЕРСОНАЛУ</span>
          </h1>
        </div>
        <button onClick={fetchRequests} className="p-4 bg-white border border-[#81C784] rounded-2xl hover:bg-[#F4F6F4] transition-all shadow-sm">
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#A3B899]">
          <RefreshCcw size={40} className="animate-spin mb-4 opacity-40" />
          <p className="font-black italic uppercase text-[10px] tracking-widest text-[#556B2F]">Синхронізація з базою...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-[#81C784] rounded-[3rem] bg-white">
          <Clock size={48} className="text-[#A3B899] mb-6" />
          <h2 className="text-xl font-black uppercase italic text-[#556B2F]">Нових заявок немає</h2>
          <p className="text-[10px] text-[#A3B899] font-bold uppercase mt-2 tracking-widest">Усі запити оброблені</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white border border-[#81C784] rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F4] rounded-2xl flex items-center justify-center text-[#4CAF50] border border-[#81C784]">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic">{req.lastName} {req.firstName}</h3>
                    <p className="text-[#4CAF50] text-[10px] font-black uppercase tracking-widest">{req.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#F4F6F4] p-4 rounded-2xl border border-[#81C784]/20">
                  <p className="text-[8px] text-[#556B2F] font-black uppercase mb-1">Підрозділ</p>
                  <p className="text-[10px] font-bold italic uppercase">{req.unit || "ВІТІ"}</p>
                </div>
                <div className="bg-[#F4F6F4] p-4 rounded-2xl border border-[#81C784]/20">
                  <p className="text-[8px] text-[#556B2F] font-black uppercase mb-1">Посада</p>
                  <p className="text-[10px] font-bold italic uppercase">{req.position || "Курсант"}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[9px] font-black text-[#556B2F] uppercase tracking-widest mb-3 ml-2 italic">Рівень доступу:</p>
                <div className="flex gap-2 p-1.5 bg-[#F4F6F4] rounded-2xl border border-[#81C784]/30">
                  {['USER', 'OPERATOR', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRoles({ ...selectedRoles, [req._id]: role })}
                      className={`flex-1 py-3 rounded-xl transition-all font-black text-[10px] uppercase italic ${
                        (selectedRoles[req._id] || 'OPERATOR') === role 
                        ? 'bg-[#4CAF50] text-white shadow-md' 
                        : 'text-[#A3B899] hover:text-[#556B2F]'
                      }`}
                    >
                      {role === 'USER' ? 'LVL 1' : role === 'OPERATOR' ? 'LVL 2' : 'LVL 3'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleAction(req._id, 'approve')}
                  className="flex-[2] bg-[#4CAF50] hover:bg-[#43a047] text-white p-5 rounded-2xl text-[11px] font-black uppercase italic transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check size={18}/> Підтвердити
                </button>
                <button 
                  onClick={() => handleAction(req._id, 'reject')}
                  className="flex-1 bg-[#F4F6F4] hover:bg-[#E0E5DF] text-[#556B2F] p-5 rounded-2xl transition-all flex items-center justify-center border border-[#81C784]/30"
                >
                  <X size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}