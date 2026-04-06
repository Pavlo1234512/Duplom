"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  
  // Якщо ми на сторінці реєстрації або входу - Sidebar не малюємо взагалі
  if (!mounted || pathname?.includes("/auth")) return null;

  return <Sidebar />;
}