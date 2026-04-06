"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Map as MapIcon, User, FileText, 
  BarChart3, Users, ClipboardList, LogOut 
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role?.toUpperCase() || "USER";

  const menuItems = [
    { name: "ПРОФІЛЬ", path: "/profile", icon: User },
    { name: "ДАШБОРД", path: "/", icon: LayoutDashboard },
    { name: "МАПА", path: "/map", icon: MapIcon },
    { name: "ЗВІТИ", path: "/reports", icon: FileText },
    { name: "АНАЛІТИКА", path: "/analytics", icon: BarChart3 },
  ];

  const adminItems = [
    { name: "КОРИСТУВАЧІ", path: "/users", icon: Users },
    { name: "ЗАПИТИ", path: "/requests", icon: ClipboardList },
  ];

  const allItems = userRole === "ADMIN" ? [...menuItems, ...adminItems] : menuItems;

  return (
    <aside className="w-64 bg-[#05070a] border-r border-white/5 flex flex-col h-screen sticky top-0 z-40">
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">S</div>
          <span className="text-xl font-black italic tracking-tighter text-white">STRATCOM <span className="text-blue-600">AI</span></span>
        </div>

        <nav className="space-y-1">
          {allItems.map((item, index) => {
            const isActive = pathname === item.path;
            const isFirstAdminItem = userRole === "ADMIN" && index === menuItems.length;

            return (
              <React.Fragment key={item.path}>
                {isFirstAdminItem && (
                  <div className="pt-4 mb-2 border-t border-white/5 opacity-40">
                    <p className="text-[8px] font-black text-slate-600 px-4 tracking-[0.3em]">ADMIN PANEL</p>
                  </div>
                )}
                <Link 
                  href={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-[11px] tracking-widest uppercase italic ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-500 border-l-2 border-blue-600 shadow-[inset_10px_0_15px_-10px_rgba(37,99,235,0.2)]" 
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-blue-500" : ""}`} />
                  {item.name}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-full flex items-center justify-center text-white font-black italic border border-white/10 shadow-lg">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-white truncate uppercase italic">
              {session?.user?.name || "GUEST"}
            </p>
            <p className="text-[9px] font-bold text-blue-500 tracking-tighter uppercase">
              {userRole === "ADMIN" ? "LEVEL 1 - ADMIN" : "LEVEL 2 - ACCESS"}
            </p>
          </div>
        </div>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all font-bold text-[10px] tracking-widest uppercase italic group">
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> СИСТЕМНИЙ ВИХІД
        </button>
      </div>
    </aside>
  );
}