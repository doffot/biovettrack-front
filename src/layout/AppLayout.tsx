// src/layout/AppLayout.tsx
import React, { useState } from 'react';
import { 
  Home, 
  Bell, 
  LogOut, 
  
} from 'lucide-react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';

import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// Links del menú desktop
const desktopMenuItems = [
  { to: '/owners', label: 'Dueño', icon: '👤' },
  { to: '/patients', label: 'Mascota', icon: '🐾' },
  { to: '/grooming-services', label: 'Peluquería', icon: '🛁' },
  { to: '/medical-history', label: 'Consulta', icon: '📋' },
  { to: '/reports', label: 'Reportes', icon: '📊' },
];

// Header Mobile/Tablet (sin menú hamburguesa)
const HeaderMobile: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useAuth();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({queryKey: ['user']});
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} showSubtitle={false} layout="horizontal" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 active:scale-95 transition-all"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-muted leading-tight">Hola,</span>
                <span className="text-xs font-semibold text-primary leading-tight truncate max-w-[100px]">
                  {data?.name 
                    ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}`
                    : 'M.V. Usuario'
                  }
                </span>
              </div>
              <div className={`w-1.5 h-1.5 border-r-2 border-b-2 border-primary transition-transform duration-300 ${showDropdown ? 'rotate-[-135deg]' : 'rotate-45'}`}></div>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-gradient-dark border border-primary/20 rounded-lg shadow-xl overflow-hidden animate-fadeIn z-50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navegar a perfil
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 active:bg-primary/15 transition-colors text-left text-text border-b border-muted/10"
                  >
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">Perfil</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // TODO: Navegar a cambiar contraseña
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 active:bg-primary/15 transition-colors text-left text-text border-b border-muted/10"
                  >
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-sm">Cambiar contraseña</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 active:bg-primary/15 transition-colors text-left text-text"
                  >
                    <LogOut className="w-4 h-4 text-primary" />
                    <span className="text-sm">Salir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Header Desktop
const HeaderDesktop: React.FC = () => {
  const [activeItem, setActiveItem] = useState('/');
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({queryKey: ['user']});
  };
 const { data } = useAuth();
  
  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-muted/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="xl" showText={true} showSubtitle={false} layout="horizontal" />
        </Link>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="w-5 h-5 text-muted" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-300 border border-primary/20"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted">Hola,</span>
                <span className="text-sm font-semibold text-primary">
                  {data?.name 
                    ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}`
                    : 'M.V. Usuario'
                  }
                </span>
              </div>
              <div className={`w-2 h-2 border-r-2 border-b-2 border-primary transition-transform duration-300 ${showDropdown ? 'rotate-[-135deg]' : 'rotate-45'}`}></div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-gradient-dark border border-primary/20 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // TODO: Navegar a perfil
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left text-text border-b border-muted/10"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // TODO: Navegar a cambiar contraseña
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left text-text border-b border-muted/10"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-sm">Cambiar contraseña</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left text-text"
                >
                  <LogOut className="w-4 h-4 text-primary" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú horizontal */}
      <nav className="px-6">
        <div className="flex items-center gap-1">
          {desktopMenuItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setActiveItem(item.to)}
              className={`
                group relative flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-300
                ${activeItem === item.to 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted hover:text-primary hover:bg-primary/5'
                }
              `}
              style={{
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                animation: 'fadeInDown 0.5s ease-out forwards'
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              
              {/* Indicador activo */}
              {activeItem === item.to && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}

              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-t-lg transition-opacity duration-300 ${
                activeItem === item.to ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
            </Link>
          ))}
        </div>
      </nav>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

// Footer
const Footer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({queryKey: ['user']});
    navigate('/auth/login');
  };

  const tabs = [
    { id: 'home',   icon: Home,   label: 'Inicio',        action: () => { setActiveTab('home'); navigate('/'); } },
    { id: 'notif',  icon: Bell,   label: 'Notificaciones', action: () => { setActiveTab('notif'); navigate('/notifications'); } },
    { id: 'logout', icon: LogOut, label: 'Salir',         action: handleLogout }
  ];

  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-t border-primary/20">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex flex-col items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary shadow-neon'
                  : 'text-muted hover:text-primary hover:bg-primary/10'
              }`}
              style={{ flexBasis: '30%' }}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'animate-neon-pulse' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-2 w-6 h-1 bg-primary rounded-full shadow-neon opacity-80"></div>
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
};

// AppLayout principal
const AppLayout: React.FC = () => {
  const { data, isError, isLoading } = useAuth();
  
  if(isLoading) return 'cargando...';
  if(isError){
    return <Navigate to="/auth/login" />;
  }

  if(data) return (
    <div className="min-h-screen bg-gradient-dark text-text overflow-hidden">
      <div className="fixed inset-0 bg-gradient-radial-top-right opacity-30"></div>
      <div className="fixed inset-0 bg-gradient-radial-bottom-left opacity-20"></div>
      
      <HeaderMobile />
      <HeaderDesktop />
      
      <main className="pt-20 pb-24 lg:pt-32 lg:pb-8 px-4 relative z-10">
        <div className="max-w-md lg:max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;