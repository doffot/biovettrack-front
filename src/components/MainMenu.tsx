// src/components/MainMenu.tsx
import React from 'react';
import { 
  User, 
  Heart, 
  BarChart3, 
  FileText, 
  Stethoscope,
  Send,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  to?: string;
}

const MainMenu: React.FC = () => {
  const menuItems: MenuItem[] = [
    {
      id: 'dueno',
      title: 'Dueño',
      subtitle: 'Gestionar propietarios',
      icon: User,
      color: 'bg-purple-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      to: '/owners'
    },
    {
      id: 'mascota',
      title: 'Mascota',
      subtitle: 'Nueva mascota',
      icon: Heart,
      color: 'bg-green-500/20 border-green-500/30',
      iconColor: 'text-green-400',
      to: '/patients'
    },
    {
      id: 'analisis',
      title: 'Análisis',
      subtitle: 'Crear análisis',
      icon: BarChart3,
      color: 'bg-blue-500/20 border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      id: 'historia',
      title: 'Historia Clínica',
      subtitle: 'Historia médica',
      icon: FileText,
      color: 'bg-orange-500/20 border-orange-500/30',
      iconColor: 'text-orange-400'
    },
    {
      id: 'hematologia',
      title: 'Hematología',
      subtitle: 'Estudios hematológicos',
      icon: Stethoscope,
      color: 'bg-red-500/20 border-red-500/30',
      iconColor: 'text-red-400'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      subtitle: 'Ver reportes',
      icon: FileText,
      color: 'bg-indigo-500/20 border-indigo-500/30',
      iconColor: 'text-indigo-400'
    },
    {
      id: 'enviar',
      title: 'Enviar',
      subtitle: 'Enviar datos',
      icon: Send,
      color: 'bg-cyan-500/20 border-cyan-500/30',
      iconColor: 'text-cyan-400'
    },
    {
      id: 'imprimir',
      title: 'Imprimir',
      subtitle: 'Imprimir documentos',
      icon: Printer,
      color: 'bg-pink-500/20 border-pink-500/30',
      iconColor: 'text-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        
        const content = (
          <div
            key={item.id}
            className={`
              relative overflow-hidden rounded-2xl border-2 p-6 min-h-48
              bg-gradient-radial-center backdrop-blur-sm
              hover:shadow-premium-hover hover:scale-105
              transition-all duration-300 cursor-pointer
              tile-entrance ${item.color}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Efecto shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            
            {/* Contenido */}
            <div className="relative z-10 flex flex-col items-center text-center gap-3 h-full">
              <div className={`p-3 rounded-xl bg-black/20 ${item.iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-text font-bold text-lg mb-1">
                  {item.title}
                </h3>
                <p className="text-muted text-sm leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* Decoración de esquina */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60"></div>
          </div>
        );

        return item.to ? (
          <Link to={item.to} key={item.id}>
            {content}
          </Link>
        ) : (
          <div key={item.id}>
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default MainMenu;