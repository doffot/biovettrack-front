import {
  Home as HomeIcon,
  User,
  PawPrint,
  Scissors,
  BarChart3,
  CreditCard,
  Activity,
  Settings,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import type { MenuItem } from "../../types";

export const menuItems: MenuItem[] = [
  { to: "/", label: "Inicio", icon: HomeIcon },
  { to: "/owners", label: "Dueño", icon: User },
  { to: "/patients", label: "Mascota", icon: PawPrint },
  { to: "/appointments", label: "Citas", icon: Calendar },
  { to: "/lab-exams", label: "Crear Hemograma", icon: Activity },
  { to: "/grooming-services", label: "Peluquería", icon: Scissors },
  {
    label: "Reportes",
    icon: BarChart3,
    subItems: [
      { to: "/grooming/report", label: "Peluquería", icon: Scissors },
      { to: "/invoices/report", label: "Facturación", icon: FileText },
    ],
  },
  {
    label: "Configuraciones",
    icon: Settings,
    subItems: [
      { to: "/payment-methods", label: "Métodos de Pago", icon: CreditCard },
      { to: "/staff", label: "Staff", icon: Users },
    ],
  },
];