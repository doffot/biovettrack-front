// src/components/MainMenu.tsx
import React from "react";
import {
  User,
  Heart,
  BarChart3,
  FileText,
  Bath,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMedia } from "../hooks/useMedia";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  to?: string;
}

const MainMenu: React.FC = () => {
  const isDesktop = useMedia("(min-width: 1024px)");
  if (isDesktop) {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      id: "dueno",
      title: "Dueño",
      icon: User,
      color: "bg-purple-500/20 border-purple-500/30",
      iconColor: "text-purple-400",
      to: "/owners",
    },
    {
      id: "mascota",
      title: "Mascota",
      icon: Heart,
      color: "bg-green-500/20 border-green-500/30",
      iconColor: "text-green-400",
      to: "/patients",
    },
    {
      id: "peluqueria",
      title: "Peluquería",
      icon: Bath,
      color: "bg-teal-500/20 border-teal-500/30",
      iconColor: "text-teal-400",
      to: "/grooming-services",
    },
    {
      id: "consulta",
      title: "Consulta",
      icon: FileText,
      color: "bg-orange-500/20 border-orange-500/30",
      iconColor: "text-orange-400",
    },
    {
      id: "reportes",
      title: "Reportes",
      icon: BarChart3,
      color: "bg-indigo-500/20 border-indigo-500/30",
      iconColor: "text-indigo-400",
      to: "/reports",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Menú principal con padding superior adicional */}
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24">
        <div className="flex flex-col gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            const content = (
              <div
                className={`
                  relative overflow-hidden rounded-2xl border-2 p-6
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
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-black/20 ${item.iconColor}`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-text font-bold text-xl flex-1">
                    {item.title}
                  </h3>
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
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;