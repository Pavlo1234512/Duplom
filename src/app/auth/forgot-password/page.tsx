"use client";

import { useState, Suspense, useEffect } from "react";
import { KeyRound, ArrowRight, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ login: "", email: "", password: "", confirm: "" });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    // КЛІЄНТСЬКА ВАЛІДАЦІЯ
    if (token) {
      if (formData.password.length < 6) {
        setErrorMsg("ПАРОЛЬ ЗАКОРОТКИЙ (МІН. 6 СИМВОЛІВ)");
        setStatus("error");
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirm) {
        setErrorMsg("ПАРОЛІ НЕ ЗБІГАЮТЬСЯ");
        setStatus("error");
        setLoading(false);
        return;
      }
    }

    const endpoint = !token ? "/api/auth/forgot-password" : "/api/auth/reset-password";
    const body = !token 
      ? { login: formData.login, email: formData.email }
      : { token, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("success");
      if (token) setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setErrorMsg(err.message.toUpperCase());
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#05070a] z-[9999] flex items-center justify-center font-black uppercase italic p-4 text-white">
      <div className="w-full max-w-md bg-black/60 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <KeyRound className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-2xl tracking-tighter">{!token ? "Скидання пароля" : "Новий пароль"}</h2>
        </div>

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-4 rounded-2xl mb-6 flex items-center gap-2">
            <ShieldAlert size={16} /> {errorMsg}
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] p-4 rounded-2xl mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} /> {token ? "УСПІШНО ОНОВЛЕНО" : "ЛИСТ ВІДПРАВЛЕНО"}
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          {!token ? (
            <>
              <input type="text" placeholder="ЛОГІН" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 not-italic placeholder:text-slate-700" onChange={(e) => setFormData({...formData, login: e.target.value})} />
              <input type="email" placeholder="EMAIL" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 not-italic placeholder:text-slate-700 lowercase" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </>
          ) : (
            <>
              <input type="password" placeholder="НОВИЙ ПАРОЛЬ" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 not-italic placeholder:text-slate-700" onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <input type="password" placeholder="ПОВТОРІТЬ ПАРОЛЬ" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 not-italic placeholder:text-slate-700" onChange={(e) => setFormData({...formData, confirm: e.target.value})} />
            </>
          )}

          <button disabled={loading} className="w-full bg-blue-600 p-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all font-bold disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : !token ? "ВІДПРАВИТИ ЗАПИТ" : "ОНОВИТИ ПАРОЛЬ"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link href="/auth/login" className="text-[10px] text-slate-600 hover:text-white transition-colors tracking-widest font-bold">
            ПОВЕРНУТИСЯ ДО ВХОДУ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">ЗАВАНТАЖЕННЯ...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}