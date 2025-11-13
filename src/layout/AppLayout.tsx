// src/layout/AppLayout.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Home as HomeIcon,
  LogOut,
  User,
  PawPrint,
  Scissors,
  FileText,
  BarChart3,
  Moon,
  Sun,
  CreditCard
} from 'lucide-react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

const menuItems = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/owners', label: 'Dueño', icon: User },
  { to: '/patients', label: 'Mascota', icon: PawPrint },
  { to: '/grooming-services', label: 'Peluquería', icon: Scissors },
  { to: '/medical-history', label: 'Consulta', icon: FileText },
  { to: '/grooming/report', label: 'Reportes', icon: BarChart3 },
  { to: 'payment-methods', label: 'Métodos de Pago', icon: CreditCard },
];

const HeaderDesktop: React.FC<{ 
  selectedTitle: string; 
  onTitleChange: (title: 'Dr.' | 'Dra.') => void; 
}> = ({ selectedTitle, onTitleChange }) => {
  const { data } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = data?.name && data?.lastName
    ? `${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
    : data?.name
    ? data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
    : 'Usuario';

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return (
    <header className="hidden lg:flex fixed top-0 left-64 right-0 z-40 h-16 items-center justify-end px-6 bg-white border-b border-gray-200">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600 group-hover:text-vet-primary transition-colors" />
          </div>

          <span className="text-sm font-medium text-gray-700 group-hover:text-vet-primary transition-colors">
            {selectedTitle} {displayName}
          </span>
          <div
            className={`w-2 h-2 border-r-2 border-b-2 border-gray-600 transition-transform duration-200 ml-1 ${
              isOpen ? 'rotate-[-135deg]' : 'rotate-45'
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Título profesional</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onTitleChange('Dr.');
                    setIsOpen(false);
                  }}
                  className={`text-xs px-2 py-1 rounded flex-1 transition-colors ${
                    selectedTitle === 'Dr.'
                      ? 'bg-vet-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dr.
                </button>
                <button
                  onClick={() => {
                    onTitleChange('Dra.');
                    setIsOpen(false);
                  }}
                  className={`text-xs px-2 py-1 rounded flex-1 transition-colors ${
                    selectedTitle === 'Dra.'
                      ? 'bg-vet-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dra.
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                // TODO: Perfil
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-vet-primary" />
              <span className="text-sm">Perfil</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
            >
              {document.documentElement.classList.contains('dark') ? (
                <Sun className="w-4 h-4 text-vet-primary" />
              ) : (
                <Moon className="w-4 h-4 text-vet-primary" />
              )}
              <span className="text-sm">
                {document.documentElement.classList.contains('dark') ? 'Modo claro' : 'Modo oscuro'}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const SidebarDesktop: React.FC<{
  activeItem: string;
  setActiveItem: (to: string) => void;
}> = ({ activeItem, setActiveItem }) => {
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 z-50 w-64 h-full bg-vet-sidebar border-r border-vet-primary/20">
      <div className="flex items-center justify-center p-5 border-b border-vet-primary/30">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setActiveItem(item.to)}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${activeItem === item.to
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}
              `}
            >
              <item.icon 
                className={`w-5 h-5 flex-shrink-0 ${
                  activeItem === item.to ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`} 
              />
              <span className="text-sm whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-vet-primary/30">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </div>
    </aside>
  );
};

const HeaderMobile: React.FC<{ 
  selectedTitle: string; 
  onTitleChange: (title: 'Dr.' | 'Dra.') => void; 
}> = ({ selectedTitle, onTitleChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useAuth();

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN_LABVET');
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-vet-sidebar border-b border-vet-primary/20">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} showSubtitle={false} layout="horizontal" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/20 border border-white/30 active:scale-95 transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold text-white leading-tight whitespace-nowrap">
                {data?.name && data?.lastName
                  ? `${selectedTitle} ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()} ${data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()}`
                  : data?.name
                  ? `${selectedTitle} ${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}`
                  : `${selectedTitle}. Usuario`}
              </span>
            </div>
            <div
              className={`w-1.5 h-1.5 border-r-2 border-b-2 border-white transition-transform duration-300 ${
                showDropdown ? 'rotate-[-135deg]' : 'rotate-45'
              }`}
            ></div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fadeIn z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left text-gray-700 border-b border-gray-200"
                >
                  <User className="w-4 h-4 text-vet-primary" />
                  <span className="text-sm">Perfil</span>
                </button>

                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Título profesional</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTitleChange('Dr.')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        selectedTitle === 'Dr.' ? 'bg-vet-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Dr.
                    </button>
                    <button
                      onClick={() => onTitleChange('Dra.')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        selectedTitle === 'Dra.' ? 'bg-vet-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Dra.
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left text-gray-700 border-b border-gray-200"
                >
                  <svg className="w-4 h-4 text-vet-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-sm">Cambiar contraseña</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left text-gray-700"
                >
                  <LogOut className="w-4 h-4 text-vet-primary" />
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
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-vet-sidebar border-t border-vet-primary/20">
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
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              style={{ flexBasis: '30%' }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

const AppLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState('/');
  const { data, isError, isLoading } = useAuth();

  const [selectedTitle, setSelectedTitle] = useState<string>(() => {
    const saved = localStorage.getItem('user_title');
    return saved === 'Dr.' || saved === 'Dra.' ? saved : 'Dr.';
  });



  // Cargar tema al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Usar preferencia del sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleTitleChange = (newTitle: 'Dr.' | 'Dra.') => {
    setSelectedTitle(newTitle);
    localStorage.setItem('user_title', newTitle);
  };

  if (isLoading) return 'cargando...';
  if (isError) {
    return <Navigate to="/auth/login" />;
  }

  if (data)
    return (
      <div className="min-h-screen bg-vet-gradient text-vet-text overflow-hidden relative">
        <HeaderDesktop selectedTitle={selectedTitle} onTitleChange={handleTitleChange} />
        <HeaderMobile selectedTitle={selectedTitle} onTitleChange={handleTitleChange} />
        <Footer />

        <SidebarDesktop 
          activeItem={activeItem} 
          setActiveItem={setActiveItem} 
        />

        <main className="pt-14 pb-20 lg:pt-16 lg:pb-0 lg:pl-64 relative z-10 min-h-screen bg-vet-gradient">
          <Outlet />
        </main>
      </div>
    );

  return null;
};

export default AppLayout;