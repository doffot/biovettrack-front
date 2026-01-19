import React, { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import ThemeToggle from "../ThemeToggle"; // 👈 NUEVO

interface HeaderDesktopProps {
  isSidebarCollapsed?: boolean;
}

const HeaderDesktop: React.FC<HeaderDesktopProps> = ({ 
  isSidebarCollapsed = false 
}) => {
  const { data } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("AUTH_TOKEN_LABVET");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/auth/login");
  };

  const displayName =
    data?.name && data?.lastName
      ? `${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
      : data?.name
        ? data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
        : "Usuario";

  return (
    <header 
      className={`
        hidden lg:flex fixed top-0 right-0 z-40 h-16 
        items-center justify-end px-6 
        bg-vet-light/80 backdrop-blur-md
        border-b border-border
        transition-all duration-300
        ${isSidebarCollapsed ? "left-20" : "left-64"}
      `}
    >
      {/* 👇 CONTENEDOR FLEX PARA THEME TOGGLE + USER MENU */}
      <div className="flex items-center gap-4">
        
        {/* 👇 THEME TOGGLE */}
        <ThemeToggle />

        {/* USER MENU (código existente) */}
        <div className="relative" ref={dropdownRef}>
          {/* Botón para abrir/cerrar dropdown */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl 
              bg-card/50 hover:bg-card 
              border border-border hover:border-vet-primary/30
              transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center shadow-soft">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-vet-muted font-medium">
                Bienvenido/a
              </span>
              <span className="text-sm font-bold text-vet-text">
                {displayName}
              </span>
            </div>
            <div
              className={`w-2 h-2 border-r-2 border-b-2 border-vet-muted transition-transform duration-200 ${
                isOpen ? "rotate-[-135deg]" : "rotate-45"
              }`}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 
              bg-card border border-border 
              rounded-2xl shadow-card overflow-hidden z-50 
              animate-scale-in"
            >
              {/* Header del usuario */}
              <div className="px-4 py-3 bg-gradient-to-r from-vet-light to-transparent border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center shadow-soft">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-vet-text truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-vet-muted truncate">
                      {data?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mi Perfil */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left 
                  text-vet-text hover:bg-hover 
                  transition-colors"
              >
                <div className="p-2 bg-sky-soft rounded-lg border border-border">
                  <User className="w-4 h-4 text-vet-accent" />
                </div>
                <span className="text-sm font-medium">Mi Perfil</span>
              </Link>

              {/* Cerrar Sesión */}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 
                  hover:bg-vet-danger/10 
                  transition-colors text-left border-t border-border"
              >
                <div className="p-2 bg-vet-danger/10 rounded-lg">
                  <LogOut className="w-4 h-4 text-vet-danger" />
                </div>
                <span className="text-sm font-medium text-vet-danger">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          )}
        </div>

      </div>
      {/* 👆 FIN CONTENEDOR */}
    </header>
  );
};

export default HeaderDesktop;