import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Logo from "../../components/Logo";
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
    <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 z-50 w-64 h-full bg-gradient-to-b from-vet-primary to-vet-secondary shadow-card">
      {/* Logo */}
      <div className="flex items-center justify-center p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo
            size="xl"
            showText={true}
            showSubtitle={false}
            layout="vertical"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isExpanded = isSubmenuExpanded(item.label);
              const hasActiveSubItem = item.subItems.some(
                (sub) => sub.to === activeItem
              );

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full
                      ${
                        hasActiveSubItem
                          ? "bg-white/20 text-white font-semibold"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        hasActiveSubItem ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm flex-1 text-left">
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
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
                    <div className="ml-4 pl-4 border-l-2 border-white/20 space-y-1 py-1">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.to}>
                          {subItem.disabled ? (
                            <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 cursor-not-allowed">
                              <subItem.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm flex-1">
                                {subItem.label}
                              </span>
                              {subItem.badge && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white/60 rounded-full flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  {subItem.badge}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Link
                              to={subItem.to}
                              onClick={() => setActiveItem(subItem.to)}
                              className={`
                                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                ${
                                  activeItem === subItem.to
                                    ? "bg-white text-vet-primary shadow-soft font-semibold"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              <subItem.icon
                                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                                  activeItem === subItem.to
                                    ? "scale-110"
                                    : "group-hover:scale-105"
                                }`}
                              />
                              <span className="text-sm">{subItem.label}</span>
                              {activeItem === subItem.to && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-vet-primary animate-pulse" />
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
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    activeItem === item.to
                      ? "bg-white text-vet-primary shadow-soft font-semibold"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    activeItem === item.to ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <span className="text-sm">{item.label}</span>
                {activeItem === item.to && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-vet-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarDesktop;