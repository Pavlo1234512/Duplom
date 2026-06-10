"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, UserPlus, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
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
        // Виводимо конкретну помилку, яку повертає бекенд
        setError(res.error.toUpperCase());
      } else {
        // Успішний вхід
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("КРИТИЧНА ПОМИЛКА З'ЄДНАННЯ З СЕРВЕРОМ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F4F6F4] z-[9999] flex items-center justify-center font-black uppercase italic p-4">
      <div className="w-full max-w-md bg-white border border-[#81C784] p-8 rounded-[2rem] shadow-lg">
        
        <div className="flex flex-col items-center mb-8 text-[#1B2E1E]">
          <ShieldCheck className="w-12 h-12 text-[#4CAF50] mb-2" />
          <h2 className="text-2xl tracking-tighter italic font-black">Вхід у систему</h2>
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
            className="w-full bg-white border border-[#81C784] p-4 rounded-xl outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] not-italic text-[#1B2E1E] transition-all placeholder:text-[#A3B899]"
            onChange={(e) => setLogin(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="ПАРОЛЬ" 
            required
            className="w-full bg-white border border-[#81C784] p-4 rounded-xl outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] not-italic text-[#1B2E1E] transition-all placeholder:text-[#A3B899]"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input 
            type="text" 
            placeholder="КОД 2FA" 
            maxLength={6}
            required
            className="w-full bg-white border border-[#81C784] p-4 rounded-xl outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] text-center text-[#1B2E1E] tracking-[0.5em] font-bold not-italic placeholder:text-[#A3B899]"
            value={code2fa}
            onChange={(e) => setCode2fa(e.target.value.replace(/\D/g, ""))}
          />
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#4CAF50] p-4 rounded-xl text-white flex items-center justify-center gap-2 hover:bg-[#43a047] disabled:opacity-50 transition-all font-bold"
          >
            {loading ? "ПЕРЕВІРКА..." : "УВІЙТИ В ЦЕНТР"} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#A3B899]/30 flex flex-col items-center gap-4">
          <button 
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-[10px] text-[#556B2F] hover:text-[#1B2E1E] transition-colors flex items-center justify-center gap-2 tracking-[0.2em] font-black cursor-pointer"
          >
             ЗАРЕЄСТРУВАТИСЯ <UserPlus className="w-3 h-3" />
          </button>
          
          <button 
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-[9px] text-[#A3B899] hover:text-[#556B2F] transition-colors tracking-[0.1em] font-bold cursor-pointer"
          >
             ЗАБУЛИ ПАРОЛЬ
          </button>
        </div>

      </div>
    </div>
  );
}