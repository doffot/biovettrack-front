import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Stethoscope, 
  Calendar, 
  Search, 
  Eye,
  Filter,
  ChevronLeft,
  User,
  FileText,
  DollarSign,
  PawPrint
} from "lucide-react";
import { getAllConsultations } from "../../api/consultationAPI";
import { getPatients } from "../../api/patientAPI";
import ConsultationModal from "../../components/consultations/ConsultationModal";
import type { Consultation } from "../../types/consultation";
import type { Patient } from "../../types/patient";

export default function AllConsultationsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("week");

  const { data: consultations = [], isLoading: loadingConsultations } = useQuery({
    queryKey: ["consultations"],
    queryFn: getAllConsultations,
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const isLoading = loadingConsultations || loadingPatients;

  // Crear mapa de pacientes para búsqueda rápida
  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach(patient => {
      map.set(patient._id, patient);
    });
    return map;
  }, [patients]);

  // Función para obtener info del paciente
  const getPatientInfo = (patientId: string) => {
    const patient = patientsMap.get(patientId);
    if (!patient) return { name: "Desconocido", owner: "Sin dueño" };
    
    const ownerName = typeof patient.owner === "object" 
      ? patient.owner.name 
      : "Sin dueño";
    
    return {
      name: patient.name,
      owner: ownerName,
      species: patient.species,
    };
  };

  // Filtrar consultas
  const filteredConsultations = useMemo(() => {
    let filtered = [...consultations];

    // Filtro por fecha
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      filtered = filtered.filter(c => {
        const consultDate = new Date(c.consultationDate);
        consultDate.setHours(0, 0, 0, 0);
        return consultDate.getTime() === now.getTime();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(c => {
        const consultDate = new Date(c.consultationDate);
        return consultDate >= weekAgo;
      });
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(c => {
        const consultDate = new Date(c.consultationDate);
        return consultDate >= monthAgo;
      });
    }

    // ✅ Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const patientInfo = getPatientInfo(c.patientId);
        return (
          (c.presumptiveDiagnosis?.toLowerCase() ?? "").includes(search) ||
          (c.reasonForVisit?.toLowerCase() ?? "").includes(search) ||
          patientInfo.name.toLowerCase().includes(search) ||
          patientInfo.owner.toLowerCase().includes(search)
        );
      });
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => 
      new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
    );
  }, [consultations, searchTerm, dateFilter, patientsMap]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ✅ Estadísticas
  const stats = useMemo(() => {
    const total = filteredConsultations.length;
    const totalRevenue = filteredConsultations.reduce((sum, c) => sum + (c.cost ?? 0), 0);
    const avgCost = total > 0 ? totalRevenue / total : 0;
    
    // Consultas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = consultations.filter(c => {
      const consultDate = new Date(c.consultationDate);
      consultDate.setHours(0, 0, 0, 0);
      return consultDate.getTime() === today.getTime();
    }).length;
    
    return { total, totalRevenue, avgCost, todayCount };
  }, [filteredConsultations, consultations]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-vet-text)] font-medium">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-accent)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-vet-text)] flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-[var(--color-vet-accent)]" />
            Todas las Consultas
          </h1>
        </div>
        <p className="text-[var(--color-vet-muted)] ml-11">Vista global de consultas médicas veterinarias</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600/10 to-sky-600/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-vet-muted)] uppercase">Consultas Hoy</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.todayCount}</p>
              <p className="text-xs text-[var(--color-vet-muted)] mt-1">Realizadas hoy</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-vet-muted)] uppercase">Total Período</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{stats.total}</p>
              <p className="text-xs text-[var(--color-vet-muted)] mt-1">En filtro actual</p>
            </div>
            <FileText className="w-8 h-8 text-purple-400/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-vet-muted)] uppercase">Ingresos</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                ${stats.totalRevenue.toFixed(0)}
              </p>
              <p className="text-xs text-[var(--color-vet-muted)] mt-1">Total período</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-vet-muted)] uppercase">Promedio</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                ${stats.avgCost.toFixed(0)}
              </p>
              <p className="text-xs text-[var(--color-vet-muted)] mt-1">Por consulta</p>
            </div>
            <DollarSign className="w-8 h-8 text-amber-400/30" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
              <input
                type="text"
                placeholder="Buscar por paciente, dueño, diagnóstico o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
              />
            </div>
          </div>

          {/* Filtro de fecha */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-vet-muted)]" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] transition-colors"
            >
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="all">Todas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="w-12 h-12 mx-auto text-[var(--color-vet-muted)] opacity-30 mb-3" />
            <p className="text-[var(--color-vet-text)] font-medium">No se encontraron consultas</p>
            <p className="text-[var(--color-vet-muted)] text-sm mt-1">Ajusta los filtros para ver resultados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-hover)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Fecha/Hora
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Paciente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Propietario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Motivo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Diagnóstico
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Costo
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--color-vet-text)] uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredConsultations.map((consultation) => {
                  const patientInfo = getPatientInfo(consultation.patientId);
                  
                  return (
                    <tr 
                      key={consultation._id} 
                      className="hover:bg-[var(--color-hover)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-vet-text)]">
                            {formatDate(consultation.consultationDate)}
                          </p>
                          <p className="text-xs text-[var(--color-vet-muted)]">
                            {formatTime(consultation.consultationDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/patients/${consultation.patientId}`}
                          className="group"
                        >
                          <div className="flex items-center gap-2">
                            <PawPrint className="w-4 h-4 text-[var(--color-vet-muted)]" />
                            <div>
                              <p className="text-sm font-medium text-[var(--color-vet-accent)] group-hover:underline">
                                {patientInfo.name}
                              </p>
                              <p className="text-xs text-[var(--color-vet-muted)]">
                                {patientInfo.species}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[var(--color-vet-muted)]" />
                          <span className="text-sm text-[var(--color-vet-text)]">
                            {patientInfo.owner}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[var(--color-vet-text)] truncate max-w-[150px]">
                          {consultation.reasonForVisit ?? "Sin especificar"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-emerald-400 truncate max-w-[150px]">
                          {consultation.presumptiveDiagnosis ?? "Sin diagnóstico"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-green-400">
                          ${consultation.cost ? consultation.cost.toFixed(2) : "0.00"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="mx-auto flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-vet-primary)]/10 hover:bg-[var(--color-vet-primary)]/20 text-[var(--color-vet-accent)] rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedConsultation && (
        <ConsultationModal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          consultation={selectedConsultation}
        />
      )}
    </div>
  );
}