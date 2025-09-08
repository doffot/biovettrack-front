// components/AppMenu.tsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Tipos TypeScript
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
  icon: string;
  description: string;
}

interface TileCardProps {
  tile: Tile;
  index: number;
}

// Lista de azulejos
const tiles: Tile[] = [
  {
    to: "/owners",
    label: "Dueño",
    icon: "👤",
    description: "Gestionar propietarios",
  },
  {
    to: "/new-pet",
    label: "Mascota",
    icon: "🐾",
    description: "Nueva mascota",
  },
  {
    to: "/new-exam",
    label: "Análisis",
    icon: "🧪",
    description: "Crear análisis",
  },
  {
    to: "/medical-history",
    label: "Historia Clínica",
    icon: "📋",
    description: "Historia médica",
  },
  {
    to: "/hematology",
    label: "Hematología",
    icon: "🩸",
    description: "Estudios hematológicos",
  },
  {
    to: "/reports",
    label: "Reportes",
    icon: "📊",
    description: "Ver reportes",
  },
  {
    to: "/send",
    label: "Enviar",
    icon: "📤",
    description: "Enviar datos",
  },
  {
    to: "/print",
    label: "Imprimir",
    icon: "🖨️",
    description: "Imprimir documentos",
  },
];

// Componente: Partículas flotantes
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
      {particles.map((particle) => (
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
            boxShadow: "0 0 10px rgba(57, 255, 20, 0.3)",
          }}
        />
      ))}
    </div>
  );
};

// Componente: Azulejo interactivo
const TileCard = ({ tile, index }: TileCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={tile.to}
      className="group relative transform transition-all duration-500 hover:scale-105 tile-entrance h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="absolute -inset-1 bg-primary rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
      <div className="absolute -inset-0.5 border border-primary/0 group-hover:border-primary/50 rounded-2xl transition-all duration-500"></div>

      <div className="relative bg-background/80 backdrop-blur-xl border border-muted/20 rounded-xl h-full flex flex-col items-center justify-center text-center text-text hover:border-primary/50 transition-all duration-500 overflow-hidden px-2 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div
            className={`text-lg md:text-2xl lg:text-3xl mb-1 md:mb-2 lg:mb-3 transform transition-all duration-500 ${
              isHovered ? "scale-110 drop-shadow-lg" : ""
            }`}
            style={{
              filter: isHovered
                ? "drop-shadow(0 0 8px rgba(57, 255, 20, 0.6))"
                : "none",
              textShadow: isHovered
                ? "0 0 10px rgba(57, 255, 20, 0.4)"
                : "none",
            }}
          >
            {tile.icon}
          </div>
          <h3 className="font-bold text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 text-text group-hover:text-primary transition-colors duration-300">
            {tile.label}
          </h3>
          <p className="text-[10px] md:text-xs lg:text-sm text-muted font-medium group-hover:text-text/80 transition-colors duration-300 leading-tight">
            {tile.description}
          </p>
        </div>

        <div
          className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 lg:top-3 lg:right-3 w-1.5 h-1.5 md:w-2 md:h-2 lg:w-3 lg:h-3 bg-primary rounded-full transition-all duration-500 ${
            isHovered ? "shadow-neon" : "opacity-40"
          }`}
        ></div>

        <div
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        ></div>
      </div>
    </Link>
  );
};

// ✅ Componente principal: AppMenu
export default function AppMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className=" relative overflow-hidden flex flex-col flex-1">
      {/* Fondo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>

      {/* Partículas */}
      <FloatingParticles />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col flex-1 px-4 pt-16 pb-4">
        <div className="flex-1 flex items-center justify-center py-2">
          <div
            className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 lg:gap-6 w-full max-w-xs md:max-w-2xl lg:max-w-5xl transform transition-all duration-1000 delay-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {tiles.map((tile, index) => (
              <div key={tile.to} className="h-20 md:h-28 lg:h-36">
                <TileCard tile={tile} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}