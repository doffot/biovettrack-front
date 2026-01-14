import React, { useState } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const HeaderMobile: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useAuth();
  const navigate = useNavigate();

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
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-vet-primary to-vet-secondary shadow-soft">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo_menu.svg"
            alt="BioVetTrack"
            className="h-10 w-auto"
          />
          <span className="text-white font-bold text-base tracking-wide">
            BioVetTrack
          </span>
        </Link>

        <div className="relative">
          {/* Botón para abrir/cerrar dropdown - NO SE CAMBIA */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center">
              <User className="w-4 h-4 text-vet-primary" />
            </div>
            <div
              className={`w-1.5 h-1.5 border-r-2 border-b-2 border-white transition-transform duration-300 ${
                showDropdown ? "rotate-[-135deg]" : "rotate-45"
              }`}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowDropdown(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card overflow-hidden animate-scale-in z-50">
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
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-vet-light/50 active:bg-vet-light transition-colors text-left"
                >
                  <div className="p-2 bg-vet-light rounded-lg">
                    <User className="w-4 h-4 text-vet-primary" />
                  </div>
                  <span className="text-sm font-medium text-vet-text">
                    Mi Perfil
                  </span>
                </Link>

                {/* Cerrar Sesión - NO SE CAMBIA */}
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 active:bg-red-100 transition-colors text-left border-t border-vet-light"
                >
                  <div className="p-2 bg-red-50 rounded-lg">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    Cerrar Sesión
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderMobile;