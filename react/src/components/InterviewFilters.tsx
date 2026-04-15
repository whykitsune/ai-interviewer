import { useSearchParams } from "react-router-dom";

export default function InterviewFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);

    if (value) {
        newParams.set(name, value);
    } else {
        newParams.delete(name);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white/10 p-4 rounded-xl flex gap-4 flex-wrap mb-6">
      <input
        name="topic"
        placeholder="Поиск по теме..."
        className="p-2 rounded text-black"
        onChange={handleChange}
        value={searchParams.get("topic") || ""}
      />

      <select name="level" className="p-2 rounded text-black" onChange={handleChange} value={searchParams.get("level") || ""}>
        <option value="">Все уровни</option>
        <option value="Junior">Junior</option>
        <option value="Middle">Middle</option>
        <option value="Senior">Senior</option>
      </select>

      <select name="is_finished" className="p-2 rounded text-black" onChange={handleChange} value={searchParams.get("is_finished") || ""}>
        <option value="">Любой статус</option>
        <option value="true">Завершено</option>
        <option value="false">Активно</option>
      </select>

      <select name="sort_by" className="p-2 rounded text-black" onChange={handleChange} value={searchParams.get("sort_by") || "created_at_desc"}>
        <option value="created_at_desc">Сначала новые</option>
        <option value="created_at_asc">Сначала старые</option>
        <option value="topic_asc">По теме (А-Я)</option>
      </select>
    </div>
  );
}