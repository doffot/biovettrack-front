// src/data/menuItems.ts
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
  Package,
  Archive,
  ClipboardList,
  AlertTriangle,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import type { MenuItem } from "../../types";

export const menuItems: MenuItem[] = [
  { to: "/", label: "Inicio", icon: HomeIcon },

  // Clientes y mascotas (acceso directo)
  { to: "/owners", label: "Dueños", icon: User },
  { to: "/patients", label: "Mascotas", icon: PawPrint },

  // Servicios operativos
  { to: "/appointments", label: "Citas", icon: Calendar },
  { to: "/lab-exams", label: "Laboratorio", icon: Activity },
  { to: "/grooming-services", label: "Peluquería", icon: Scissors },

  // Ventas (como módulo principal, aunque solo tengas una vista)
  {
    label: "Ventas",
    icon: ShoppingCart,
    subItems: [
      { to: "/sales", label: "Registrar venta", icon: Receipt },
    ],
  },

  // Inventario (solo lo que ya tienes implementado)
  {
    label: "Inventario",
    icon: Package,
    subItems: [
      { to: "/products", label: "Productos", icon: Archive },
      { to: "/inventory/stock", label: "Stock actual", icon: Package },
      { to: "/inventory/movements", label: "Movimientos", icon: ClipboardList },
      { to: "/inventory/low-stock", label: "Stock bajo", icon: AlertTriangle },
    ],
  },

  // Compras
  {
    label: "Compras",
    icon: Receipt,
    subItems: [
      { to: "/purchases/create", label: "Registrar compra", icon: Receipt },
      { to: "/purchases", label: "Historial de compras", icon: ClipboardList },
    ],
  },

  // Reportes (solo los que ya existen)
  {
    label: "Reportes",
    icon: BarChart3,
    subItems: [
      { to: "/grooming/report", label: "Peluquería", icon: Scissors },
      { to: "/invoices/report", label: "Facturación", icon: FileText },
      { to: "/inventory/report", label: "Inventario", icon: Package }, // ⚠️ Ver nota abajo
      { to: "/purchases/report", label: "Compras", icon: ShoppingCart }, // ⚠️ Ver nota abajo
    ],
  },

  // Configuración
  {
    label: "Configuraciones",
    icon: Settings,
    subItems: [
      { to: "/staff", label: "Staff", icon: Users },
      { to: "/payment-methods", label: "Métodos de Pago", icon: CreditCard },
    ],
  },
];