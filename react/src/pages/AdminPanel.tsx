import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import api from "../api";
import { User } from "../types";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users/");
      setUsers(res.data);
    } catch (err) {
      alert("Ошибка доступа или загрузки");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Сменить роль на ${newRole}?`)) return;

    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Ошибка обновления роли");
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center flex-1 p-10 w-full text-white">
        <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>

        <div className="bg-blue-900 rounded-xl p-6 shadow-2xl w-full max-w-4xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 text-white/60">
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 font-semibold">{u.username}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                      u.role === 'admin' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/user/${u.id}/interviews`)}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition"
                    >
                      View Chats
                    </button>

                    <button
                      onClick={() => handleToggleRole(u)}
                      className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm transition"
                    >
                      Swap Role
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GradientBackground>
  );
}