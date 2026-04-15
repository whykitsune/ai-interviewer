import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import InterviewFilters from "../components/InterviewFilters";
import api from "../api";
import { PaginatedInterviews } from "../types";

export default function InterviewList() {
  const [data, setData] = useState<PaginatedInterviews | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";
  const size = "5";

  useEffect(() => {
    const fetchData = async () => {
      const query = new URLSearchParams(searchParams);
      query.set("page", page);
      query.set("size", size);

      const res = await api.get<PaginatedInterviews>(`/interviews/?${query.toString()}`);
      setData(res.data);
    };
    fetchData();
  }, [searchParams, page]);

  const handleDelete = async (id: number) => {
    if(!confirm("Удалить?")) return;
    await api.delete(`/interviews/${id}`);
    window.location.reload();
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center flex-1 p-10 w-full text-white">
        <h1 className="text-3xl font-bold mb-6">Мои собеседования</h1>

        <div className="w-full max-w-4xl">
            <InterviewFilters />

            <div className="flex flex-col gap-4">
                {data?.items.map(i => (
                    <div key={i.id} className="bg-blue-900 p-4 rounded-xl flex justify-between items-center shadow-lg">
                        <div>
                            <h3 className="font-bold text-lg">{i.topic} <span className="text-sm opacity-70">({i.level})</span></h3>
                            <p className="text-xs mt-1">{new Date(i.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/interview/${i.id}`} className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-500">
                                Открыть
                            </Link>
                            <button onClick={() => handleDelete(i.id)} className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500">
                                X
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Пагинация */}
            <div className="flex justify-center gap-4 mt-8">
                <button
                    disabled={Number(page) <= 1}
                    onClick={() => setSearchParams(p => { p.set("page", String(Number(page)-1)); return p; })}
                    className="bg-white/20 px-4 py-2 rounded disabled:opacity-50"
                >
                    Назад
                </button>
                <span>Страница {page} из {Math.ceil((data?.total || 0) / Number(size))}</span>
                <button
                    disabled={Number(page) * Number(size) >= (data?.total || 0)}
                    onClick={() => setSearchParams(p => { p.set("page", String(Number(page)+1)); return p; })}
                    className="bg-white/20 px-4 py-2 rounded disabled:opacity-50"
                >
                    Вперед
                </button>
            </div>
        </div>
      </div>
    </GradientBackground>
  );
}