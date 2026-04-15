import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { AuthResponse, User } from "../types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });

      const { access_token, refresh_token } = res.data;

      localStorage.setItem("access_token", access_token);

      const userRes = await api.get<User>("/users/me");

      login(access_token, refresh_token, userRes.data);
      
      navigate("/dashboard");
    } catch (err) {
      setError("Неверный email или пароль");
      console.error(err);
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 text-white">
        <div className="flex flex-col items-center bg-blue-900 p-8 rounded-2xl shadow-lg w-[400px]">
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <h2 className="text-2xl font-semibold mb-2 text-center">Вход</h2>
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
              type="password"
              placeholder="Пароль"
              className="p-3 rounded-lg text-black outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 py-2 rounded-lg mt-2 font-bold transition">
              Войти
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/80 mb-2">Нет аккаунта?</p>
            <Link to="/register" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}