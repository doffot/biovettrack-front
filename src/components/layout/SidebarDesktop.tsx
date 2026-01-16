// src/components/layout/SidebarDesktop.tsx
import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { menuItems } from "../../layout/config/menuItems";

interface SidebarDesktopProps {
  activeItem: string;
  setActiveItem: (to: string) => void;
}

const SidebarDesktop: React.FC<SidebarDesktopProps> = ({
  activeItem,
  setActiveItem,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (sub) => sub.to === activeItem
        );
        if (hasActiveSubItem && !expandedMenus.includes(item.label)) {
          setExpandedMenus((prev) => [...prev, item.label]);
        }
      }
    });
  }, [activeItem]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const logout = () => {
    localStorage.removeItem("AUTH_TOKEN_LABVET");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/auth/login");
  };

  const isSubmenuExpanded = (label: string) => expandedMenus.includes(label);

  return (
    <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 z-50 w-64 h-full bg-gradient-to-b from-vet-light via-sky-soft to-vet-light border-r border-border shadow-card">
      {/* Logo con overlay oscuro y efecto de fondo */}
      <div className="relative flex flex-col items-center justify-center px-4 py-6 border-b border-border">
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-vet-light/50 backdrop-blur-sm" />

        {/* Efecto de partícula suave */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-vet-accent/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-vet-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

        <Link to="/" className="flex flex-col items-center gap-2 relative z-10">
          <img
            src="/logo_menu.svg"
            alt="BioVetTrack"
            className="h-16 w-auto drop-shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isExpanded = isSubmenuExpanded(item.label);
              const hasActiveSubItem = item.subItems.some(
                (sub) => sub.to === activeItem
              );

              return (
                <div key={item.label} className="space-y-0.5">
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`
                      group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 w-full
                      ${
                        hasActiveSubItem
                          ? "bg-vet-primary/20 text-vet-accent font-medium border border-vet-primary/30"
                          : "text-vet-muted hover:bg-hover hover:text-vet-text"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${
                        hasActiveSubItem ? "scale-110 text-vet-accent" : "group-hover:scale-105 group-hover:text-vet-accent"
                      }`}
                    />
                    <span className="text-[13px] flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <div className="ml-3 pl-3 border-l-2 border-border space-y-0.5 py-0.5">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.to}>
                          {subItem.disabled ? (
                            <div className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-vet-muted/40 cursor-not-allowed">
                              <subItem.icon className="w-[15px] h-[15px] flex-shrink-0" />
                              <span className="text-[12px] flex-1">
                                {subItem.label}
                              </span>
                              {subItem.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-card text-vet-muted rounded flex items-center gap-1 border border-border">
                                  <Lock className="w-2 h-2" />
                                  {subItem.badge}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Link
                              to={subItem.to}
                              onClick={() => setActiveItem(subItem.to)}
                              className={`
                                group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-200
                                ${
                                  activeItem === subItem.to
                                    ? "bg-vet-primary text-white shadow-soft font-medium"
                                    : "text-vet-muted hover:bg-hover hover:text-vet-text"
                                }
                              `}
                            >
                              <subItem.icon
                                className={`w-[15px] h-[15px] flex-shrink-0 transition-transform duration-200 ${
                                  activeItem === subItem.to
                                    ? "scale-110"
                                    : "group-hover:scale-105"
                                }`}
                              />
                              <span className="text-[12px]">{subItem.label}</span>
                              {activeItem === subItem.to && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />
                              )}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to!}
                onClick={() => setActiveItem(item.to!)}
                className={`
                  group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    activeItem === item.to
                      ? "bg-vet-primary text-white shadow-soft font-medium"
                      : "text-vet-muted hover:bg-hover hover:text-vet-text"
                  }
                `}
              >
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${
                    activeItem === item.to ? "scale-110" : "group-hover:scale-105 group-hover:text-vet-accent"
                  }`}
                />
                <span className="text-[13px] font-medium">{item.label}</span>
                {activeItem === item.to && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-vet-muted hover:text-vet-danger hover:bg-vet-danger/10 transition-all duration-200 group"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:translate-x-[-2px] transition-transform" />
          <span className="text-[13px] font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarDesktop;