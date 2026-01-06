import React, { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const HeaderDesktop: React.FC = () => {
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
    <header className="hidden lg:flex fixed top-0 left-64 right-0 z-40 h-16 items-center justify-end px-6 bg-white border-b border-vet-light shadow-soft">
      <div className="relative" ref={dropdownRef}>
        {/* Botón para abrir/cerrar dropdown - NO SE CAMBIA */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-vet-light/50 hover:bg-vet-light transition-all duration-200 group"
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
          <div className="absolute right-0 mt-2 w-64 bg-white border border-vet-light rounded-2xl shadow-card overflow-hidden z-50 animate-scale-in">
            {/* Header del usuario */}
            <div className="px-4 py-3 bg-gradient-to-r from-vet-light/30 to-transparent border-b border-vet-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
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

            {/* ✅ Mi Perfil - CAMBIADO de button a Link */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-vet-text hover:bg-vet-light/50 transition-colors"
            >
              <div className="p-2 bg-vet-light rounded-lg">
                <User className="w-4 h-4 text-vet-primary" />
              </div>
              <span className="text-sm font-medium">Mi Perfil</span>
            </Link>

            {/* Cerrar Sesión - NO SE CAMBIA */}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-vet-light"
            >
              <div className="p-2 bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm font-medium text-red-600">
                Cerrar Sesión
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderDesktop;