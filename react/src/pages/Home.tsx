import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

export default function Home() {
  const { user } = useAuth();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "InterviewAI",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "description": "Платформа для прохождения технических собеседований с ИИ."
  };

  return (
    <GradientBackground>
      <SEO
        title="Тренажер IT-собеседований"
        description="Подготовься к техническому собеседованию и отточи свои навыки с помощью виртуального ИИ-интервьюера."
        canonical="http://localhost:5173/"
        jsonLd={jsonLdData}
      />
      <Navbar />

      <div className="flex flex-1 items-center justify-between px-16">
        <div className="max-w-xl">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-10 rounded-[50px] rounded-br-none shadow-lg">
            <p className="text-xl text-center leading-relaxed">
              Подготовься к техническому собеседованию и отточи свои навыки
              с помощью виртуального ИИ-интервьюера!
            </p>
          </div>
          <Link
            to={user ? "/dashboard" : "/register"}
            className="mt-10 inline-block px-8 py-3 bg-black text-white rounded-full text-lg shadow-lg hover:scale-105 transition font-bold"
          >
            {user ? "В личный кабинет" : "Начать сейчас"}
          </Link>
        </div>
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
            alt="AI bot"
            className="w-80 drop-shadow-2xl"
          />
        </div>
      </div>
    </GradientBackground>
  );
}