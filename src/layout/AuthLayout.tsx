// src/layout/AuthLayout.tsx
import { Outlet, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function AuthLayout() {
  return (
    <>
      {/* Botón Flotante para ir al Home / Landing Page */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="group flex items-center gap-2 text-white font-medium px-4 py-2.5 rounded-lg bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-200 shadow-lg"
        >
          <div className="relative">
            <Home className="w-5 h-5 transition-all duration-300 group-hover:opacity-0 group-hover:scale-75" />
            <ArrowLeft className="w-5 h-5 absolute top-0 left-0 opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
          </div>
          <span className="text-sm hidden md:inline">Volver al Inicio</span>
        </Link>
      </div>

      {/* Renderiza la vista correspondiente (Login, Register, etc.) */}
      <Outlet />
    </>
  );
}