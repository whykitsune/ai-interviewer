import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import api from "../api";
import { Interview } from "../types";

export default function AdminUserInterviews() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get<Interview[]>(`/interviews/user/${userId}`);
        setInterviews(res.data);
      } catch (err) {
        alert("Ошибка загрузки или доступ запрещен");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchInterviews();
  }, [userId, navigate]);

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center flex-1 p-10 w-full text-white">
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Интервью пользователя #{userId}</h1>
            <button
                onClick={() => navigate("/admin")}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
            >
                ← Назад
            </button>
        </div>

        {loading ? (
            <p>Загрузка...</p>
        ) : (
            <div className="grid gap-4 w-full max-w-4xl">
                {interviews.length === 0 && <p className="text-center opacity-50">У пользователя нет интервью.</p>}

                {interviews.map((interview) => (
                    <div key={interview.id} className="bg-blue-900 p-6 rounded-xl shadow-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{interview.topic}</p>
                            <p className="text-sm opacity-70">Уровень: {interview.level}</p>
                            <p className="text-xs mt-1 text-white/50">
                                {new Date(interview.created_at).toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${interview.is_finished ? 'bg-green-600' : 'bg-yellow-600'}`}>
                                {interview.is_finished ? 'Завершено' : 'Активно'}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate(`/interview/${interview.id}`)}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-full font-bold transition"
                        >
                            Читать чат
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </GradientBackground>
  );
}