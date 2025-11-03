// src/layout/AppLayout.tsx
import React, { useState } from 'react';
import { 
  Bell, 
  Home as HomeIcon,
  LogOut,
  User,
  PawPrint,
  Scissors,
  FileText,
  BarChart3
} from 'lucide-react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// Menú común - Iconos profesionales de Lucide
const menuItems = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/owners', label: 'Dueño', icon: User },
  { to: '/patients', label: 'Mascota', icon: PawPrint },
  { to: '/grooming-services', label: 'Peluquería', icon: Scissors },
  { to: '/medical-history', label: 'Consulta', icon: FileText },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
];

// Sidebar para desktop (logo + menú + usuario)
const SidebarDesktop: React.FC<{ activeItem: string; setActiveItem: (to: string) => void }> = ({
  activeItem,
  setActiveItem,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useAuth();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 z-50 w-64 h-full bg-gradient-dark border-r border-primary/20">
      {/* Logo en la parte superior */}
      <div className="p-5 border-b border-muted/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
        </Link>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
           <Link
  key={item.to}
  to={item.to}
  onClick={() => setActiveItem(item.to)}
  className={`
    group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
    ${activeItem === item.to
      ? 'bg-primary/10'
      : 'hover:bg-primary/5'}
  `}
>
  <item.icon 
    className={`w-5 h-5 flex-shrink-0 ${
      activeItem === item.to ? 'text-primary' : 'text-blue-300 group-hover:text-primary'
    }`} 
  />
  <span 
    className={`text-sm whitespace-nowrap ${
      activeItem === item.to ? 'text-primary font-medium' : 'text-muted group-hover:text-primary'
    }`}
  >
    {item.label}
  </span>
</Link>
          ))}
        </div>
      </nav>

      {/* Perfil de usuario en la parte inferior */}
      <div className="p-4 border-t border-muted/10 relative">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted">Hola,</span>
              <span className="text-xs font-semibold text-primary leading-tight whitespace-nowrap">
                {data?.name && data?.lastName
                  ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
                  : data?.name
                  ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}`
                  : 'M.V. Usuario'}
              </span>
            </div>
            <div
              className={`w-2 h-2 border-r-2 border-b-2 border-primary transition-transform duration-300 ${
                showDropdown ? 'rotate-[-135deg]' : 'rotate-45'
              }`}
            ></div>
          </button>

          {showDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-gradient-dark border border-primary/20 rounded-lg shadow-xl overflow-hidden animate-fadeIn z-10">
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
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left text-text"
              >
                <LogOut className="w-4 h-4 text-primary" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estilos internos */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
};

// Header Mobile/Tablet
const HeaderMobile: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useAuth();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} showSubtitle={false} layout="horizontal" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/20 active:scale-95 transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-muted leading-tight">Hola,</span>
              <span className="text-[10px] font-semibold text-primary leading-tight whitespace-nowrap">
                {data?.name && data?.lastName
                  ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
                  : data?.name
                  ? `M.V. ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}`
                  : 'M.V. Usuario'}
              </span>
            </div>
            <div
              className={`w-1.5 h-1.5 border-r-2 border-b-2 border-primary transition-transform duration-300 ${
                showDropdown ? 'rotate-[-135deg]' : 'rotate-45'
              }`}
            ></div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-gradient-dark border border-primary/20 rounded-lg shadow-xl overflow-hidden animate-fadeIn z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // TODO: Perfil
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
                    // TODO: Cambiar contraseña
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
    queryClient.invalidateQueries({ queryKey: ['user'] });
    navigate('/auth/login');
  };

  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Inicio', action: () => { setActiveTab('home'); navigate('/'); } },
    { id: 'notif', icon: Bell, label: 'Notificaciones', action: () => { setActiveTab('notif'); navigate('/notifications'); } },
    { id: 'logout', icon: LogOut, label: 'Salir', action: handleLogout },
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
  const [activeItem, setActiveItem] = useState('/');
  const { data, isError, isLoading } = useAuth();

  if (isLoading) return 'cargando...';
  if (isError) {
    return <Navigate to="/auth/login" />;
  }

  if (data)
    return (
      <div className="min-h-screen bg-gradient-dark text-text overflow-hidden relative">
        <div className="fixed inset-0 bg-gradient-radial-top-right opacity-30"></div>
        <div className="fixed inset-0 bg-gradient-radial-bottom-left opacity-20"></div>

        {/* Solo en mobile: header + footer */}
        <HeaderMobile />
        <Footer />

        {/* Solo en desktop: sidebar completo */}
        <SidebarDesktop activeItem={activeItem} setActiveItem={setActiveItem} />

        {/* Contenido principal */}
        <main className="pt-20 pb-24 lg:pt-0 lg:pb-0 lg:pl-64 px-4 relative z-10 min-h-screen">
          <div className="w-full sm:max-w-lg md:max-w-3xl lg:max-w-7xl lg:p-10 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    );

  return null;
};

export default AppLayout;