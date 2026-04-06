"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, UserPlus, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [code2fa, setCode2fa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        login: login.trim(),
        password: password,
        twoFactor: code2fa,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "ПОМИЛКА ДОСТУПУ" : res.error.toUpperCase());
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("ПОМИЛКА З'ЄДНАННЯ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#05070a] z-[9999] flex items-center justify-center font-black uppercase italic p-4">
      <div className="w-full max-w-md bg-black/60 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl">
        
        {/* Заголовок */}
        <div className="flex flex-col items-center mb-8 text-white">
          <ShieldCheck className="w-12 h-12 text-blue-600 mb-2" />
          <h2 className="text-2xl tracking-tighter italic">Вхід у систему</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-lg mb-4 text-center animate-pulse flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="ЛОГІН" 
            required
            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-600 not-italic text-white transition-all placeholder:text-slate-600"
            onChange={(e) => setLogin(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="ПАРОЛЬ" 
            required
            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-600 not-italic text-white transition-all placeholder:text-slate-600"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input 
            type="text" 
            placeholder="КОД 2FA" 
            maxLength={6}
            required
            className="w-full bg-blue-600/10 border border-blue-600/30 p-4 rounded-xl outline-none text-center text-blue-400 tracking-[0.5em] font-bold not-italic placeholder:text-blue-900/40"
            value={code2fa}
            onChange={(e) => setCode2fa(e.target.value.replace(/\D/g, ""))}
          />
          
          <button 
            disabled={loading}
            className="w-full bg-blue-600 p-4 rounded-xl text-white flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {loading ? "ПЕРЕВІРКА..." : "УВІЙТИ В ЦЕНТР"} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Нижня навігація */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
          <Link href="/auth/register" className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 tracking-[0.2em] font-black">
             ЗАРЕЄСТРУВАТИСЯ <UserPlus className="w-3 h-3" />
          </Link>
          
          <Link href="/auth/forgot-password" className="text-[9px] text-slate-700 hover:text-blue-500 transition-colors tracking-[0.1em] font-bold">
             ЗАБУЛИ ПАРОЛЬ
          </Link>
        </div>

      </div>
    </div>
  );
}