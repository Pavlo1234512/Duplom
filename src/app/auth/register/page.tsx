"use client";

import { useState, useEffect } from "react";
import { Check, X, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    phone: "",
    email: "", 
    unit: "", 
    position: "",
    login: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    upper: false,
    special: false,
  });

  const [touchedFields, setTouchedFields] = useState<string[]>([]);

  useEffect(() => {
    setPasswordValidation({
      length: formData.password.length >= 8,
      upper: /[A-Z]/.test(formData.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    });
  }, [formData.password]);

  const isPasswordSecure = passwordValidation.length && passwordValidation.upper && passwordValidation.special;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const validateStep1 = () => {
    // ТЕПЕР EMAIL ТАКОЖ У СПИСКУ ОБОВ'ЯЗКОВИХ
    const required = ["lastName", "firstName", "middleName", "phone", "email"];
    const empty = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (empty.length > 0) {
      setError("ЗАПОВНІТЬ УСІ ПОЛЯ, ВКЛЮЧАЮЧИ EMAIL");
      setTouchedFields(prev => [...prev, ...empty]);
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    const required = ["unit", "position", "login", "password", "confirmPassword"];
    const empty = required.filter(field => !formData[field as keyof typeof formData]);

    if (empty.length > 0) {
      setError("ЗАПОВНІТЬ ДАНІ ОБЛІКОВОГО ЗАПИСУ");
      setTouchedFields(prev => [...prev, ...empty]);
      return false;
    }
    if (!isPasswordSecure) {
      setError("ПАРОЛЬ НЕ ВІДПОВІДАЄ КРИТЕРІЯМ");
      return false;
    }
    if (!passwordsMatch) {
      setError("ПАРОЛІ НЕ ЗБІГАЮТЬСЯ");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "ПОМИЛКА РЕЄСТРАЦІЇ");

      if (data.otpauth) {
        setQrCode(data.otpauth);
        setStep(3);
      } else {
        router.push("/auth/login");
      }
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 font-mono">
      <div className="max-w-4xl w-full bg-black/40 border border-white/5 rounded-3xl p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10" />
        
        <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">Реєстрація системи</h1>
            <p className="text-blue-500 text-[10px] font-black tracking-[0.3em] mt-1 uppercase">Ідентифікація персоналу</p>
          </div>
          <div className="text-right">
            <span className="text-slate-600 text-[10px] uppercase font-black tracking-widest block mb-1">Прогрес</span>
            <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-white/10'}`} />
                ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InputField label="Прізвище" value={formData.lastName} error={touchedFields.includes("lastName") && !formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />
            <InputField label="Ім'я" value={formData.firstName} error={touchedFields.includes("firstName") && !formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} />
            <InputField label="По-батькові" value={formData.middleName} error={touchedFields.includes("middleName") && !formData.middleName} onChange={(v) => setFormData({...formData, middleName: v})} />
            
            <InputField 
              label="Контактний телефон" 
              value={formData.phone} 
              placeholder="+380"
              error={touchedFields.includes("phone") && !formData.phone}
              onChange={(v) => {
                const formatted = v.replace(/(?!^\+)[^\d]/g, "");
                if (formatted.length <= 13) setFormData({...formData, phone: formatted});
              }} 
            />

            <div className="md:col-span-2">
              <InputField 
                label="Електронна пошта" 
                type="email"
                placeholder="example@mail.com"
                value={formData.email} 
                error={touchedFields.includes("email") && !formData.email} // ТЕПЕР ПІДСВІЧУЄТЬСЯ ЧЕРВОНИМ
                onChange={(v) => setFormData({...formData, email: v})} 
              />
            </div>

            <button 
              onClick={() => validateStep1() && setStep(2)} 
              className="md:col-span-2 mt-4 p-5 bg-blue-600 text-white rounded-2xl font-black uppercase hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20"
            >
              Наступний етап <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Підрозділ" value={formData.unit} error={touchedFields.includes("unit") && !formData.unit} onChange={(v) => setFormData({...formData, unit: v})} />
              <InputField label="Посада" value={formData.position} error={touchedFields.includes("position") && !formData.position} onChange={(v) => setFormData({...formData, position: v})} />
              
              <div className="md:col-span-2">
                <InputField label="Системний логін" placeholder="ivanov_a" value={formData.login} error={touchedFields.includes("login") && !formData.login} onChange={(v) => setFormData({...formData, login: v})} />
              </div>

              <div className="space-y-4">
                <InputField label="Пароль" type="password" value={formData.password} error={touchedFields.includes("password") && !formData.password} onChange={(v) => setFormData({...formData, password: v})} />
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Вимоги:</p>
                  <ValidationRule label="8+ знаків" valid={passwordValidation.length} />
                  <ValidationRule label="Велика літера" valid={passwordValidation.upper} />
                  <ValidationRule label="Спецсимвол" valid={passwordValidation.special} />
                </div>
              </div>

              <div className="space-y-4">
                <InputField label="Підтвердження" type="password" value={formData.confirmPassword} error={touchedFields.includes("confirmPassword") && !formData.confirmPassword} onChange={(v) => setFormData({...formData, confirmPassword: v})} />
                {formData.confirmPassword && (
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${passwordsMatch ? 'bg-blue-600/10 border-blue-600/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {passwordsMatch ? <Check size={16} /> : <X size={16} />}
                    <span className="text-[10px] uppercase font-black tracking-tight">{passwordsMatch ? "Збігаються" : "Не збігаються"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 p-5 border border-white/10 rounded-2xl uppercase font-black text-[11px] hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-slate-500">
                <ArrowLeft size={16} /> Назад
              </button>
              <button type="submit" disabled={loading} className="flex-[2] p-5 rounded-2xl font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Зареєструватися"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-6 animate-in zoom-in-95 duration-500">
             <div className="inline-flex p-6 bg-white rounded-3xl mb-8 shadow-[0_0_50px_-12px_rgba(37,99,235,0.4)]">
                <QRCodeSVG value={qrCode} size={200} />
             </div>
             <h2 className="text-xl font-black text-white mb-2 uppercase italic tracking-tight">Налаштування 2FA</h2>
             <p className="text-slate-400 text-[10px] max-w-sm mx-auto mb-10 leading-relaxed uppercase font-black tracking-widest">
               Відскануйте QR-код у додатку <span className="text-blue-500 underline underline-offset-4">Google Authenticator</span>.
             </p>
             <button onClick={() => router.push('/auth/login')} className="w-full max-w-xs p-5 bg-blue-600 rounded-2xl font-black uppercase text-[11px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
               Перейти до входу
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, error }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] uppercase tracking-[0.25em] text-slate-500 ml-1 font-black">{label}</label>
      <input 
        type={type} 
        value={value} 
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={`bg-black/40 border p-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-slate-800 text-sm font-bold
          ${error ? 'border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 focus:border-blue-600'}`}
      />
    </div>
  );
}

function ValidationRule({ label, valid }: { label: string, valid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-black tracking-widest transition-colors ${valid ? 'text-blue-400' : 'text-slate-700'}`}>
      {valid ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-800 rounded-full ml-1" />}
      {label}
    </div>
  );
}