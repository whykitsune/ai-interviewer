import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Interview = lazy(() => import("./pages/Interview"));
const NewInterview = lazy(() => import("./pages/NewInterview"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminUserInterviews = lazy(() => import("./pages/AdminUserInterviews"));
const InterviewList = lazy(() => import("./pages/InterviewList"));

const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-600 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-white text-xl animate-pulse">Загрузка...</div>
  </div>
);

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return (user && user.role === 'admin') ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/interviews" element={<PrivateRoute><InterviewList /></PrivateRoute>} />
              <Route path="/new-interview" element={<PrivateRoute><NewInterview /></PrivateRoute>} />
              <Route path="/interview/:id" element={<PrivateRoute><Interview /></PrivateRoute>} />

              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="/admin/user/:userId/interviews" element={<AdminRoute><AdminUserInterviews /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;