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

// Componente Header
const Header: React.FC<{ onMenuToggle: () => void; isMenuOpen: boolean }> = ({ 
  onMenuToggle, 
  isMenuOpen 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-b border-primary/20">
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

// Componente Footer (con links)
const Footer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const tabs = [
    { id: 'home',   icon: Home,   label: 'Inicio',        path: '/' },
    { id: 'notif',  icon: Bell,   label: 'Notificaciones',path: '/notifications' },
    { id: 'logout', icon: LogOut, label: 'Salir',         path: '/login' }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-dark backdrop-blur-md border-t border-primary/20">
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

// Componente principal AppLayout
const AppLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-dark text-text overflow-hidden">
      {/* Efectos de fondo */}
      <div className="fixed inset-0 bg-gradient-radial-top-right opacity-30"></div>
      <div className="fixed inset-0 bg-gradient-radial-bottom-left opacity-20"></div>
      
      {/* Header */}
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
      
      {/* Contenido principal */}
      <main className="pt-20 pb-24 px-4 relative z-10">
        <div className="max-w-md lg:max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlay del menú */}
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