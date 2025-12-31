// src/views/notifications/NotificationsView.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertCircle,
  Calendar,
  Clock,
  Scissors,
  Syringe,
  Bug,
  FileText,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";

interface Notification {
  id: string;
  type: "urgent" | "today" | "upcoming";
  category: "invoice" | "appointment" | "grooming" | "vaccination" | "deworming";
  title: string;
  subtitle: string;
  time?: string;
  amount?: number;
  daysLeft?: number;
  link?: string;
  patientId?: string;
}

const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    todayAppointments,
    todayGrooming,
    pendingInvoices,
    upcomingVaccinations,
    upcomingDewormings,
    isFirstLoad,
  } = useDashboardData();

  // Función para formatear hora
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener nombre del paciente (genérica)
  const getPatientName = (patient: unknown): string => {
    if (!patient) return "Mascota";
    if (typeof patient === "object" && patient !== null && "name" in patient) {
      return (patient as { name: string }).name;
    }
    return "Mascota";
  };

  // Función para obtener ID del paciente (genérica)
  const getPatientId = (patient: unknown): string | undefined => {
    if (!patient) return undefined;
    if (typeof patient === "string") return patient;
    if (typeof patient === "object" && patient !== null && "_id" in patient) {
      return (patient as { _id: string })._id;
    }
    return undefined;
  };

  // Función para obtener nombre del dueño de una factura
  const getOwnerName = (invoice: unknown): string => {
    if (!invoice) return "Cliente";
    const inv = invoice as { ownerId?: { name?: string } };
    if (inv.ownerId && typeof inv.ownerId === "object" && inv.ownerId.name) {
      return inv.ownerId.name;
    }
    return "Cliente";
  };

  // Construir lista de notificaciones
  const buildNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    // 🔴 URGENTE: Facturas pendientes
    pendingInvoices.slice(0, 5).forEach((invoice) => {
      const pending = invoice.total - (invoice.amountPaid || 0);
      notifications.push({
        id: `invoice-${invoice._id}`,
        type: "urgent",
        category: "invoice",
        title: `Factura pendiente`,
        subtitle: getOwnerName(invoice),
        amount: pending,
        link: `/owners/${typeof invoice.ownerId === "object" ? invoice.ownerId?._id : invoice.ownerId}`,
      });
    });

    // 🔴 URGENTE: Vacunas vencidas (daysLeft <= 0)
    upcomingVaccinations
      .filter((v) => v.daysLeft <= 0)
      .forEach((vac) => {
        notifications.push({
          id: `vac-urgent-${vac._id}`,
          type: "urgent",
          category: "vaccination",
          title: `Vacuna vencida`,
          subtitle: `${getPatientName(vac.patientId)} - ${vac.vaccineType}`,
          daysLeft: vac.daysLeft,
          patientId: getPatientId(vac.patientId),
        });
      });

    // 🔴 URGENTE: Desparasitaciones vencidas (daysLeft <= 0)
    upcomingDewormings
      .filter((d) => d.daysLeft <= 0)
      .forEach((dew) => {
        notifications.push({
          id: `dew-urgent-${dew._id}`,
          type: "urgent",
          category: "deworming",
          title: `Desparasitación vencida`,
          subtitle: `${getPatientName(dew.patientId)} - ${dew.productName}`,
          daysLeft: dew.daysLeft,
          patientId: getPatientId(dew.patientId),
        });
      });

    // 📅 HOY: Citas de hoy (usa `patient` en lugar de `patientId`)
    todayAppointments.forEach((apt) => {
      notifications.push({
        id: `apt-${apt._id}`,
        type: "today",
        category: "appointment",
        title: apt.type || "Cita médica",
        subtitle: getPatientName(apt.patient),
        time: formatTime(apt.date),
        patientId: getPatientId(apt.patient),
      });
    });

    // 📅 HOY: Peluquería de hoy
    todayGrooming.forEach((grm) => {
      notifications.push({
        id: `grm-${grm._id}`,
        type: "today",
        category: "grooming",
        title: grm.service || "Servicio de peluquería",
        subtitle: getPatientName(grm.patientId),
        time: formatTime(grm.date),
        patientId: getPatientId(grm.patientId),
      });
    });

    // 📆 PRÓXIMAMENTE: Vacunas próximas (daysLeft > 0)
    upcomingVaccinations
      .filter((v) => v.daysLeft > 0)
      .forEach((vac) => {
        notifications.push({
          id: `vac-${vac._id}`,
          type: "upcoming",
          category: "vaccination",
          title: `Vacuna: ${vac.vaccineType}`,
          subtitle: getPatientName(vac.patientId),
          daysLeft: vac.daysLeft,
          patientId: getPatientId(vac.patientId),
        });
      });

    // 📆 PRÓXIMAMENTE: Desparasitaciones próximas (daysLeft > 0)
    upcomingDewormings
      .filter((d) => d.daysLeft > 0)
      .forEach((dew) => {
        notifications.push({
          id: `dew-${dew._id}`,
          type: "upcoming",
          category: "deworming",
          title: `Desparasitación: ${dew.productName}`,
          subtitle: getPatientName(dew.patientId),
          daysLeft: dew.daysLeft,
          patientId: getPatientId(dew.patientId),
        });
      });

    return notifications;
  };

  const notifications = buildNotifications();

  const urgentNotifications = notifications.filter((n) => n.type === "urgent");
  const todayNotifications = notifications.filter((n) => n.type === "today");
  const upcomingNotifications = notifications.filter((n) => n.type === "upcoming");

  const totalCount = notifications.length;

  // Iconos por categoría
  const getCategoryIcon = (category: Notification["category"]) => {
    switch (category) {
      case "invoice":
        return FileText;
      case "appointment":
        return Calendar;
      case "grooming":
        return Scissors;
      case "vaccination":
        return Syringe;
      case "deworming":
        return Bug;
      default:
        return Bell;
    }
  };

  // Colores por tipo
  const getTypeColors = (type: Notification["type"], category: Notification["category"]) => {
    if (type === "urgent") {
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      };
    }
    if (type === "today") {
      if (category === "grooming") {
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          iconBg: "bg-emerald-100",
          iconColor: "text-emerald-600",
        };
      }
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      };
    }
    // upcoming
    if (category === "vaccination") {
      return {
        bg: "bg-purple-50",
        border: "border-purple-100",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      };
    }
    return {
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    };
  };

  // Handler de click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.patientId) {
      navigate(`/patients/${notification.patientId}`);
    }
  };

  // Renderizar una notificación
  const renderNotification = (notification: Notification) => {
    const Icon = getCategoryIcon(notification.category);
    const colors = getTypeColors(notification.type, notification.category);

    return (
      <button
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-xl border
          ${colors.bg} ${colors.border}
          hover:shadow-md active:scale-[0.98] transition-all duration-200
          text-left
        `}
      >
        {/* Icono */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {notification.subtitle}
          </p>
        </div>

        {/* Tiempo/Monto/Días */}
        <div className="flex-shrink-0 text-right">
          {notification.time && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{notification.time}</span>
            </div>
          )}
          {notification.amount !== undefined && (
            <span className="text-sm font-bold text-red-600">
              ${notification.amount.toFixed(2)}
            </span>
          )}
          {notification.daysLeft !== undefined && (
            <span className={`text-xs font-medium ${notification.daysLeft <= 0 ? "text-red-600" : "text-amber-600"}`}>
              {notification.daysLeft <= 0
                ? `Hace ${Math.abs(notification.daysLeft)} día${Math.abs(notification.daysLeft) !== 1 ? "s" : ""}`
                : `En ${notification.daysLeft} día${notification.daysLeft !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        {/* Flecha */}
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
    );
  };

  // Renderizar sección
  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: Notification[],
    badgeColor: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          {icon}
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${badgeColor}`}>
            {items.length}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2" />
        </div>
        <div className="space-y-2">
          {items.map(renderNotification)}
        </div>
      </div>
    );
  };

  // Loading
  if (isFirstLoad) {
    return (
      <div className="min-h-screen bg-gray-50 pt-3 lg:pt-0">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 border-3 border-gray-200 border-t-vet-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Cargando notificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-3 lg:pt-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-14 lg:top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-sm">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
                <p className="text-xs text-gray-500">
                  {totalCount === 0
                    ? "No hay notificaciones"
                    : `${totalCount} pendiente${totalCount !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
        {totalCount === 0 ? (
          // Estado vacío
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Todo al día!
            </h2>
            <p className="text-sm text-gray-500 max-w-xs">
              No tienes notificaciones pendientes. Todas las citas, facturas y recordatorios están en orden.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Urgente */}
            {renderSection(
              "Urgente",
              <AlertCircle className="w-4 h-4 text-red-500" />,
              urgentNotifications,
              "bg-red-500"
            )}

            {/* Hoy */}
            {renderSection(
              "Hoy",
              <Calendar className="w-4 h-4 text-blue-500" />,
              todayNotifications,
              "bg-blue-500"
            )}

            {/* Próximamente */}
            {renderSection(
              "Próximamente",
              <Clock className="w-4 h-4 text-amber-500" />,
              upcomingNotifications,
              "bg-amber-500"
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsView;