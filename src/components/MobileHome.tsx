import { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  BarChart3, 
  FileText, 
  Send, 
  Printer,
  Stethoscope 
} from 'lucide-react';

// Tipos TypeScript (mantengo los tuyos)
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface Tile {
  to: string;
  label: string;
  icon: any; // Cambiado para usar Lucide icons
  description: string;
  color: string;
  iconColor: string;
}

interface TileCardProps {
  tile: Tile;
  index: number;
}

// Tiles actualizados con iconos de Lucide y colores de tu paleta
const tiles: Tile[] = [
  {
    to: '/owners',
    label: 'Dueño',
    icon: User,
    description: 'Gestionar propietarios',
    color: 'border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  { 
    to: '/new-pet', 
    label: 'Mascota', 
    icon: Heart,
    description: 'Nueva mascota',
    color: 'border-green-500/30',
    iconColor: 'text-green-400'
  },
  { 
    to: '/new-exam', 
    label: 'Análisis', 
    icon: BarChart3,
    description: 'Crear análisis',
    color: 'border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  { 
    to: '/clinical-history', 
    label: 'Historia Clínica', 
    icon: FileText,
    description: 'Historia médica',
    color: 'border-orange-500/30',
    iconColor: 'text-orange-400'
  },
  { 
    to: '/hematology', 
    label: 'Hematología', 
    icon: Stethoscope,
    description: 'Estudios hematológicos',
    color: 'border-red-500/30',
    iconColor: 'text-red-400'
  },
  { 
    to: '/reports', 
    label: 'Reportes', 
    icon: FileText,
    description: 'Ver reportes',
    color: 'border-indigo-500/30',
    iconColor: 'text-indigo-400'
  },
  { 
    to: '/send', 
    label: 'Enviar', 
    icon: Send,
    description: 'Enviar datos',
    color: 'border-cyan-500/30',
    iconColor: 'text-cyan-400'
  },
  { 
    to: '/print', 
    label: 'Imprimir', 
    icon: Printer,
    description: 'Imprimir documentos',
    color: 'border-pink-500/30',
    iconColor: 'text-pink-400'
  },
];

// Componente: Partículas flotantes (mantengo tu lógica exacta)
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle: Particle) => (
        <div
          key={particle.id}
          className="absolute bg-primary/20 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

// Componente: Azulejo interactivo (mantengo tu lógica, actualizo estilos)
const TileCard = ({ tile, index }: TileCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tile.icon;

  return (
    <div
      className="group relative transform transition-all duration-500 hover:scale-105 tile-entrance h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // Aquí iría la navegación: navigate(tile.to)
        console.log(`Navegando a: ${tile.to}`);
      }}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Efecto de brillo neón (mantengo tu efecto exacto) */}
      <div className="absolute -inset-1 bg-primary rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
      <div className={`absolute -inset-0.5 border ${tile.color} group-hover:border-primary/50 rounded-2xl transition-all duration-500`}></div>
      
      {/* Tarjeta principal */}
      <div className="relative bg-background/80 backdrop-blur-xl border border-muted/20 rounded-xl h-full flex flex-col items-center justify-center text-center text-text hover:border-primary/50 transition-all duration-500 overflow-hidden px-2 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4">
        
        {/* Líneas de acento (mantengo tu efecto exacto) */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Icono con efecto hover */}
          <div className={`p-3 rounded-xl bg-black/20 mb-1 md:mb-2 lg:mb-3 transform transition-all duration-500 ${tile.iconColor} ${isHovered ? 'scale-110' : ''}`}>
            <Icon 
              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" 
              style={{ 
                filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none'
              }}
            />
          </div>
          
          <h3 className="font-bold text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 text-text group-hover:text-primary transition-colors duration-300">
            {tile.label}
          </h3>
          <p className="text-[10px] md:text-xs lg:text-sm text-muted font-medium group-hover:text-text/80 transition-colors duration-300 leading-tight">
            {tile.description}
          </p>
        </div>

        {/* Esquina neón (mantengo tu efecto exacto) */}
        <div className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 lg:top-3 lg:right-3 w-1.5 h-1.5 md:w-2 md:h-2 lg:w-3 lg:h-3 bg-primary rounded-full transition-all duration-500 ${isHovered ? 'shadow-neon' : 'opacity-40'}`}></div>
        
        {/* Línea de hover (mantengo tu efecto exacto) */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>        </div>
      </div>
    </div>
  );
};

// Vista principal: Menú inicial móvil (mantengo toda tu lógica)
export default function MobileMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-full">
      
      {/* Fondo cyberpunk (mantengo tu efecto exacto) */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }}>
      </div>
      
      {/* Glow neón de fondo (mantengo tu efecto exacto) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>
      
      {/* Partículas flotantes */}
      <FloatingParticles />
      
      {/* Contenido principal */}
      <div className="relative z-10 px-4 py-6">
        {/* Grid de azulejos */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4 lg:gap-6 w-full max-w-xs md:max-w-2xl lg:max-w-4xl mx-auto transform transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {tiles.map((tile, index) => (
            <div key={tile.to} className="h-20 md:h-28 lg:h-36">
              <TileCard tile={tile} index={index} />
            </div>
          ))}
        </div>

        {/* Footer decorativo (mantengo tu efecto exacto) */}
        <div className={`text-center pt-8 md:pt-12 transform transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 md:w-6 lg:w-8 h-px bg-primary/40"></div>
            <div className="mx-2 md:mx-3 w-1.5 md:w-2 h-1.5 md:h-2 bg-primary rounded-full animate-neon-pulse"></div>
            <div className="w-4 md:w-6 lg:w-8 h-px bg-primary/40"></div>
          </div>
          <p className="text-muted/60 text-[10px] md:text-xs font-mono tracking-wider">
            {'>'} POWERED_BY_DOFFOTDEV {'<'}
          </p>
        </div>
      </div>
    </div>
  );
}