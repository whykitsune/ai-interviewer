import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import api from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
    }
    
    try {
      await api.post("/auth/register", { email, username, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка регистрации");
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 text-white">
        <div className="flex flex-col items-center bg-blue-900 p-8 rounded-2xl shadow-lg w-[400px]">
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <h2 className="text-2xl font-semibold mb-2 text-center">Регистрация</h2>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg text-black outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Имя пользователя"
              className="p-3 rounded-lg text-black outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              className="p-3 rounded-lg text-black outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              className="p-3 rounded-lg text-black outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 py-2 rounded-lg mt-2 font-bold transition">
              Создать аккаунт
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/80 mb-2">Уже есть аккаунт?</p>
            <Link to="/login" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}