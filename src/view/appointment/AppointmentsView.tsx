// src/views/appointments/AppointmentsView.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  PawPrint,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import { getAllAppointments } from "../../api/appointmentAPI";
import type { AppointmentWithPatient, AppointmentStatus, AppointmentType } from "../../types/appointment";
import { appointmentStatuses, appointmentTypes } from "../../types/appointment";

type ViewMode = "list" | "calendar";

export default function AppointmentsView() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: getAllAppointments,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrar citas
  const filteredAppointments = useMemo(() => {
    return (appointments as AppointmentWithPatient[]).filter((apt) => {
      // Filtro por estado
      if (statusFilter !== "all" && apt.status !== statusFilter) return false;

      // Filtro por tipo
      if (typeFilter !== "all" && apt.type !== typeFilter) return false;

      // Filtro por búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const patientName = typeof apt.patient === "object" ? apt.patient.name?.toLowerCase() : "";
        const ownerName = typeof apt.patient === "object" && typeof apt.patient.owner === "object"
          ? `${apt.patient.owner.name} ${apt.patient.owner.lastName || ""}`.toLowerCase()
          : "";
        
        if (!patientName.includes(search) && !ownerName.includes(search) && !apt.type.toLowerCase().includes(search)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, statusFilter, typeFilter, searchTerm]);

  // Agrupar citas por fecha
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentWithPatient[]> = {};
    
    filteredAppointments.forEach((apt) => {
      const dateKey = new Date(apt.date).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });

    return grouped;
  }, [filteredAppointments]);

  // Estadísticas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const allApts = appointments as AppointmentWithPatient[];
    
    return {
      total: allApts.length,
      today: allApts.filter((a) => a.date.startsWith(today)).length,
      programadas: allApts.filter((a) => a.status === "Programada").length,
      completadas: allApts.filter((a) => a.status === "Completada").length,
      canceladas: allApts.filter((a) => a.status === "Cancelada").length,
    };
  }, [appointments]);

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      Programada: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CalendarCheck },
      Completada: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 },
      Cancelada: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
      "No asistió": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle },
    };
    return configs[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString("es-ES", { weekday: "short" }),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
      isToday: date.toDateString() === new Date().toDateString(),
      isPast: date < new Date() && date.toDateString() !== new Date().toDateString(),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-vet-muted font-medium">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-6 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-vet-text flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Gestión de Citas
            </h1>
            <p className="text-vet-muted mt-1">Administra todas las citas de tu clínica</p>
          </div>

          <Link
            to="/appointments/select-patient"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-vet-text">{stats.total}</p>
              <p className="text-xs text-vet-muted">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-vet-text">{stats.today}</p>
              <p className="text-xs text-vet-muted">Hoy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-vet-text">{stats.programadas}</p>
              <p className="text-xs text-vet-muted">Programadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-vet-text">{stats.completadas}</p>
              <p className="text-xs text-vet-muted">Completadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-vet-text">{stats.canceladas}</p>
              <p className="text-xs text-vet-muted">Canceladas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por mascota, dueño o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white text-vet-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-vet-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              showFilters || statusFilter !== "all" || typeFilter !== "all"
                ? "bg-vet-primary text-white border-vet-primary"
                : "border-gray-200 text-gray-600 hover:border-vet-primary hover:text-vet-primary"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(statusFilter !== "all" || typeFilter !== "all") && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-vet-text mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
              >
                <option value="all">Todos los estados</option>
                {appointmentStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-vet-text mb-2">Tipo de cita</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AppointmentType | "all")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
              >
                <option value="all">Todos los tipos</option>
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-6">
          {Object.keys(appointmentsByDate).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-vet-text mb-2">No hay citas</h3>
              <p className="text-vet-muted mb-6">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "No se encontraron citas con los filtros aplicados"
                  : "Aún no tienes citas programadas"}
              </p>
              <Link
                to="/appointments/select-patient"
                className="inline-flex items-center gap-2 px-6 py-3 bg-vet-primary hover:bg-vet-secondary text-white font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear primera cita
              </Link>
            </div>
          ) : (
            Object.entries(appointmentsByDate).map(([dateKey, dayAppointments]) => {
              const dateInfo = formatDate(dayAppointments[0].date);
              
              return (
                <div key={dateKey} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                  {/* Date Header */}
                  <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${
                    dateInfo.isToday ? "bg-gradient-to-r from-vet-primary/10 to-transparent" : "bg-gray-50/50"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                        dateInfo.isToday 
                          ? "bg-gradient-to-br from-vet-primary to-vet-secondary text-white shadow-soft" 
                          : dateInfo.isPast 
                            ? "bg-gray-200 text-gray-600"
                            : "bg-white border border-gray-200 text-vet-text"
                      }`}>
                        <span className="text-lg font-bold leading-none">{dateInfo.day}</span>
                        <span className="text-[10px] uppercase font-medium">{dateInfo.weekday}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-vet-text capitalize">{dateInfo.full}</h3>
                        <p className="text-sm text-vet-muted">
                          {dayAppointments.length} cita{dayAppointments.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {dateInfo.isToday && (
                      <span className="px-3 py-1 bg-vet-primary text-white text-xs font-bold rounded-full">
                        HOY
                      </span>
                    )}
                  </div>

                  {/* Appointments List */}
                  <div className="divide-y divide-gray-100">
                    {dayAppointments.map((apt) => {
                      const statusConfig = getStatusConfig(apt.status);
                      const StatusIcon = statusConfig.icon;
                      const patient = typeof apt.patient === "object" ? apt.patient : null;
                      const owner = patient && typeof patient.owner === "object" ? patient.owner : null;

                      return (
                        <Link
                          key={apt._id}
                          to={patient ? `/patients/${patient._id}/appointments/${apt._id}` : "#"}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                        >
                          {/* Time */}
                          <div className="w-16 text-center flex-shrink-0">
                            <p className="text-lg font-bold text-vet-text">
                              {formatDate(apt.date).time}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-12 bg-gray-200 flex-shrink-0" />

                          {/* Patient Photo */}
                          <div className="flex-shrink-0">
                            {patient?.photo ? (
                              <img
                                src={patient.photo}
                                alt={patient.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-soft"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vet-light to-gray-100 flex items-center justify-center border-2 border-white shadow-soft">
                                <PawPrint className="w-6 h-6 text-vet-primary" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-vet-text truncate">
                                {patient?.name || "Paciente"}
                              </h4>
                              <span className="text-xs text-vet-muted">•</span>
                              <span className="text-sm text-vet-muted truncate">
                                {apt.type}
                              </span>
                            </div>
                            {owner && (
                              <div className="flex items-center gap-1.5 text-sm text-vet-muted">
                                <User className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {owner.name} {owner.lastName || ""}
                                </span>
                              </div>
                            )}
                            {apt.reason && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {apt.reason}
                              </p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border flex-shrink-0`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-xs font-semibold hidden sm:inline">{apt.status}</span>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-vet-primary transition-colors flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View */
        <CalendarView
          appointments={filteredAppointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}
    </div>
  );
}

// ============================================
// CALENDAR VIEW COMPONENT
// ============================================

interface CalendarViewProps {
  appointments: AppointmentWithPatient[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function CalendarView({ appointments, selectedDate, onDateChange }: CalendarViewProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((apt) => apt.date.startsWith(dateStr));
  };

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedDayAppointments = getAppointmentsForDay(selectedDate.getDate());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-vet-primary to-vet-secondary">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-lg font-bold text-white">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-vet-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="aspect-square border-b border-r border-gray-50" />;
            }

            const dayAppointments = getAppointmentsForDay(day);
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth();

            return (
              <button
                key={idx}
                onClick={() => onDateChange(new Date(year, month, day))}
                className={`aspect-square p-1 border-b border-r border-gray-50 transition-all hover:bg-vet-light/50 relative ${
                  isSelected ? "bg-vet-primary/10 ring-2 ring-vet-primary ring-inset" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                    isToday(day)
                      ? "bg-vet-primary text-white"
                      : isSelected
                      ? "text-vet-primary font-bold"
                      : "text-vet-text"
                  }`}
                >
                  {day}
                </span>

                {dayAppointments.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayAppointments.slice(0, 3).map((apt, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          apt.status === "Programada"
                            ? "bg-blue-500"
                            : apt.status === "Completada"
                            ? "bg-green-500"
                            : apt.status === "Cancelada"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <span className="text-[8px] text-vet-muted font-bold">
                        +{dayAppointments.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-vet-text">
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <p className="text-sm text-vet-muted">
            {selectedDayAppointments.length} cita{selectedDayAppointments.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {selectedDayAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-vet-muted">Sin citas este día</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedDayAppointments.map((apt) => {
                const patient = typeof apt.patient === "object" ? apt.patient : null;
                const time = new Date(apt.date).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Link
                    key={apt._id}
                    to={patient ? `/patients/${patient._id}/appointments/${apt._id}` : "#"}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-vet-light flex items-center justify-center flex-shrink-0">
                      {patient?.photo ? (
                        <img
                          src={patient.photo}
                          alt={patient.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <PawPrint className="w-5 h-5 text-vet-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-vet-text text-sm truncate">
                        {patient?.name || "Paciente"}
                      </p>
                      <p className="text-xs text-vet-muted">{apt.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-vet-primary text-sm">{time}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          apt.status === "Programada"
                            ? "bg-blue-100 text-blue-700"
                            : apt.status === "Completada"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "Cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}