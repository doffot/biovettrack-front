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
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[var(--color-vet-light)] to-[var(--color-vet-secondary)] shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo_menu.svg"
            alt="BioVetTrack"
            className="h-12 w-auto"
          />
          
        </Link>

        <div className="relative">
          {/* Botón para abrir/cerrar dropdown */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 active:scale-95 transition-all hover:bg-white/15"
          >
            <div className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-[var(--color-vet-primary)]" />
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
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowDropdown(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in z-50 border border-[var(--color-border)]">
                {/* Header del usuario */}
                <div className="px-4 py-3 bg-gradient-to-r from-[var(--color-vet-primary)]/10 to-transparent border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--color-vet-text)] truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-[var(--color-vet-muted)] truncate">
                        {data?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mi Perfil */}
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-hover)] active:bg-[var(--color-border)] transition-colors text-left"
                >
                  <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg border border-[var(--color-vet-primary)]/20">
                    <User className="w-4 h-4 text-[var(--color-vet-accent)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-vet-text)]">
                    Mi Perfil
                  </span>
                </Link>

                {/* Cerrar Sesión */}
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 active:bg-red-600/20 transition-colors text-left border-t border-[var(--color-border)]"
                >
                  <div className="p-2 bg-red-600/10 rounded-lg border border-red-500/20">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-red-400">
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