import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import api from "../api";
import { Interview as InterviewType, Message } from "../types";

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<InterviewType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInterview = async () => {
        try {
            const res = await api.get<InterviewType>(`/interviews/${id}`);
            setInterview(res.data);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error(err);
            navigate("/dashboard");
        }
    };
    if (id) fetchInterview();
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const userMsg: Message = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
        const res = await api.post<{ ai_message: string }>(`/interviews/${id}/chat`, { content: userMsg.content });
        const aiMsg: Message = { role: "ai", content: res.data.ai_message };
        setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
        alert("Ошибка отправки сообщения");
    } finally {
        setIsSending(false);
    }
  };

  const handleFinish = async () => {
    if(!window.confirm("Вы уверены, что хотите завершить? ИИ сформирует финальный фидбэк.")) return;
    try {
        await api.post(`/interviews/${id}/finish`);
        navigate("/dashboard");
    } catch (err) {
        alert("Ошибка при завершении");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 px-4 h-full pb-8">
        
        {interview && (
            <div className="flex justify-between w-full max-w-4xl text-white mb-4 px-4 py-2 bg-black/20 rounded-lg">
                <span className="font-bold">Тема: {interview.topic}</span>
                <span className="bg-white/20 px-2 rounded text-sm">{interview.level}</span>
            </div>
        )}

        {/* Чат */}
        <div className="bg-blue-900/90 backdrop-blur-sm text-white p-6 rounded-xl w-full max-w-4xl h-[60vh] overflow-y-auto shadow-2xl flex flex-col gap-4 border border-white/10">
          {messages.length === 0 && (
             <div className="text-center text-white/40 mt-10">Загрузка истории...</div>
          )}
          
          {messages.map((msg, idx) => (
             <div 
                key={idx} 
                className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === "user" 
                        ? "bg-purple-600 self-end ml-auto rounded-tr-none" 
                        : "bg-blue-700 self-start mr-auto rounded-tl-none"
                }`}
             >
                <p className="text-[10px] uppercase tracking-wider opacity-50 mb-1 font-bold">
                    {msg.role === 'user' ? 'Вы' : 'Интервьюер'}
                </p>
                {msg.content}
             </div>
          ))}
          
          {isSending && (
            <div className="self-start bg-blue-700/50 p-3 rounded-2xl rounded-tl-none animate-pulse">
                <span className="text-sm opacity-70">ИИ печатает...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ввод текста */}
        <div className="w-full max-w-4xl mt-4 flex gap-3 relative">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите ваш ответ..."
                className="flex-1 p-4 rounded-xl border-none outline-none resize-none h-16 text-black shadow-lg focus:ring-4 focus:ring-purple-500/50 transition"
                disabled={isSending}
            />
            <button 
                onClick={handleSend}
                disabled={isSending}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-500 text-white px-8 rounded-xl font-bold shadow-lg transition flex items-center justify-center text-xl"
            >
                ➤
            </button>
        </div>

        <button
          onClick={handleFinish}
          className="mt-6 bg-red-600/80 hover:bg-red-500 text-white px-6 py-2 rounded-full transition text-sm font-medium hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          ⛔ Завершить собеседование
        </button>
      </div>
    </GradientBackground>
  );
}