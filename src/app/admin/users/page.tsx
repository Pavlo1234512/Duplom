"use client";
import { useEffect, useState } from "react";
import { Users, UserCog } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
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
    <div className="p-8 bg-[#F4F6F4] min-h-screen text-[#1B2E1E] font-black uppercase italic">
      <div className="flex items-center gap-4 mb-10 border-b border-[#A3B899]/30 pb-6">
        <Users className="w-10 h-10 text-[#4CAF50]" />
        <div>
          <h1 className="text-3xl tracking-tighter text-[#1B2E1E]">Керування персоналом</h1>
          <p className="text-[#556B2F] text-[10px] tracking-widest uppercase">Database Control / Active Personnel</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#81C784] bg-white shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F4F6F4] text-[10px] tracking-widest border-b border-[#A3B899]/30 text-[#556B2F]">
              <th className="p-4">ПОЗИВНИЙ / EMAIL</th>
              <th className="p-4">РОЛЬ</th>
              <th className="p-4">СТАТУС</th>
              <th className="p-4 text-right">ДІЇ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center animate-pulse text-[#A3B899]">СИНХРОНІЗАЦІЯ ДАНИХ...</td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="border-b border-[#A3B899]/20 hover:bg-[#F4F6F4]/50">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-black text-[#4CAF50]">{user.name}</span>
                    <span className="text-[10px] text-[#556B2F] lowercase not-italic">{user.email}</span>
                  </div>
                </td>
                <td className="p-4"><span className="bg-[#E0E5DF] px-2 py-1 rounded text-[10px] text-[#1B2E1E]">{user.role}</span></td>
                <td className="p-4 uppercase text-[10px]">
                  <span className={user.status === 'approved' ? 'text-[#4CAF50]' : 'text-[#B8860B]'}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-[#4CAF50]/10 text-[#4CAF50] rounded-lg border border-[#4CAF50]/20">
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