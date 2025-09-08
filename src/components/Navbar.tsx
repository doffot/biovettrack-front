import { useState, useEffect } from 'react';
// Simulando Link para la demo
const Link = ({  children, className, onMouseEnter, onMouseLeave }: any) => (
  <div className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{cursor: 'pointer'}}>
    {children}
  </div>
);
import Logo from './Logo';

// Tipos TypeScript
interface NavLink {
  to: string;
  label: string;
  icon: string;
  description: string;
}

interface HoverIndicatorProps {
  activeIndex: number;
  hoveredIndex: number | null;
}

// Enlaces sincronizados con MobileHome
const navLinks: NavLink[] = [
  { 
    to: '/new-owner', 
    label: 'Dueño', 
    icon: '👤', 
    description: 'Registrar propietario' 
  },
  { 
    to: '/new-pet', 
    label: 'Mascota', 
    icon: '🐾', 
    description: 'Nueva mascota' 
  },
  { 
    to: '/new-exam', 
    label: 'Examen', 
    icon: '🧪', 
    description: 'Crear examen' 
  },
  { 
    to: '/reports', 
    label: 'Reportes', 
    icon: '📊', 
    description: 'Ver reportes' 
  },
  { 
    to: '/send', 
    label: 'Enviar', 
    icon: '📤', 
    description: 'Enviar datos' 
  },
  { 
    to: '/print', 
    label: 'Imprimir', 
    icon: '🖨️', 
    description: 'Imprimir documentos' 
  },
];

// Indicador de hover animado
const HoverIndicator = ({ activeIndex, hoveredIndex }: HoverIndicatorProps) => {
  const index = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const percentage = 100 / navLinks.length;
  
  return (
    <div 
      className="absolute bottom-0 h-0.5 bg-primary transition-all duration-500 ease-out"
      style={{
        left: `${index * percentage}%`,
        width: `${percentage}%`,
        boxShadow: '0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.4)',
      }}
    />
  );
};

// Componente de enlace individual
const NavLinkItem = ({ link, index, isActive, onHover, onLeave }: {
  link: NavLink;
  index: number;
  isActive: boolean;
  onHover: (index: number) => void;
  onLeave: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={link.to}
      className="relative flex-1 group"
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(index);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onLeave();
      }}
    >
      <div className="relative px-1.5 py-1.5 flex flex-col items-center transition-all duration-300">
        
        {/* Background glow on hover */}
        <div className={`absolute inset-0 bg-primary/5 rounded-lg transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
        }`}></div>
        
        {/* Icon */}
        <div 
          className={`text-lg mb-1 transition-all duration-300 relative z-10 ${
            isActive ? 'text-primary' : isHovered ? 'text-primary' : 'text-muted'
          }`}
          style={{
            filter: isHovered || isActive ? 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.6))' : 'none',
            transform: isHovered ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
          }}
        >
          {link.icon}
        </div>
        
        {/* Label */}
        <span 
          className={`text-xs font-medium transition-all duration-300 relative z-10 ${
            isActive ? 'text-primary' : isHovered ? 'text-text' : 'text-muted'
          }`}
        >
          {link.label}
        </span>
        
        {/* Description tooltip */}
        <div className={`absolute top-full mt-2 px-3 py-2 bg-background/90 backdrop-blur-xl border border-primary/30 rounded-lg text-xs text-text whitespace-nowrap transition-all duration-300 pointer-events-none z-50 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {link.description}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-background/90 border-l border-t border-primary/30 rotate-45"></div>
        </div>
        
        {/* Active state indicator */}
        {isActive && (
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-neon-pulse"></div>
        )}
      </div>
    </Link>
  );
};

// Partículas de fondo
const BackgroundParticles = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-shimmer"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '8s',
          }}
        />
      ))}
    </div>
  );
};

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar el índice activo basado en la ruta actual (simulado)
  useEffect(() => {
    const path = window.location.pathname;
    const index = navLinks.findIndex(link => link.to === path);
    if (index !== -1) setActiveIndex(index);
  }, []);

  return (
    <nav className="relative bg-background/95 backdrop-blur-xl border-b border-primary/20 shadow-2xl">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/98 to-background"></div>
      <BackgroundParticles />
      
      {/* Cyber grid overlay */}
      <div className="absolute inset-0 opacity-3" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px'
           }}>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo section - USANDO EL NUEVO COMPONENTE */}
          <Link 
            to="/" 
            className={`group transition-all duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Logo 
                  size="sm" 
                  showText={false} 
                  className=""
                  iconClassName="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -inset-2 border border-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-soft"></div>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-black text-text group-hover:text-primary transition-colors duration-300">
                  BioVet<span className="text-primary animate-neon-pulse">Track</span>
                </h1>
                <p className="text-xs text-muted font-mono tracking-wider">
                  {'>'} VETERINARY_SYSTEM.EXE
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation links - AJUSTADO EL TAMAÑO */}
          <div className={`relative flex bg-background/50 backdrop-blur-xl rounded-xl border border-primary/20 p-1 transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Hover indicator */}
            <HoverIndicator 
              activeIndex={activeIndex} 
              hoveredIndex={hoveredIndex} 
            />
            
            {/* Navigation items */}
            {navLinks.map((link, index) => (
              <NavLinkItem
                key={link.to}
                link={link}
                index={index}
                isActive={activeIndex === index}
                onHover={setHoveredIndex}
                onLeave={() => setHoveredIndex(null)}
              />
            ))}
          </div>

          {/* Status indicator */}
          <div className={`hidden md:flex items-center space-x-3 transition-all duration-700 delay-400 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="flex items-center space-x-2 px-3 py-2 bg-background/50 backdrop-blur-xl rounded-full border border-primary/20">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-neon-pulse"></div>
              <span className="text-xs text-muted font-mono">ONLINE</span>
            </div>
            <div className="w-px h-6 bg-primary/30"></div>
            <div className="text-xs text-muted font-mono">
              {new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </nav>
  );
}