// src/layout/AppLayout.tsx
import React, { useState, useEffect } from "react";
import {
  Bell,
  Home as HomeIcon,
  LogOut,
  User,
  PawPrint,
  Scissors,
  BarChart3,
  CreditCard,
  Activity,
  Settings,
  ChevronDown,
  Users,
  Lock,
  FileText,
  Calendar,
} from "lucide-react";
import { Link, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

// Tipos para menú con submenús
interface SubMenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
}

interface MenuItem {
  to?: string;
  label: string;
  icon: React.ElementType;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { to: "/", label: "Inicio", icon: HomeIcon },
  { to: "/owners", label: "Dueño", icon: User },
  { to: "/patients", label: "Mascota", icon: PawPrint },
  { to: "/appointments", label: "Citas", icon: Calendar }, 
  { to: "/lab-exams", label: "Crear Hemograma", icon: Activity },
  { to: "/grooming-services", label: "Peluquería", icon: Scissors },
  {
    label: "Reportes",
    icon: BarChart3,
    subItems: [
      { to: "/grooming/report", label: "Peluquería", icon: Scissors },
      { to: "/invoices/report", label: "Facturación", icon: FileText },
    ],
  },
  {
    label: "Configuraciones",
    icon: Settings,
    subItems: [
      { to: "/payment-methods", label: "Métodos de Pago", icon: CreditCard },
      { to: "/staff", label: "Staff", icon: Users },
    ],
  },
];

const AppLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState("/");
  const { data, isError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("AUTH_TOKEN_LABVET");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/auth/login" />;
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-vet-gradient text-vet-text overflow-hidden relative">
      <HeaderDesktop />
      <HeaderMobile />
      <Footer logout={logout} />

      <SidebarDesktop activeItem={activeItem} setActiveItem={setActiveItem} />

      <main className="pt-14 pb-20 lg:pt-16 lg:pb-0 lg:pl-64 relative min-h-screen bg-vet-gradient">
        <Outlet />
      </main>
    </div>
  );
};

// Header Desktop - Simplificado sin Dr./Dra.
const HeaderDesktop: React.FC = () => {
  const { data } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const displayName = data?.name && data?.lastName
    ? `${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
    : data?.name
    ? data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
    : "Usuario";

  return (
    <header className="hidden lg:flex fixed top-0 left-64 right-0 z-40 h-16 items-center justify-end px-6 bg-white border-b border-vet-light shadow-soft">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-vet-light/50 hover:bg-vet-light transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center shadow-soft">
            <User className="w-5 h-5 text-white" />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs text-vet-muted font-medium">Bienvenido/a</span>
            <span className="text-sm font-bold text-vet-text">{displayName}</span>
          </div>

          <div
            className={`w-2 h-2 border-r-2 border-b-2 border-vet-muted transition-transform duration-200 ${
              isOpen ? "rotate-[-135deg]" : "rotate-45"
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-vet-light rounded-2xl shadow-card overflow-hidden z-50 animate-scale-in">
            <div className="px-4 py-3 bg-gradient-to-r from-vet-light/30 to-transparent border-b border-vet-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-vet-text truncate">{displayName}</p>
                  <p className="text-xs text-vet-muted truncate">{data?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-vet-text hover:bg-vet-light/50 transition-colors"
            >
              <div className="p-2 bg-vet-light rounded-lg">
                <User className="w-4 h-4 text-vet-primary" />
              </div>
              <span className="text-sm font-medium">Mi Perfil</span>
            </button>

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
              <span className="text-sm font-medium text-red-600">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Sidebar Desktop
const SidebarDesktop: React.FC<{
  activeItem: string;
  setActiveItem: (to: string) => void;
}> = ({ activeItem, setActiveItem }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some((sub) => sub.to === activeItem);
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
      <div className="flex items-center justify-center p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isExpanded = isSubmenuExpanded(item.label);
              const hasActiveSubItem = item.subItems.some((sub) => sub.to === activeItem);

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
                    <span className="text-sm flex-1 text-left">{item.label}</span>
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
                              <span className="text-sm flex-1">{subItem.label}</span>
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
                                  activeItem === subItem.to ? "scale-110" : "group-hover:scale-105"
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

// Header Mobile - Simplificado sin Dr./Dra.
const HeaderMobile: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { data } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const displayName = data?.name && data?.lastName
    ? `${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
    : data?.name
    ? data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
    : "Usuario";

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-vet-primary to-vet-secondary shadow-soft">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} showSubtitle={false} layout="horizontal" />
        </Link>

        <div className="relative">
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

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card overflow-hidden animate-scale-in z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-vet-light/30 to-transparent border-b border-vet-light">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-vet-text truncate">{displayName}</p>
                      <p className="text-xs text-vet-muted truncate">{data?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Reportes Submenu */}
                <div className="border-b border-vet-light">
                  <button
                    onClick={() => toggleSubmenu("reportes")}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-vet-light/50 transition-colors text-left"
                  >
                    <div className="p-2 bg-vet-light rounded-lg">
                      <BarChart3 className="w-4 h-4 text-vet-primary" />
                    </div>
                    <span className="text-sm font-medium text-vet-text flex-1">Reportes</span>
                    <ChevronDown
                      className={`w-4 h-4 text-vet-muted transition-transform duration-300 ${
                        expandedMenus.includes("reportes") ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out bg-vet-light/30
                      ${expandedMenus.includes("reportes") ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <div className="py-2 px-2 space-y-1">
                      <Link
                        to="/grooming/report"
                        onClick={() => setShowDropdown(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                          ${
                            location.pathname === "/grooming/report"
                              ? "bg-vet-primary text-white"
                              : "text-vet-text hover:bg-vet-light"
                          }
                        `}
                      >
                        <Scissors className="w-4 h-4" />
                        <span className="text-sm">Peluquería</span>
                      </Link>

                      <Link
                        to="/invoices/report"
                        onClick={() => setShowDropdown(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                          ${
                            location.pathname === "/invoices/report"
                              ? "bg-vet-primary text-white"
                              : "text-vet-text hover:bg-vet-light"
                          }
                        `}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Facturación</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Configuraciones Submenu */}
                <div className="border-b border-vet-light">
                  <button
                    onClick={() => toggleSubmenu("config")}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-vet-light/50 transition-colors text-left"
                  >
                    <div className="p-2 bg-vet-light rounded-lg">
                      <Settings className="w-4 h-4 text-vet-primary" />
                    </div>
                    <span className="text-sm font-medium text-vet-text flex-1">Configuraciones</span>
                    <ChevronDown
                      className={`w-4 h-4 text-vet-muted transition-transform duration-300 ${
                        expandedMenus.includes("config") ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out bg-vet-light/30
                      ${expandedMenus.includes("config") ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <div className="py-2 px-2 space-y-1">
                      <Link
                        to="/payment-methods"
                        onClick={() => setShowDropdown(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                          ${
                            location.pathname === "/payment-methods"
                              ? "bg-vet-primary text-white"
                              : "text-vet-text hover:bg-vet-light"
                          }
                        `}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Métodos de Pago</span>
                      </Link>

                      <Link
                        to="/staff"
                        onClick={() => setShowDropdown(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                          ${
                            location.pathname === "/staff"
                              ? "bg-vet-primary text-white"
                              : "text-vet-text hover:bg-vet-light"
                          }
                        `}
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Staff</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-vet-light/50 active:bg-vet-light transition-colors text-left border-b border-vet-light"
                >
                  <div className="p-2 bg-vet-light rounded-lg">
                    <User className="w-4 h-4 text-vet-primary" />
                  </div>
                  <span className="text-sm font-medium text-vet-text">Mi Perfil</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
                >
                  <div className="p-2 bg-red-50 rounded-lg">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-red-600">Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC<{ logout: () => void }> = ({ logout }) => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: HomeIcon, label: "Inicio", action: () => navigate("/") },
    { id: "notif", icon: Bell, label: "Notif", action: () => navigate("/notifications") },
    { id: "logout", icon: LogOut, label: "Salir", action: logout },
  ];

  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-vet-light shadow-soft">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                tab.action();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-vet-primary"
                  : "text-vet-muted hover:text-vet-primary"
              }`}
            >
              <div className={`p-2 rounded-lg transition-all ${
                isActive ? "bg-vet-light" : "bg-transparent"
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110" : ""
                }`} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-vet-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default AppLayout;