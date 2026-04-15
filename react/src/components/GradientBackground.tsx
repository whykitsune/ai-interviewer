import { ReactNode } from "react";

export default function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-600 flex flex-col">
      {children}
    </div>
  );
}