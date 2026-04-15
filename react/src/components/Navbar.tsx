import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 text-white font-semibold">
      <div className="flex items-center gap-2 text-xl text-black">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span>InterviewAI</span>
        </Link>
      </div>
      <div className="flex gap-2 text-black">
        {user ? (
            <div className="flex gap-4 items-center">
                <Link to="/interviews" className="text-white hover:text-gray-200 transition">
                    Мои интервью
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin" className="text-red-200 hover:text-red-100 font-bold underline decoration-2 underline-offset-4">
                    ADMIN PANEL
                  </Link>
                )}

                <span className="text-white/90 ml-2">Привет, {user.username}</span>
                <button onClick={logout} className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                    Выйти
                </button>
            </div>
        ) : (
            <>
                <Link to="/login" className="px-3 py-1 text-white hover:underline transition">
                Log In
                </Link>
                <Link
                to="/register"
                className="px-3 py-1 bg-black text-white rounded-full hover:opacity-80 transition"
                >
                Sign Up
                </Link>
            </>
        )}
      </div>
    </nav>
  );
}