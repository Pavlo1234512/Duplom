"use client";

import { useEffect } from "react";
import "./globals.css";
import { AuthProviders } from "./AuthProviders";
import SidebarWrapper from "@/components/SidebarWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  useEffect(() => {
    // 1. ПЕРЕВІРКА ТЕМИ
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }

    // 2. ПЕРЕВІРКА МОВИ (опціонально для всього сайту)
    const savedLang = localStorage.getItem("app-lang") || "UA";
    document.documentElement.lang = savedLang.toLowerCase();
  }, []);

  return (
    <html lang="uk">
      {/* Додаємо динамічні класи для body, щоб вони реагували на світлу тему */}
      <body className="bg-[#05070a] text-white transition-colors duration-300 light:bg-slate-50 light:text-slate-900">
        <AuthProviders>
          <div className="flex min-h-screen">
            {/* SidebarWrapper сам вирішить, чи малювати Sidebar */}
            <SidebarWrapper />
            <main className="flex-1 w-full relative">
              {children}
            </main>
          </div>
        </AuthProviders>
      </body>
    </html>
  );
}