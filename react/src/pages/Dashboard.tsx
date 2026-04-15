import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import api from "../api";
import { Interview } from "../types";
import SEO from "../components/SEO";

interface GithubRepo {
  name: string;
  url: string;
  stars: number;
  language: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Interview | null>(null);
  const[resumeUrl, setResumeUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [githubName, setGithubName] = useState("");
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedbackRes = await api.get<Interview | null>("/users/me/last-feedback");
        setFeedback(feedbackRes.data);

        if (user?.resume_path) {
            const urlRes = await api.get<{ url: string }>("/users/me/resume-url");
            setResumeUrl(urlRes.data.url);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных дашборда:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/users/me/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Резюме загружено успешно!");
      window.location.reload();
    } catch (err: any) {
      alert("Ошибка загрузки файла. Проверьте соединение с хранилищем.");
    } finally {
        if (e.target) e.target.value = "";
    }
  };

  const fetchGithub = async () => {
    if (!githubName.trim()) return;
    setGhLoading(true);
    setGhError("");
    setRepos(null);

    try {
        const res = await api.get<{repos: GithubRepo[]}>(`/users/me/github-repos?username=${githubName}`);
        setRepos(res.data.repos);
    } catch (err: any) {
        if (err.response?.status === 404) {
            setGhError("Пользователь не найден на GitHub");
        } else {
            setGhError("Ошибка связи с внешним сервисом (GitHub API)");
        }
    } finally {
        setGhLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SEO
        title="Личный кабинет"
        description="Панель управления пользователя InterviewAI"
        noindex={true}
      />

      <Navbar />

      <div className="flex flex-wrap justify-center items-start flex-1 p-10 gap-8">

        <div className="flex flex-col gap-8 w-full max-w-sm">

            <div className="bg-blue-900/90 text-white rounded-2xl p-6 shadow-xl flex flex-col items-center border border-white/10">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl mb-4 font-bold shadow-lg">
                {user?.username?.[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold mb-1 text-center">{user?.username}</h2>
            <p className="mb-6 text-sm text-white/60">{user?.email}</p>

            <div className="flex flex-col gap-3 w-full">
                {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 py-2 rounded-lg transition text-center border border-white/20">
                    👁️ Открыть резюме
                </a>
                ) : (
                <div className="text-center p-2 bg-yellow-500/20 text-yellow-200 rounded-lg text-sm border border-yellow-500/30">
                    ⚠️ Резюме не загружено
                </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" />
                <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition font-medium">
                {user?.resume_path ? "📂 Обновить файл" : "📂 Загрузить файл"}
                </button>
            </div>
            </div>

            <div className="bg-blue-900/90 text-white rounded-2xl p-6 shadow-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                    Мои проекты
                </h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="GitHub Username"
                        value={githubName}
                        onChange={(e) => setGithubName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchGithub()}
                        className="flex-1 p-2 rounded-lg text-black text-sm outline-none"
                    />
                    <button onClick={fetchGithub} disabled={ghLoading} className="bg-purple-600 hover:bg-purple-500 px-3 rounded-lg text-sm font-bold disabled:opacity-50">
                        Найти
                    </button>
                </div>

                {ghLoading && <p className="text-sm text-center animate-pulse text-white/70">Загрузка репозиториев...</p>}
                {ghError && <p className="text-sm text-center text-red-400">{ghError}</p>}
                {repos && repos.length === 0 && <p className="text-sm text-center text-white/50">Публичных репозиториев нет</p>}

                {repos && repos.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {repos.map((repo, idx) => (
                            <a key={idx} href={repo.url} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition group">
                                <p className="font-semibold text-sm group-hover:text-purple-300 transition truncate">{repo.name}</p>
                                <div className="flex justify-between mt-2 text-xs text-white/50">
                                    <span>{repo.language || "N/A"}</span>
                                    <span>⭐ {repo.stars}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="bg-blue-900/90 text-white rounded-2xl p-8 w-full max-w-2xl shadow-xl min-h-[500px] border border-white/10">
          <h2 className="text-2xl mb-6 font-bold border-b border-white/10 pb-4">
            📊 Последний фидбэк
          </h2>
          {feedback ? (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <span className="bg-purple-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {feedback.topic}
                    </span>
                    <span className="text-white/60 text-sm bg-black/20 px-3 py-1 rounded-lg">
                        Уровень: <span className="text-white font-medium">{feedback.level}</span>
                    </span>
                </div>
                <div className="bg-black/30 p-6 rounded-xl text-justify whitespace-pre-wrap leading-relaxed text-sm h-80 overflow-y-auto custom-scrollbar border border-white/5 shadow-inner">
                    {feedback.feedback}
                </div>
                <div className="mt-4 text-xs text-white/40 text-right">
                    Интервью завершено: {new Date(feedback.created_at).toLocaleDateString()}
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 opacity-50">
                <span className="text-7xl mb-6 drop-shadow-lg">📭</span>
                <p className="text-lg">Вы еще не проходили собеседования</p>
                <Link to="/new-interview" className="mt-4 text-purple-400 hover:text-purple-300 underline">Начать первое интервью</Link>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/new-interview"
        className="fixed bottom-8 right-8 bg-black text-white px-8 py-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-900 transition flex items-center gap-3 font-bold text-lg z-50 border border-white/10"
      >
        <span className="text-2xl">💬</span> Начать интервью
      </Link>
    </GradientBackground>
  );
}