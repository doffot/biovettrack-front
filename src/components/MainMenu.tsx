// src/components/MainMenu.tsx
import React from "react";
import {
  User,
  PawPrint,
  Scissors,
  CreditCard,
  ChevronRight,
  Activity,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMedia } from "../hooks/useMedia";

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  color: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const MainMenu: React.FC = () => {
  const isDesktop = useMedia("(min-width: 1024px)");

  if (isDesktop) {
    return null;
  }

  const menuSections: MenuSection[] = [
    {
      id: "main",
      title: "Gestión Principal",
      icon: User,
      items: [
        {
          id: "owners",
          title: "Dueño",
          subtitle: "Gestionar propietarios",
          icon: User,
          to: "/owners",
          color: "text-sky-600",
          bgColor: "bg-sky-50",
          gradientFrom: "from-sky-500",
          gradientTo: "to-sky-600",
        },
        {
          id: "patients",
          title: "Mascota",
          subtitle: "Expedientes médicos",
          icon: PawPrint,
          to: "/patients",
          color: "text-pink-600",
          bgColor: "bg-pink-50",
          gradientFrom: "from-pink-500",
          gradientTo: "to-pink-600",
        },
        {
          id: "appointments",
          title: "Citas",
          subtitle: "Gestionar turnos médicos",
          icon: Calendar,
          to: "/appointments",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          gradientFrom: "from-amber-500",
          gradientTo: "to-amber-600",
        },
      ],
    },
    {
      id: "services",
      title: "Servicios",
      icon: Activity,
      items: [
        {
          id: "lab-exams",
          title: "Crear Hemograma",
          subtitle: "Laboratorio clínico",
          icon: Activity,
          to: "/lab-exams",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          gradientFrom: "from-purple-500",
          gradientTo: "to-purple-600",
        },
        {
          id: "grooming-services",
          title: "Peluquería",
          subtitle: "Servicios de estética",
          icon: Scissors,
          to: "/grooming-services",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          gradientFrom: "from-emerald-500",
          gradientTo: "to-emerald-600",
        },
      ],
    },
    {
      id: "reports",
      title: "Reportes",
      icon: BarChart3,
      items: [
        {
          id: "report-grooming",
          title: "Peluquería",
          subtitle: "Estadísticas de servicios",
          icon: Scissors,
          to: "/grooming/report",
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          gradientFrom: "from-indigo-500",
          gradientTo: "to-indigo-600",
        },
        {
          id: "report-invoices",
          title: "Facturación",
          subtitle: "Resúmenes de ingresos",
          icon: FileText,
          to: "/invoices/report",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          gradientFrom: "from-blue-500",
          gradientTo: "to-blue-600",
        },
      ],
    },
    {
      id: "config",
      title: "Configuración",
      icon: Settings,
      items: [
        {
          id: "payment-methods",
          title: "Métodos de Pago",
          subtitle: "Configurar formas de pago",
          icon: CreditCard,
          to: "/payment-methods",
          color: "text-green-600",
          bgColor: "bg-green-50",
          gradientFrom: "from-green-500",
          gradientTo: "to-green-600",
        },
        {
          id: "staff",
          title: "Staff",
          subtitle: "Gestionar personal médico",
          icon: Users,
          to: "/staff",
          color: "text-teal-600",
          bgColor: "bg-teal-50",
          gradientFrom: "from-teal-500",
          gradientTo: "to-teal-600",
        },
      ],
    },
  ];

  const renderCard = (item: MenuItem) => {
    const Icon = item.icon;

    return (
      <div
        className="
          relative bg-white rounded-2xl p-4 border border-gray-100/50
          transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.97]
          overflow-hidden group
        "
      >
        {/* Fondo con gradiente en hover */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo}
            opacity-0 group-hover:opacity-5 transition-opacity duration-300
          `}
        />

        {/* Efecto blur decorativo */}
        <div
          className={`
            absolute -top-8 -right-8 w-24 h-24 ${item.bgColor}
            rounded-full opacity-30 blur-2xl
            group-hover:scale-150 transition-transform duration-500
          `}
        />

        {/* Contenido */}
        <div className="relative flex items-center gap-4">
          {/* Icono con gradiente */}
          <div className="relative">
            <div
              className={`
                absolute inset-0 bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo}
                rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity
              `}
            />
            <div
              className={`
                relative flex-shrink-0 w-14 h-14 ${item.bgColor}
                rounded-2xl flex items-center justify-center
                shadow-sm group-hover:shadow-md transition-all duration-300
                group-hover:scale-110
              `}
            >
              <Icon className={`w-7 h-7 ${item.color}`} />
            </div>
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-vet-text text-base mb-0.5 font-montserrat">
              {item.title}
            </h3>
            <p className="text-xs text-vet-muted truncate font-inter">
              {item.subtitle}
            </p>
          </div>

          {/* Flecha */}
          <div className="flex-shrink-0">
            <ChevronRight
              className="
                w-6 h-6 text-gray-400
                group-hover:text-vet-primary group-hover:translate-x-1
                transition-all duration-300
              "
            />
          </div>
        </div>

        {/* Indicador de activación en hover */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-1 
            bg-gradient-to-r ${item.gradientFrom} ${item.gradientTo} 
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl
          `}
        />
      </div>
    );
  };

  const renderSection = (section: MenuSection) => {
    const SectionIcon = section.icon;

    return (
      <div key={section.id} className="space-y-3">
        {/* Título de sección */}
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 bg-vet-light rounded-lg">
            <SectionIcon className="w-4 h-4 text-vet-primary" />
          </div>
          <h2 className="text-sm font-semibold text-vet-text font-montserrat">
            {section.title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-vet-light to-transparent ml-2" />
        </div>

        {/* Cards de la sección */}
        <div className="space-y-2.5">
          {section.items.map((item) => (
            <Link key={item.id} to={item.to} className="block">
              {renderCard(item)}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-vet-light/30 via-white to-vet-light/20 pt-3">
      {/* Header decorativo */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vet-primary/5 to-vet-accent/5" />
        <div className="relative px-6 pt-4 pb-4">
          <h1 className="text-2xl font-bold text-vet-text font-montserrat mb-1">
            Panel Principal
          </h1>
          <p className="text-sm text-vet-muted font-inter">
            Accede rápidamente a todas las funciones
          </p>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-28 scrollbar-thin">
        <div className="max-w-md mx-auto space-y-6 pb-4">
          {menuSections.map((section) => renderSection(section))}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;