
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
} from "lucide-react";
import { useParams, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { getPatientById, deletePatient } from "../api/patientAPI";
import { useEffect, useState } from "react";
import { getActiveAppointmentsByPatient } from "../api/appointmentAPI";
import { getGroomingServicesByPatient } from "../api/groomingAPI";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import PhotoModal from "../components/patients/PhotoModal";
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

  // Estado para validación
  const hasActiveAppointments = (activeAppointments || []).length > 0;
  const activeGroomingCount = (groomingServices || []).filter(svc =>
    svc.status === "Programado" || svc.status === "En progreso"
  ).length;
  const hasActiveGrooming = activeGroomingCount > 0;

  // Cerrar dropdowns al cambiar de ruta
  useEffect(() => {
    setShowAppointmentsDropdown(false);
    setShowGroomingDropdown(false);
  }, [location.pathname]);

  // Cerrar dropdowns al hacer click fuera
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
      alert(error.message || "Error al eliminar la mascota");
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  // Validación antes de eliminar
  const handleDeleteClick = () => {
    if (hasActiveAppointments || hasActiveGrooming) {
      alert("No se puede eliminar la mascota porque tiene citas o servicios de peluquería activos.");
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
  const menuItems = [
  { id: "datos", label: "Datos de la Mascota", icon: PawPrint, path: "" },
  { id: "consultas", label: "Consultas", icon: Stethoscope, path: "" },
  { id: "vacunas", label: "Vacunas", icon: Syringe, path: "" },
  { id: "hematologia", label: "Hematología", icon: Activity, path: "lab-exams" },
  { id: "estudios", label: "Estudios", icon: FileText, path: "studies" }, // ← NUEVO
  { id: "peluqueria", label: "Servicio de Peluquería", icon: Scissors, path: "grooming-services" },
  { id: "citas", label: "Citas", icon: Calendar, path: "appointments/create" },
  { id: "cliente", label: "Datos del Cliente", icon: User, path: "" },
];
    const activeItem = menuItems.find(item => {
      const baseUrl = item.path ? `/patients/${patientId}/${item.path}` : `/patients/${patientId}`;
      return item.path ? location.pathname.startsWith(baseUrl) : location.pathname === baseUrl;
    });
    return activeItem?.label || "Servicios Veterinarios";
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vet-gradient">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium text-lg">Cargando mascota...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-vet-gradient">
        <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-card text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <PawPrint className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-vet-text mb-2">Mascota no encontrada</h2>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 shadow-soft hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>
    );
  }

const menuItems = [
  { id: "datos", label: "Datos", icon: PawPrint, path: "" },
  { id: "consultas", label: "Consultas", icon: Stethoscope, path: "consultations" },
  { id: "vacunas", label: "Vacunas", icon: Syringe, path: "vaccinations" },
  { id: "desparasitacion", label: "Desparasitación", icon: Bug, path: "dewormings" }, // ← NUEVO
  { id: "hematologia", label: "Hematología", icon: Activity, path: "lab-exams" },
  { id: "estudios", label: "Estudios", icon: FileText, path: "studies" },
  { id: "peluqueria", label: "Peluquería", icon: Scissors, path: "grooming-services" },
  { id: "citas", label: "Citas", icon: Calendar, path: "appointments/create" },
  { id: "cliente", label: "Cliente", icon: User, path: "" },
];

  return (
    <>
      {/* Header fijo */}
      <div className="fixed bg-white/95 backdrop-blur-md flex items-center px-3 sm:px-6 justify-between h-18 lg:h-14 top-14 left-0 right-0 lg:top-16 lg:left-64 z-40 border-b border-gray-200 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-vet-light text-vet-muted hover:text-vet-primary transition-all duration-200"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <div className="p-1.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-lg shadow-sm">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[12px] sm:text-lg font-bold text-vet-text whitespace-nowrap">
              {getActiveSectionName()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 relative">
       
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
                  ? 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 shadow-sm hover:shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {hasActiveAppointments && (
                <>
                  {/* Badge con animación */}
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-pulse">
                    {activeAppointments?.length || 0}
                  </span>
                  {/* Efecto de onda */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-20"></span>
                </>
              )}
            </button>

            {showAppointmentsTooltip && !hasActiveAppointments && (
              <div className="absolute right-0 top-full mt-3 z-50 pointer-events-none">
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-3 py-2 rounded-md shadow-2xl whitespace-nowrap text-xs font-medium">
                    Sin citas 
                  </div>
                  <div className="absolute -top-1.5 right-3 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            )}

            {/* Dropdown */}
            {hasActiveAppointments && showAppointmentsDropdown && (
              <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-24px)] sm:max-w-none bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Header del dropdown */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">Citas Programadas</p>
                      <p className="text-xs text-purple-100 truncate">{activeAppointments?.length} {activeAppointments?.length === 1 ? 'cita' : 'citas'} activa{activeAppointments?.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Lista de citas */}
                <div className="max-h-72 overflow-y-auto">
                  {activeAppointments?.map((appt) => (
                    <Link
                      key={appt._id}
                       to={`/patients/${patient._id}/appointments/${appt._id}`}
                      className="block px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                      onClick={() => setShowAppointmentsDropdown(false)}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Tipo de cita */}
                          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                            {appt.type}
                          </p>
                          {/* Detalle de la cita */}
                          {appt.reason && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {appt.reason}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(appt.date).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 shadow-sm hover:shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
              }`}
            >
              <Scissors className="w-5 h-5" />
              {hasActiveGrooming && (
                <>
                  {/* Badge con animación */}
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-pulse">
                    {activeGroomingCount}
                  </span>
                  {/* Efecto de onda */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-20"></span>
                </>
              )}
            </button>

            {/* Tooltip */}
            {showGroomingTooltip && !hasActiveGrooming && (
              <div className="absolute right-0 top-full mt-3 z-50 pointer-events-none">
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-3 py-2 rounded-md shadow-2xl whitespace-nowrap text-xs font-medium">
                    Sin servicios 
                  </div>
                  <div className="absolute -top-1.5 right-3 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            )}

            {/* Dropdown */}
            {hasActiveGrooming && showGroomingDropdown && (
              <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-24px)] sm:max-w-none bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Header del dropdown */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <Scissors className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">Servicios de Peluquería</p>
                      <p className="text-xs text-blue-100 truncate">{activeGroomingCount} servicio{activeGroomingCount === 1 ? '' : 's'} activo{activeGroomingCount === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Lista de servicios */}
                <div className="max-h-72 overflow-y-auto">
                  {groomingServices
                    ?.filter(svc => svc.status === "Programado" || svc.status === "En progreso")
                    .map((svc) => (
                      <Link
                        key={svc._id}
                        to={`/patients/${patientId}/grooming-services/${svc._id}`}
                        className="block px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                        onClick={() => setShowGroomingDropdown(false)}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Scissors className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                              {svc.service}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {new Date(svc.date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </span>
                            </div>
                            <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0 ${
                              svc.status === "En progreso" 
                                ? "bg-yellow-100 text-yellow-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {svc.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Reloj */}
          <div className="relative group">
            <button className="p-2.5 rounded-xl bg-gradient-to-br from-vet-light/50 to-vet-accent/30 hover:from-vet-light hover:to-vet-accent/50 text-vet-primary transition-all duration-300 shadow-sm hover:shadow-md">
              <Clock className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50">
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[200px]">
                  <div className="font-mono font-bold text-center text-base mb-1">{formatTime(currentTime)}</div>
                  <div className="text-xs text-gray-300 text-center font-medium">{formatDate(currentTime)}</div>
                </div>
                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-14 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Sidebar izquierdo */}
            <aside className="w-full lg:w-72 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-y-auto">
              <div className="relative bg-gradient-to-br from-vet-light to-white p-4">
                <div className="relative group">
                  {patient.photo ? (
                    <img
                      src={patient.photo}
                      alt={patient.name}
                      className="w-full aspect-square rounded-2xl object-cover border-4 border-white shadow-lg cursor-pointer"
                      onClick={() => setShowPhotoModal(true)}
                    />
                  ) : (
                    <div 
                      className="relative w-full aspect-square bg-gradient-to-br from-vet-light to-vet-accent/20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg cursor-pointer"
                      onClick={() => setShowPhotoModal(true)}
                    >
                      <PawPrint className="w-16 h-16 text-vet-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-2xl pointer-events-none"></div>
                  <button
                    className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); setShowPhotoModal(true); }}
                    title="Cambiar foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  <Link
                    to={`/patients/${patientId}/edit`}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Editar mascota"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Eliminar mascota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              

              <nav className="p-3">
                <ul className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const baseUrl = item.path 
                      ? `/patients/${patientId}/${item.path}` 
                      : `/patients/${patientId}`;
                    const isActive = item.path
                      ? location.pathname.startsWith(baseUrl)
                      : location.pathname === baseUrl;
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-vet-light/40`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-vet-primary' : 'text-gray-400 group-hover:text-vet-primary'}`} />
                          <span className={`${isActive ? 'text-vet-primary' : 'text-gray-700 group-hover:text-vet-primary'} font-medium text-sm`}>
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-y-auto">
              <div className="p-6">
                <Outlet />
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