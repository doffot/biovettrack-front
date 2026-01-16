// src/views/appointments/AppointmentsView.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  PawPrint,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { getAllAppointments } from "../../api/appointmentAPI";
import type { AppointmentWithPatient, AppointmentStatus, AppointmentType } from "../../types/appointment";
import { appointmentStatuses, appointmentTypes } from "../../types/appointment";

export default function AppointmentsView() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: getAllAppointments,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const filteredAppointments = useMemo(() => {
    return (appointments as AppointmentWithPatient[]).filter((apt) => {
      if (statusFilter !== "all" && apt.status !== statusFilter) return false;
      if (typeFilter !== "all" && apt.type !== typeFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const patientName = typeof apt.patient === "object" ? apt.patient.name?.toLowerCase() : "";
        const ownerName =
          typeof apt.patient === "object" && typeof apt.patient.owner === "object"
            ? `${apt.patient.owner.name} ${apt.patient.owner.lastName || ""}`.toLowerCase()
            : "";

        if (!patientName.includes(search) && !ownerName.includes(search) && !apt.type.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, statusFilter, typeFilter, searchTerm]);

  const { todayAppointments, upcomingAppointments, pastAppointments } = useMemo(() => {
    const todayStr = getTodayString();
    const now = new Date();

    const today: AppointmentWithPatient[] = [];
    const upcoming: AppointmentWithPatient[] = [];
    const past: AppointmentWithPatient[] = [];

    filteredAppointments.forEach((apt) => {
      const aptDate = new Date(apt.date);
      const aptDateStr = apt.date.split("T")[0];

      if (aptDateStr === todayStr) {
        today.push(apt);
      } else if (aptDate > now) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    });

    today.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { todayAppointments: today, upcomingAppointments: upcoming, pastAppointments: past };
  }, [filteredAppointments]);

  const getStatusStyle = (status: AppointmentStatus) => {
    const styles = {
      Programada: "bg-blue-600/10 text-blue-400 border border-blue-500/20",
      Completada: "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20",
      Cancelada: "bg-red-600/10 text-red-400 border border-red-500/20",
      "No asistió": "bg-amber-600/10 text-amber-400 border border-amber-500/20",
    };
    return styles[status];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";

    return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const AppointmentCard = ({ apt, showDate = false }: { apt: AppointmentWithPatient; showDate?: boolean }) => {
    const patient = typeof apt.patient === "object" ? apt.patient : null;
    const owner = patient && typeof patient.owner === "object" ? patient.owner : null;

    return (
      <Link
        to={patient ? `/patients/${patient._id}/appointments/${apt._id}` : "#"}
        className="flex items-center gap-3 p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-vet-accent)]/40 hover:shadow-lg transition-all group"
      >
        <div className="text-center w-14 flex-shrink-0">
          {showDate && (
            <p className="text-[9px] font-medium text-[var(--color-vet-muted)] uppercase">{formatDateLabel(apt.date)}</p>
          )}
          <p className="text-sm font-bold text-[var(--color-vet-primary)]">{formatTime(apt.date)}</p>
        </div>

        {patient?.photo ? (
          <img src={patient.photo} alt={patient.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[var(--color-border)]" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-vet-primary)]/20">
            <PawPrint className="w-4 h-4 text-[var(--color-vet-accent)]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-[var(--color-vet-text)] truncate">{patient?.name || "Paciente"}</h4>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getStatusStyle(apt.status)}`}>
              {apt.status}
            </span>
          </div>
          <p className="text-xs text-[var(--color-vet-muted)] truncate">
            {apt.type} {owner && `· ${owner.name}`}
          </p>
        </div>

        {apt.prepaidAmount && apt.prepaidAmount > 0 && (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-600/10 px-1.5 py-0.5 rounded flex-shrink-0 border border-emerald-500/20">
            ${apt.prepaidAmount}
          </span>
        )}

        <ChevronRight className="w-4 h-4 text-[var(--color-vet-muted)] group-hover:text-[var(--color-vet-accent)] transition-colors flex-shrink-0" />
      </Link>
    );
  };

  const todayDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const pendingToday = todayAppointments.filter((a) => a.status === "Programada").length;

  return (
    <div className={`p-4 lg:p-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-vet-text)]">Agenda de Citas</h1>
          <p className="text-[var(--color-vet-muted)] capitalize">{todayDate}</p>
        </div>
        <Link
          to="/appointments/select-patient"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold rounded-xl transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </Link>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-vet-muted)]" />
          <input
            type="text"
            placeholder="Buscar por mascota, dueño o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
          className="px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] font-medium"
        >
          <option value="all">Todos los estados</option>
          {appointmentStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AppointmentType | "all")}
          className="px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] font-medium hidden md:block"
        >
          <option value="all">Todos los tipos</option>
          {appointmentTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Layout 50/50 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna izquierda: HOY */}
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Hoy</h2>
                  <p className="text-xs text-white/70">
                    {pendingToday > 0 ? `${pendingToday} pendiente${pendingToday !== 1 ? "s" : ""}` : "Sin pendientes"}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white text-lg font-bold rounded-full">
                {todayAppointments.length}
              </span>
            </div>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {todayAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-10 h-10 text-[var(--color-vet-muted)] mx-auto mb-3 opacity-30" />
                <p className="text-[var(--color-vet-text)] font-medium mb-1">Sin citas para hoy</p>
                <p className="text-sm text-[var(--color-vet-muted)]">Tu agenda está libre</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map((apt) => (
                  <AppointmentCard key={apt._id} apt={apt} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Próximas + Resumen */}
        <div className="space-y-6">
          
          {/* Resumen compacto */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[var(--color-vet-primary)]">{todayAppointments.length}</p>
                <p className="text-[10px] text-[var(--color-vet-muted)] uppercase">Hoy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-vet-text)]">{upcomingAppointments.length}</p>
                <p className="text-[10px] text-[var(--color-vet-muted)] uppercase">Próximas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {filteredAppointments.filter((a) => a.status === "Programada").length}
                </p>
                <p className="text-[10px] text-[var(--color-vet-muted)] uppercase">Pendientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {filteredAppointments.filter((a) => a.status === "Completada").length}
                </p>
                <p className="text-[10px] text-[var(--color-vet-muted)] uppercase">Completadas</p>
              </div>
            </div>
          </div>

          {/* Próximas */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-vet-text)]">Próximas citas</h3>
                <span className="text-xs text-[var(--color-vet-muted)]">{upcomingAppointments.length} programadas</span>
              </div>
            </div>

            <div className="p-4 max-h-[280px] overflow-y-auto custom-scrollbar">
              {upcomingAppointments.length === 0 ? (
                <p className="text-center text-[var(--color-vet-muted)] py-6 text-sm">Sin citas próximas</p>
              ) : (
                <div className="space-y-2">
                  {(showAllUpcoming ? upcomingAppointments : upcomingAppointments.slice(0, 5)).map((apt) => (
                    <AppointmentCard key={apt._id} apt={apt} showDate />
                  ))}
                </div>
              )}
            </div>

            {upcomingAppointments.length > 5 && (
              <div className="p-3 border-t border-[var(--color-border)] text-center">
                <button 
                  onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  className="text-sm font-medium text-[var(--color-vet-accent)] hover:text-[var(--color-vet-primary)] flex items-center justify-center gap-1 mx-auto"
                >
                  {showAllUpcoming ? "Ver menos" : `Ver todas (${upcomingAppointments.length})`}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllUpcoming ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* Historial mini - expandible */}
          {pastAppointments.length > 0 && (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-4">
              <button
                onClick={() => setShowHistorial(true)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--color-vet-muted)] text-sm group-hover:text-[var(--color-vet-text)]">Historial</h3>
                  <span className="text-xs text-[var(--color-vet-muted)]">({pastAppointments.length} citas)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-vet-muted)] group-hover:text-[var(--color-vet-accent)] transition-colors" />
              </button>

              {/* Preview de 3 citas */}
              <div className="mt-3 space-y-2">
                {pastAppointments.slice(0, 3).map((apt) => {
                  const patient = typeof apt.patient === "object" ? apt.patient : null;

                  return (
                    <Link
                      key={apt._id}
                      to={patient ? `/patients/${patient._id}/appointments/${apt._id}` : "#"}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-hover)] transition-colors"
                    >
                      {patient?.photo ? (
                        <img src={patient.photo} alt="" className="w-8 h-8 rounded-lg object-cover border border-[var(--color-border)]" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                          <PawPrint className="w-3 h-3 text-[var(--color-vet-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-vet-text)] truncate">{patient?.name}</p>
                        <p className="text-[10px] text-[var(--color-vet-muted)]">{formatDateLabel(apt.date)} · {apt.type}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        apt.status === "Completada" ? "bg-emerald-500" :
                        apt.status === "Cancelada" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Historial completo */}
      {showHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--color-card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-[var(--color-border)]">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-vet-text)]">Historial de Citas</h2>
                <p className="text-sm text-[var(--color-vet-muted)]">{pastAppointments.length} citas anteriores</p>
              </div>
              <button
                onClick={() => setShowHistorial(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de citas */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {pastAppointments.map((apt) => (
                  <AppointmentCard key={apt._id} apt={apt} showDate />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-hover)]">
              <button
                onClick={() => setShowHistorial(false)}
                className="w-full py-2.5 text-sm font-medium text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {filteredAppointments.length === 0 && (
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-12 text-center mt-6">
          <Calendar className="w-12 h-12 text-[var(--color-vet-muted)] mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-bold text-[var(--color-vet-text)] mb-2">Sin resultados</h3>
          <p className="text-[var(--color-vet-muted)] mb-6">
            {searchTerm ? "No hay citas que coincidan con tu búsqueda" : "No hay citas registradas"}
          </p>
          <Link
            to="/appointments/select-patient"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium rounded-xl transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Crear primera cita
          </Link>
        </div>
      )}
    </div>
  );
}