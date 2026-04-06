"use client";
import { useEffect, useState } from "react";
import { Users, UserCog } from "lucide-react";

export default function UsersPage() {
  // ВИПРАВЛЕНО: додаємо <any[]> після useState
  const [users, setUsers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        // Тепер TypeScript дозволить записати сюди дані
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-black uppercase italic">
      <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
        <Users className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl tracking-tighter">Керування персоналом</h1>
          <p className="text-blue-500 text-[10px] tracking-widest uppercase">Database Control / Active Personnel</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] tracking-widest border-b border-white/5 text-zinc-500">
              <th className="p-4">ПОЗИВНИЙ / EMAIL</th>
              <th className="p-4">РОЛЬ</th>
              <th className="p-4">СТАТУС</th>
              <th className="p-4 text-right">ДІЇ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center animate-pulse text-zinc-600">СИНХРОНІЗАЦІЯ ДАНИХ...</td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-black text-blue-400">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 lowercase not-italic">{user.email}</span>
                  </div>
                </td>
                <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-[10px]">{user.role}</span></td>
                <td className="p-4 uppercase text-[10px]">
                  <span className={user.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-blue-600/20 text-blue-500 rounded-lg border border-blue-600/20">
                    <UserCog size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}