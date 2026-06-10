"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Map as MapIcon, User, FileText, 
  BarChart3, Users, ClipboardList, LogOut, FilePlus 
} from "lucide-react"; // Додано FilePlus
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role?.toUpperCase() || "USER";

  const menuItems = [
    { name: "ПРОФІЛЬ", path: "/profile", icon: User },
    { name: "ДАШБОРД", path: "/", icon: LayoutDashboard },
    { name: "СТВОРИТИ", path: "/create-report", icon: FilePlus }, // Додано цей рядок
    { name: "ЗВІТ", path: "/analytics", icon: BarChart3 },
  ];

  const adminItems = [
    { name: "КОРИСТУВАЧІ", path: "/users", icon: Users },
    { name: "ЗАПИТИ", path: "/requests", icon: ClipboardList },
  ];

  const allItems = userRole === "ADMIN" ? [...menuItems, ...adminItems] : menuItems;

  return (
    <aside className="w-64 bg-[#E8EBE8] border-r border-[#A3B899]/30 flex flex-col h-screen sticky top-0 z-40 text-[#1B2E1E]">
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#4CAF50] rounded flex items-center justify-center font-black text-white shadow-sm">S</div>
          <span className="text-xl font-black italic tracking-tighter text-[#1B2E1E]">STRATCOM <span className="text-[#4CAF50]">AI</span></span>
        </div>

        <nav className="space-y-1">
          {allItems.map((item, index) => {
            const isActive = pathname === item.path;
            const isFirstAdminItem = userRole === "ADMIN" && index === menuItems.length;

            return (
              <React.Fragment key={item.path}>
                {isFirstAdminItem && (
                  <div className="pt-4 mb-2 border-t border-[#A3B899]/30 opacity-60">
                    <p className="text-[8px] font-black text-[#556B2F] px-4 tracking-[0.3em]">ADMIN PANEL</p>
                  </div>
                )}
                <Link 
                  href={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[11px] tracking-widest uppercase italic ${
                    isActive 
                      ? "bg-[#4CAF50]/10 text-[#4CAF50] border-l-2 border-[#4CAF50]" 
                      : "text-[#556B2F] hover:text-[#1B2E1E] hover:bg-[#A3B899]/10"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-[#4CAF50]" : ""}`} />
                  {item.name}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-[#A3B899]/30 bg-[#DEE2DE]/50">
        <div className="flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-black italic shadow-inner">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-[#1B2E1E] truncate uppercase italic">
              {session?.user?.name || "GUEST"}
            </p>
            <p className="text-[9px] font-bold text-[#556B2F] tracking-tighter uppercase">
              {userRole === "ADMIN" ? "LEVEL 1 - ADMIN" : "LEVEL 2 - ACCESS"}
            </p>
          </div>
        </div>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-[#8B0000] hover:bg-[#8B0000]/10 rounded-lg transition-all font-bold text-[10px] tracking-widest uppercase italic group">
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> СИСТЕМНИЙ ВИХІД
        </button>
      </div>
    </aside>
  );
}