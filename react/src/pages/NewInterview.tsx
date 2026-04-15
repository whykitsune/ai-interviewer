import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import GradientBackground from "../components/GradientBackground";
import { useState } from "react";
import api from "../api";

export default function NewInterview() {
  const [topic, setTopic] = useState("Frontend");
  const [level, setLevel] = useState("Junior");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
        const res = await api.post("/interviews/", { topic, level });
        navigate(`/interview/${res.data.id}`);
    } catch (err) {
        console.error(err);
        alert("Ошибка при создании интервью. Проверьте соединение.");
        setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-1 p-10 justify-center items-center">
        <div className="bg-blue-900 rounded-2xl p-8 shadow-2xl w-[500px] text-white">
          <h2 className="text-2xl font-semibold mb-8 text-center border-b border-white/10 pb-4">
            Настройка собеседования
          </h2>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-white/80">Направление</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option>Frontend</option>
              <option>Backend</option>
              <option>DevOps</option>
              <option>Data Science</option>
              <option>QA</option>
              <option>Python Developer</option>
              <option>React Developer</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block mb-2 font-medium text-white/80">Уровень сложности</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option>Junior</option>
              <option>Middle</option>
              <option>Senior</option>
            </select>
          </div>

          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
                <span className="animate-pulse">Создание комнаты...</span>
            ) : (
                "Начать собеседование"
            )}
          </button>
          
          <Link to="/dashboard" className="block text-center mt-4 text-white/50 hover:text-white transition text-sm">
            Отмена
          </Link>
        </div>
      </div>
    </GradientBackground>
  );
}