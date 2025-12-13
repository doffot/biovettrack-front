// src/layouts/PatientLayout.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Stethoscope,
  Syringe,
  Scissors,
  Calendar,
  User,
  PawPrint,
  Clock,
  Edit,
  Trash2,
  Activity,
  FileText,
  Bug,
  ChevronRight,
  Heart,
  Sparkles,
} from "lucide-react";
import { useParams, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { getPatientById, deletePatient } from "../api/patientAPI";
import { useEffect, useState } from "react";
import { getActiveAppointmentsByPatient } from "../api/appointmentAPI";
import { getGroomingServicesByPatient } from "../api/groomingAPI";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import PhotoModal from "../components/patients/PhotoModal";
import PendingPaymentsIndicator from "../components/patients/PendingPaymentsIndicator";
import { toast } from "../components/Toast";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
  const [showGroomingDropdown, setShowGroomingDropdown] = useState(false);
  const [showAppointmentsTooltip, setShowAppointmentsTooltip] = useState(false);
  const [showGroomingTooltip, setShowGroomingTooltip] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: activeAppointments } = useQuery({
    queryKey: ["activeAppointments", patientId],
    queryFn: () => getActiveAppointmentsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: groomingServices } = useQuery({
    queryKey: ["groomingServices", patientId],
    queryFn: () => getGroomingServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  const hasActiveAppointments = (activeAppointments || []).length > 0;
  const activeGroomingCount = (groomingServices || []).filter(svc =>
    svc.status === "Programado" || svc.status === "En progreso"
  ).length;
  const hasActiveGrooming = activeGroomingCount > 0;

  useEffect(() => {
    setShowAppointmentsDropdown(false);
    setShowGroomingDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowAppointmentsDropdown(false);
      setShowGroomingDropdown(false);
    };
    
    if (showAppointmentsDropdown || showGroomingDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAppointmentsDropdown, showGroomingDropdown]);

  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePatient(patientId!),
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar la mascota");
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  const handleDeleteClick = () => {
    if (hasActiveAppointments || hasActiveGrooming) {
      toast.error("No se puede eliminar: tiene citas o servicios activos");
      return;
    }
    setShowDeleteModal(true);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const getActiveSectionName = () => {
    const sections = [
      { path: "", label: "Datos de la Mascota" },
      { path: "consultations", label: "Consultas" },
      { path: "vaccinations", label: "Vacunas" },
      { path: "dewormings", label: "Desparasitación" },
      { path: "lab-exams", label: "Hematología" },
      { path: "studies", label: "Estudios" },
      { path: "grooming-services", label: "Peluquería" },
      { path: "appointments", label: "Citas" },
    ];
    
    for (const section of sections) {
      const baseUrl = section.path 
        ? `/patients/${patientId}/${section.path}` 
        : `/patients/${patientId}`;
      
      if (section.path ? location.pathname.includes(section.path) : location.pathname === baseUrl) {
        return section.label;
      }
    }
    return "Expediente";
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const calculateAge = () => {
    if (!patient?.birthDate) return "";
    const birth = new Date(patient.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (months < 1) return "< 1 mes";
    if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vet-gradient">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-vet-light border-t-vet-primary rounded-full animate-spin" />
            <PawPrint className="w-6 h-6 text-vet-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-vet-text font-medium text-lg">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-vet-gradient">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <PawPrint className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-vet-text mb-2">Paciente no encontrado</h2>
          <p className="text-vet-muted mb-6">El expediente que buscas no existe o fue eliminado.</p>
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 shadow-soft hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a pacientes
          </button>
        </div>
      </div>
    );
  }

  const isCanino = patient.species?.toLowerCase() === "canino";

  const menuItems = [
    { id: "datos", label: "Información", icon: PawPrint, path: "", description: "Datos básicos" },
    { id: "consultas", label: "Consultas", icon: Stethoscope, path: "consultations", description: "Historial médico" },
    { id: "vacunas", label: "Vacunas", icon: Syringe, path: "vaccinations", description: "Esquema de vacunación" },
    { id: "desparasitacion", label: "Desparasitación", icon: Bug, path: "dewormings", description: "Control de parásitos" },
    { id: "hematologia", label: "Hematología", icon: Activity, path: "lab-exams", description: "Exámenes de sangre" },
    { id: "estudios", label: "Estudios", icon: FileText, path: "studies", description: "Rayos X, ecografías" },
    { id: "peluqueria", label: "Peluquería", icon: Scissors, path: "grooming-services", description: "Servicios estéticos" },
    { id: "citas", label: "Citas", icon: Calendar, path: "appointments/create", description: "Agendar consulta" },
  ];

  return (
    <>
      {/* Header fijo */}
      <div className="fixed bg-white/95 backdrop-blur-md flex items-center px-3 sm:px-6 justify-between h-14 top-14 left-0 right-0 lg:top-16 lg:left-64 z-40 border-b border-gray-100 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-vet-light text-vet-muted hover:text-vet-primary transition-all duration-200"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-vet-text leading-tight">
              {getActiveSectionName()}
            </h1>
            <p className="text-xs text-vet-muted">{patient.name}</p>
          </div>
          <h1 className="sm:hidden text-sm font-bold text-vet-text">
            {getActiveSectionName()}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <PendingPaymentsIndicator patientId={patientId!} />

          {/* Citas */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasActiveAppointments) {
                  setShowAppointmentsDropdown(!showAppointmentsDropdown);
                  setShowGroomingDropdown(false);
                }
              }}
              onMouseEnter={() => !hasActiveAppointments && setShowAppointmentsTooltip(true)}
              onMouseLeave={() => setShowAppointmentsTooltip(false)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                hasActiveAppointments 
                  ? 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {hasActiveAppointments && (
                <>
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg">
                    {activeAppointments?.length || 0}
                  </span>
                </>
              )}
            </button>

            {showAppointmentsTooltip && !hasActiveAppointments && (
              <div className="absolute right-0 top-full mt-2 z-50 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
                  Sin citas programadas
                </div>
              </div>
            )}

            {hasActiveAppointments && showAppointmentsDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                  <p className="text-sm font-bold text-white">Citas Activas</p>
                  <p className="text-xs text-purple-100">{activeAppointments?.length} programada{activeAppointments?.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {activeAppointments?.map((appt) => (
                    <Link
                      key={appt._id}
                      to={`/patients/${patient._id}/appointments/${appt._id}`}
                      className="block px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => setShowAppointmentsDropdown(false)}
                    >
                      <p className="font-medium text-gray-900 text-sm">{appt.type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(appt.date).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Peluquería */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasActiveGrooming) {
                  setShowGroomingDropdown(!showGroomingDropdown);
                  setShowAppointmentsDropdown(false);
                }
              }}
              onMouseEnter={() => !hasActiveGrooming && setShowGroomingTooltip(true)}
              onMouseLeave={() => setShowGroomingTooltip(false)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                hasActiveGrooming 
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
              }`}
            >
              <Scissors className="w-5 h-5" />
              {hasActiveGrooming && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg">
                  {activeGroomingCount}
                </span>
              )}
            </button>

            {showGroomingTooltip && !hasActiveGrooming && (
              <div className="absolute right-0 top-full mt-2 z-50 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
                  Sin servicios activos
                </div>
              </div>
            )}

            {hasActiveGrooming && showGroomingDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <p className="text-sm font-bold text-white">Servicios Activos</p>
                  <p className="text-xs text-blue-100">{activeGroomingCount} en proceso</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {groomingServices
                    ?.filter(svc => svc.status === "Programado" || svc.status === "En progreso")
                    .map((svc) => (
                      <Link
                        key={svc._id}
                        to={`/patients/${patientId}/grooming-services/${svc._id}`}
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                        onClick={() => setShowGroomingDropdown(false)}
                      >
                        <p className="font-medium text-gray-900 text-sm">{svc.service}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(svc.date).toLocaleDateString('es-ES', {
                              day: '2-digit', month: 'short'
                            })}
                          </p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            svc.status === "En progreso" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                          }`}>
                            {svc.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Reloj */}
          <div className="relative group hidden sm:block">
            <button className="p-2.5 rounded-xl bg-vet-light/50 hover:bg-vet-light text-vet-primary transition-all">
              <Clock className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
              <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[200px]">
                <div className="font-mono font-bold text-center">{formatTime(currentTime)}</div>
                <div className="text-xs text-gray-400 text-center mt-1">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-14 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* ============ SIDEBAR REDISEÑADO ============ */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden sticky top-32">
                
                {/* Header con foto y datos principales */}
                <div className="relative">
                  {/* Fondo decorativo */}
                  <div className={`h-20 bg-gradient-to-br ${
                    isCanino 
                      ? 'from-blue-400 via-blue-500 to-blue-600' 
                      : 'from-purple-400 via-purple-500 to-purple-600'
                  }`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-4">
                        <PawPrint className="w-8 h-8 text-white rotate-[-15deg]" />
                      </div>
                      <div className="absolute top-6 right-8">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-4">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Foto de perfil */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
                    <div className="relative group">
                      <div className={`w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br ${
                        isCanino ? 'from-blue-100 to-blue-50' : 'from-purple-100 to-purple-50'
                      }`}>
                        {patient.photo ? (
                          <img
                            src={patient.photo}
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">{isCanino ? '🐕' : '🐱'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Botón de cambiar foto */}
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 border border-gray-100"
                      >
                        <Camera className="w-3.5 h-3.5 text-vet-primary" />
                      </button>

                      {/* Badge de especie */}
                      <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md ${
                        isCanino ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {patient.sex === "Macho" ? "♂" : "♀"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info del paciente */}
                <div className="pt-14 pb-4 px-4 text-center border-b border-gray-100">
                  <h2 className="text-xl font-bold text-vet-text">{patient.name}</h2>
                  <p className="text-sm text-vet-muted mt-0.5">{patient.breed || patient.species}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-xs text-vet-muted">Edad</p>
                      <p className="text-sm font-semibold text-vet-text">{calculateAge()}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-vet-muted">Peso</p>
                      <p className="text-sm font-semibold text-vet-text">
                        {patient.weight ? `${patient.weight} kg` : '—'}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-vet-muted">Color</p>
                      <p className="text-sm font-semibold text-vet-text truncate max-w-[60px]">
                        {patient.color || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Link
                      to={`/patients/${patientId}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all text-xs font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Navegación */}
                <nav className="p-3">
                  <p className="px-3 mb-2 text-[10px] font-semibold text-vet-muted uppercase tracking-wider">
                    Expediente Médico
                  </p>
                  <ul className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const basePath = `/patients/${patientId}`;
                      // const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
                      const isActive = item.path
                        ? location.pathname.includes(item.path)
                        : location.pathname === basePath;

                      return (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                              isActive 
                                ? 'bg-gradient-to-r from-vet-primary to-vet-secondary text-white shadow-soft' 
                                : 'hover:bg-vet-light/60 text-vet-text'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-white/20' 
                                : 'bg-vet-light group-hover:bg-vet-primary/10'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isActive ? 'text-white' : 'text-vet-primary'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                isActive ? 'text-white' : 'text-vet-text'
                              }`}>
                                {item.label}
                              </p>
                              <p className={`text-[10px] truncate ${
                                isActive ? 'text-white/70' : 'text-vet-muted'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              isActive 
                                ? 'text-white/70 translate-x-0' 
                                : 'text-gray-300 group-hover:translate-x-1 group-hover:text-vet-primary'
                            }`} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer del sidebar */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <Link
                    to={`/owners/${typeof patient.owner === 'string' ? patient.owner : patient.owner?._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-vet-primary/30 hover:shadow-soft transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-vet-light">
                      <User className="w-4 h-4 text-vet-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-vet-muted">Propietario</p>
                      <p className="text-sm font-medium text-vet-text truncate">
                        {typeof patient.owner === 'object' && patient.owner?.name 
                          ? patient.owner.name 
                          : 'Ver propietario'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-vet-primary transition-colors" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 min-w-0">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
                <div className="p-6">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modales */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={removePatient}
        petName={patient.name || ""}
        isDeleting={isDeleting}
      />

      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        patient={patient}
      />
    </>
  );
}