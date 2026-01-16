import React, { useState } from "react";
import { Bell, Home as HomeIcon, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotificationCount } from "../../hooks/useNotificationCount";
import LogoutConfirmModal from "./LogoutConfirmModal";

interface FooterProps {
  logout: () => void;
}

const Footer: React.FC<FooterProps> = ({ logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { total: notificationCount, urgent: urgentCount } =
    useNotificationCount();

  const tabs = [
    { id: "home", icon: HomeIcon, label: "Inicio", path: "/" },
    { id: "notif", icon: Bell, label: "Notificaciones", path: "/notifications" },
    { id: "logout", icon: LogOut, label: "Salir", path: null },
  ];

  const isActive = (path: string | null) => {
    if (path === null) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    if (tab.path) {
      navigate(tab.path);
    } else if (tab.id === "logout") {
      setShowLogoutModal(true);
    }
  };

  return (
    <>
      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />

      {/* Footer fijo */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-card)] border-t border-[var(--color-border)] shadow-lg">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            const isLogout = tab.id === "logout";
            const isNotif = tab.id === "notif";

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                  isLogout
                    ? "text-red-400 hover:text-red-300"
                    : active
                      ? "text-[var(--color-vet-accent)]"
                      : "text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)]"
                }`}
              >
                <div
                  className={`relative p-2 rounded-lg transition-all ${
                    isLogout
                      ? "bg-red-600/10 border border-red-500/20"
                      : active
                        ? "bg-[var(--color-vet-primary)]/10 border border-[var(--color-vet-primary)]/20"
                        : "bg-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`}
                  />

                  {/* Badge de notificaciones */}
                  {isNotif && notificationCount > 0 && (
                    <span
                      className={`
                        absolute -top-1 -right-1 flex items-center justify-center
                        min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white
                        rounded-full border-2 border-[var(--color-card)] shadow-md
                        ${urgentCount > 0 ? "bg-red-500 animate-pulse" : "bg-[var(--color-vet-primary)]"}
                      `}
                    >
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isLogout ? "text-red-400" : ""}`}
                >
                  {tab.label}
                </span>
                {active && !isLogout && (
                  <div className="w-1 h-1 rounded-full bg-[var(--color-vet-accent)] mt-0.5 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </footer>
    </>
  );
};

export default Footer;