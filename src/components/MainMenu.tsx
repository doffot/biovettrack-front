// src/components/MainMenu.tsx
import React from "react";
import {
  User,
  Heart,
  BarChart3,
  FileText,
  Scissors,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMedia } from "../hooks/useMedia";

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
}

const MainMenu: React.FC = () => {
  const isDesktop = useMedia("(min-width: 1024px)");
  if (isDesktop) {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      id: "owners",
      title: "Propietarios",
      subtitle: "Gestionar clientes",
      icon: User,
      to: "/owners",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "patients",
      title: "Mascotas",
      subtitle: "Expedientes médicos",
      icon: Heart,
      to: "/patients",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      id: "grooming",
      title: "Peluquería",
      subtitle: "Servicios de estética",
      icon: Scissors,
      to: "/grooming-services",
      color: "text-vet-primary",
      bgColor: "bg-vet-light",
    },
    {
      id: "payment-methods",
      title: "Métodos de Pago",
      subtitle: "Configurar pagos",
      icon: CreditCard,
      to: "/payment-methods",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      id: "reports",
      title: "Reportes",
      subtitle: "Análisis y estadísticas",
      icon: BarChart3,
      to: "/grooming/report",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "appointments",
      title: "Consultas",
      subtitle: "Próximamente",
      icon: FileText,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
      comingSoon: true,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-vet-light via-white to-vet-light/30">
      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28">
        <div className="max-w-md mx-auto space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = item.comingSoon;

            return (
              <div key={item.id}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="block"
                  >
                    <div className={`
                      relative bg-white rounded-2xl p-4 border border-gray-100
                      shadow-sm hover:shadow-md active:scale-[0.98]
                      transition-all duration-200 overflow-hidden
                      ${isDisabled ? 'opacity-60' : ''}
                    `}>
                      {/* Fondo decorativo */}
                      <div className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} rounded-full blur-3xl opacity-20 -mr-16 -mt-16`} />
                      
                      {/* Contenido */}
                      <div className="relative flex items-center gap-4">
                        {/* Icono */}
                        <div className={`flex-shrink-0 w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center shadow-sm`}>
                          <Icon className={`w-7 h-7 ${item.color}`} />
                        </div>

                        {/* Texto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-vet-text text-base mb-0.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-vet-muted truncate">
                            {item.subtitle}
                          </p>
                        </div>

                        {/* Flecha */}
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>

                      {item.comingSoon && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            Próximamente
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className={`
                    relative bg-white rounded-2xl p-4 border border-gray-100
                    shadow-sm opacity-60 overflow-hidden
                  `}>
                    {/* Fondo decorativo */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} rounded-full blur-3xl opacity-20 -mr-16 -mt-16`} />
                    
                    {/* Contenido */}
                    <div className="relative flex items-center gap-4">
                      {/* Icono */}
                      <div className={`flex-shrink-0 w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-7 h-7 ${item.color}`} />
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-vet-text text-base mb-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-vet-muted truncate">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Flecha */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    {item.comingSoon && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          Próximamente
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;