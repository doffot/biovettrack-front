// src/layout/AppLayout.tsx
import React, { useState } from 'react';
import { 
  Home, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X
} from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import Logo from '../components/Logo';

// ✅ SOLO EXTRAEMOS LOS LINKS DE MainMenu.tsx (sin íconos, sin colores, solo to y label)
const desktopMenuItems = [
  { to: '/owners', label: 'Dueño', icon: '👤' },
  { to: '/patients', label: 'Mascota', icon: '🐾' }, // 👈 Cambiado de /new-pet a /patients
  { to: '/grooming-services', label: 'Peluquería', icon: '🛁' }, // 👈 Nuevo
  { to: '/medical-history', label: 'Historia Clínica', icon: '📋' },
  { to: '/hematology', label: 'Hematología', icon: '🩸' },
  { to: '/reports', label: 'Reportes', icon: '📊' },
  { to: '/send', label: 'Enviar', icon: '📤' },
  { to: '/print', label: 'Imprimir', icon: '🖨️' },
];

// Header Mobile/Tablet (sin cambios)
const HeaderMobile: React.FC<{ onMenuToggle: () => void; isMenuOpen: boolean }> = ({ 
  onMenuToggle, 
  isMenuOpen 
}) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-primary font-bold text-lg tracking-tight">
            BioVetTrack
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-radial-center border-2 border-primary/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-neon-pulse"></div>
          </div>

          <button
            onClick={onMenuToggle}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

// Header Desktop: solo cambiamos los items, NADA MÁS
const HeaderDesktop: React.FC = () => {
  const [activeItem, setActiveItem] = useState('/');
  const navigate = useNavigate();

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-muted/10">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-primary font-bold text-xl tracking-tight">
            BioVetTrack
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="w-5 h-5 text-muted" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-radial-center border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm text-text"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Menú horizontal: solo cambiamos los items, estilo igual */}
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
      `}</style>
    </header>
  );
};

// Footer (sin cambios)
const Footer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const tabs = [
    { id: 'home',   icon: Home,   label: 'Inicio',        path: '/' },
    { id: 'notif',  icon: Bell,   label: 'Notificaciones',path: '/notifications' },
    { id: 'logout', icon: LogOut, label: 'Salir',         path: '/login' }
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
              onClick={() => {
                setActiveTab(tab.id);
                navigate(tab.path);
              }}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-dark text-text overflow-hidden">
      <div className="fixed inset-0 bg-gradient-radial-top-right opacity-30"></div>
      <div className="fixed inset-0 bg-gradient-radial-bottom-left opacity-20"></div>
      
      <HeaderMobile onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
      <HeaderDesktop />
      
      <main className="pt-20 pb-24 lg:pt-32 lg:pb-8 px-4 relative z-10">
        <div className="max-w-md lg:max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <Footer />

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;