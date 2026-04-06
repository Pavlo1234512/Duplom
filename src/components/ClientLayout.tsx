"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react"; 
import { LayoutDashboard, UserCircle, FileText, Shield, LogOut, UserCheck, Loader2 } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Помилка завантаження профілю:", err);
      }
    };
    
    if (!pathname?.startsWith("/auth")) {
      fetchUser();
    }
  }, [pathname]); 

  const isAuthPage = pathname?.startsWith("/auth");

  const menuItems = [
    { name: 'Дашборд', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Аналіз', icon: <FileText size={20} />, path: '/analyze' }, 
    { name: 'Архів', icon: <Shield size={20} />, path: '/archive' },
    { name: 'Профіль', icon: <UserCircle size={20} />, path: '/profile' },
    { name: 'Заявки', icon: <UserCheck size={20} />, path: '/admin/requests', adminOnly: true },
  ];

  // НАЙБІЛЬШ АГРЕСИВНИЙ МЕТОД ВИХОДУ
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // 1. Очищаємо сесію на сервері NextAuth (без автоматичного редиректу)
    await signOut({ redirect: false });
    
    // 2. Очищаємо локальне сховище (якщо там щось було)
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Робимо жорстку заміну локації
    window.location.replace("/auth/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070a]">
      {!isAuthPage && (
        <aside className="w-72 bg-[#05070a] border-r border-white/5 flex flex-col h-full sticky top-0 z-50">
          <div className="p-8">
            <div className="text-2xl font-black italic tracking-tighter text-white">
              STRATCOM <span className="text-blue-600 uppercase">AI</span>
            </div>
            <div className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em] mt-1">
              SITUATION CENTER VITI
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const hasAccess = !item.adminOnly || (user && user.role === "ADMIN");
              if (!hasAccess) return null;

              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive 
                    ? 'bg-blue-600 text-white italic font-black shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 font-bold uppercase text-[11px] italic'
                  }`}
                >
                  {item.icon} <span className="tracking-wider">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-white/5">
             <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-4 p-4 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-black uppercase italic text-[10px] tracking-widest group disabled:opacity-50"
             >
                {isLoggingOut ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                )}
                <span>{isLoggingOut ? "Вихід..." : "Завершити сеанс"}</span>
             </button>
          </div>
        </aside>
      )}
      <main className="flex-1 overflow-y-auto bg-[#05070a]">
        {children}
      </main>
    </div>
  );
}