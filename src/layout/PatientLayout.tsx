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
  ChevronDown,
  DollarSign,
  Menu,
  X,
  Pill,
} from "lucide-react";
import { useParams, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { getPatientById, deletePatient } from "../api/patientAPI";
import { getActiveAppointmentsByPatient } from "../api/appointmentAPI";
import { getGroomingServicesByPatient } from "../api/groomingAPI";
import { getPatientDebtSummary } from "../api/invoiceAPI";
import PhotoModal from "../components/patients/PhotoModal";
import { toast } from "../components/Toast";
import ConfirmationModal from "../components/modal/ConfirmationModal";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
  const [showGroomingDropdown, setShowGroomingDropdown] = useState(false);
  const [showDebtDropdown, setShowDebtDropdown] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const appointmentsRef = useRef<HTMLDivElement>(null);
  const groomingRef = useRef<HTMLDivElement>(null);
  const debtRef = useRef<HTMLDivElement>(null);
  const patientInfoRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

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

  const { data: debtSummary } = useQuery({
    queryKey: ["patientDebt", patientId],
    queryFn: () => getPatientDebtSummary(patientId!),
    enabled: !!patientId,
  });

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const todayDateString = getTodayDateString();

  const todaysGroomingServices = useMemo(() => {
    return (groomingServices || []).filter((service) => {
      const serviceDate = new Date(service.date);
      const serviceDateString = `${serviceDate.getFullYear()}-${String(serviceDate.getMonth() + 1).padStart(2, "0")}-${String(serviceDate.getDate()).padStart(2, "0")}`;
      return serviceDateString === todayDateString;
    });
  }, [groomingServices, todayDateString]);

  const hasActiveAppointments = (activeAppointments || []).length > 0;
  const todaysGroomingCount = todaysGroomingServices.length;
  const hasTodaysGrooming = todaysGroomingCount > 0;
  const hasDebt = (debtSummary?.totalDebt || 0) > 0;
  const debtCount = debtSummary?.invoicesCount || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appointmentsRef.current && !appointmentsRef.current.contains(event.target as Node)) {
        setShowAppointmentsDropdown(false);
      }
      if (groomingRef.current && !groomingRef.current.contains(event.target as Node)) {
        setShowGroomingDropdown(false);
      }
      if (debtRef.current && !debtRef.current.contains(event.target as Node)) {
        setShowDebtDropdown(false);
      }
      if (patientInfoRef.current && !patientInfoRef.current.contains(event.target as Node)) {
        setShowPatientInfo(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowAppointmentsDropdown(false);
    setShowGroomingDropdown(false);
    setShowDebtDropdown(false);
    setShowPatientInfo(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    if (navScrollRef.current) {
      const activeItem = navScrollRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [location.pathname]);

  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePatient(patientId!),
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar la mascota");
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.warning("Mascota eliminada", " ha sido retirada del cliente.");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  const handleDeleteClick = () => {
    if (hasActiveAppointments || (groomingServices || []).length > 0) {
      toast.error("No se puede eliminar: tiene citas o servicios activos");
      return;
    }
    setShowDeleteModal(true);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const calculateAge = () => {
    if (!patient?.birthDate) return "—";
    const birth = new Date(patient.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

    if (months < 1) return "< 1 mes";
    if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} ${years === 1 ? "año" : "años"}`;
    return `${years}a ${remainingMonths}m`;
  };

  const isCanino = patient?.species?.toLowerCase() === "canino";

  const menuItems = [
    { id: "datos", label: "Info", icon: PawPrint, path: "", description: "Datos básicos" },
    { id: "consultas", label: "Consultas", icon: Stethoscope, path: "consultations", description: "Historial médico" },
    { id: "tratamientos", label: "Tratamientos", icon: Pill, path: "treatments", description: "Medicamentos activos" },
      { id: "servicios", label: "Servicios", icon: Stethoscope, path: "veterinary-services", description: "Procedimientos" },
    { id: "recetas", label: "Recetas", icon: FileText, path: "recipes", description: "Prescripciones" },
    { id: "vacunas", label: "Vacunas", icon: Syringe, path: "vaccinations", description: "Esquema de vacunación" },
    { id: "desparasitacion", label: "Antiparasit.", icon: Bug, path: "dewormings", description: "Control de parásitos" },
    { id: "hematologia", label: "Exámenes", icon: Activity, path: "lab-exams", description: "Exámenes de sangre" },
    { id: "estudios", label: "Estudios", icon: FileText, path: "studies", description: "Rayos X, ecografías" },
    { id: "peluqueria", label: "Estética", icon: Scissors, path: "grooming-services", description: "Servicios estéticos" },
    { id: "citas", label: "Citas", icon: Calendar, path: "appointments/create", description: "Agendar consulta" },
  ];

  if (isLoading) {
    return (
      <div className="patient-loading">
        <div className="text-center">
          <div className="relative">
            <div className="patient-loading-spinner" />
            <PawPrint className="patient-loading-icon" />
          </div>
          <p className="patient-loading-text">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-not-found">
        <div className="patient-not-found-card">
          <div className="patient-not-found-icon-wrapper">
            <PawPrint className="patient-not-found-icon" />
          </div>
          <h2 className="patient-not-found-title">Paciente no encontrado</h2>
          <p className="patient-not-found-text">El expediente que buscas no existe o fue eliminado.</p>
          <button onClick={() => navigate(-1)}
          className="patient-not-found-button">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver a pacientes
          </button>
        </div>
      </div>
    );
  }

  const ownerName = typeof patient.owner === "object" && patient.owner?.name ? patient.owner.name : "Propietario";
  const ownerId = typeof patient.owner === "string" ? patient.owner : patient.owner?._id;

  return (
    <>
      {/* HEADER NIVEL 1 */}
      <div className="patient-header-level-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="patient-header-level-1-inner">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button onClick={() => navigate(-1)} className="back-button" title="Volver a pacientes">
                <ArrowLeft className="back-button-icon" />
              </button>

              <div className="header-divider" />

              <div className="relative flex-1 min-w-0" ref={patientInfoRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPatientInfo(!showPatientInfo);
                  }}
                  className="patient-info-trigger w-full"
                >
                  <div className="relative flex-shrink-0">
                    <div className={`patient-photo-header ${isCanino ? "patient-photo-header-canino" : "patient-photo-header-felino"}`}>
                      {patient.photo ? (
                        <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                          {isCanino ? "🐕" : "🐱"}
                        </div>
                      )}
                    </div>
                    <div className={`patient-sex-badge ${patient.sex === "Macho" ? "patient-sex-badge-macho" : "patient-sex-badge-hembra"}`}>
                      {patient.sex === "Macho" ? "♂" : "♀"}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <h1 className="patient-name-header">{patient.name}</h1>
                      <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-vet-muted)] transition-transform flex-shrink-0 ${showPatientInfo ? "rotate-180" : ""}`} />
                    </div>
                    <div className="patient-meta-header">
                      <span className="truncate max-w-[80px] sm:max-w-none">{patient.breed || patient.species}</span>
                      <span className="text-[var(--color-vet-muted)]">•</span>
                      <span className="flex-shrink-0">{calculateAge()}</span>
                      {patient.weight && (
                        <>
                          <span className="text-[var(--color-vet-muted)] show-sm">•</span>
                          <span className="show-sm flex-shrink-0">{patient.weight} kg</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {showPatientInfo && (
                  <div className="patient-dropdown">
                    <div className={`patient-dropdown-header ${isCanino ? "patient-dropdown-header-canino" : "patient-dropdown-header-felino"}`}>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="relative group">
                          <div className="patient-dropdown-photo">
                            {patient.photo ? (
                              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                                {isCanino ? "🐕" : "🐱"}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPatientInfo(false);
                              setShowPhotoModal(true);
                            }}
                            className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-[var(--color-card)] rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-vet-muted)]" />
                          </button>
                        </div>
                        <div className="flex-1 text-white min-w-0">
                          <h3 className="patient-dropdown-name truncate">{patient.name}</h3>
                          <p className="patient-dropdown-breed truncate">{patient.breed || patient.species}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                            <span className={`patient-dropdown-badge ${patient.sex === "Macho" ? "bg-blue-400/30" : "bg-pink-400/30"}`}>
                              {patient.sex}
                            </span>
                            <span className="patient-dropdown-badge bg-white/20">{patient.species}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                      <div className="patient-dropdown-stats">
                        <div className="patient-dropdown-stat">
                          <Clock className="patient-dropdown-stat-icon" />
                          <div className="min-w-0">
                            <p className="patient-dropdown-stat-label">Edad</p>
                            <p className="patient-dropdown-stat-value truncate">{calculateAge()}</p>
                          </div>
                        </div>
                        <div className="patient-dropdown-stat">
                          <Activity className="patient-dropdown-stat-icon" />
                          <div className="min-w-0">
                            <p className="patient-dropdown-stat-label">Peso</p>
                            <p className="patient-dropdown-stat-value">{patient.weight ? `${patient.weight} kg` : "—"}</p>
                          </div>
                        </div>
                        <div className="patient-dropdown-stat">
                          <PawPrint className="patient-dropdown-stat-icon" />
                          <div className="min-w-0">
                            <p className="patient-dropdown-stat-label">Color</p>
                            <p className="patient-dropdown-stat-value truncate">{patient.color || "—"}</p>
                          </div>
                        </div>
                        <div className="patient-dropdown-stat">
                          <Stethoscope className="patient-dropdown-stat-icon" />
                          <div className="min-w-0">
                            <p className="patient-dropdown-stat-label">Estado</p>
                            <p className="patient-dropdown-stat-value text-green-500">Activo</p>
                          </div>
                        </div>
                      </div>

                      <Link to={`/owners/${ownerId}`} onClick={() => setShowPatientInfo(false)} className="owner-link">
                        <div className="owner-link-icon">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-vet-accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="owner-link-label">Propietario</p>
                          <p className="owner-link-name">{ownerName}</p>
                        </div>
                      </Link>

                      <div className="patient-dropdown-actions">
                        <Link
                          to={`/patients/${patientId}/edit`}
                          onClick={() => setShowPatientInfo(false)}
                          className="patient-dropdown-edit"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Editar
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPatientInfo(false);
                            handleDeleteClick();
                          }}
                          className="patient-dropdown-delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <div className="relative" ref={debtRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasDebt) {
                      setShowDebtDropdown(!showDebtDropdown);
                      setShowAppointmentsDropdown(false);
                      setShowGroomingDropdown(false);
                    }
                  }}
                  className={`indicator-button ${hasDebt ? "indicator-button-debt" : "indicator-button-inactive"}`}
                  title={hasDebt ? `$${debtSummary?.totalDebt.toFixed(2)} pendiente` : "Sin deudas"}
                >
                  <DollarSign className="indicator-icon" />
                  {hasDebt && <span className="indicator-badge indicator-badge-debt">{debtCount}</span>}
                </button>

               {showDebtDropdown && hasDebt && (
  <div className="indicator-dropdown indicator-dropdown-md">
    <div className="indicator-dropdown-header indicator-dropdown-header-debt">
      <p className="indicator-dropdown-title">Pagos Pendientes</p>
      <p className="indicator-dropdown-subtitle">
        {debtCount} factura{debtCount !== 1 ? "s" : ""}
      </p>
    </div>
    
    <div className="px-3 sm:px-4 py-2 bg-red-500/5 border-b border-red-500/10">
      <p className="text-xs text-[var(--color-vet-muted)] mb-0.5">Total Pendiente</p>
      <p className="text-lg font-bold text-red-600 dark:text-red-400">
        ${debtSummary?.totalDebt.toFixed(2)}
      </p>
    </div>

    <div className="indicator-dropdown-content">
      {debtSummary?.invoices.map((invoice) => {
        const remaining = invoice.total - (invoice.amountPaid || 0);
        const statusColor = invoice.paymentStatus === "Parcial" 
          ? "text-orange-600 dark:text-orange-400" 
          : "text-red-600 dark:text-red-400";
        
        return (
          <Link
            key={invoice._id}
            to={`/invoices/${invoice._id}?action=pay`}  
            className="indicator-dropdown-item"
            onClick={() => setShowDebtDropdown(false)}
          >
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex-1 min-w-0">
                <p className="indicator-dropdown-item-title truncate">
                  Factura #{invoice._id?.slice(-6).toUpperCase()}
                </p>
                <p className="indicator-dropdown-item-meta">
                  {new Date(invoice.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {invoice.items && invoice.items.length > 0 && (
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-vet-muted)] mt-0.5 truncate">
                    {invoice.items[0].description}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs sm:text-sm font-bold ${statusColor}`}>
                  ${remaining.toFixed(2)}
                </p>
                <span className="text-[9px] sm:text-[10px] text-[var(--color-vet-muted)]">
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
)}
              </div>

              <div className="relative" ref={appointmentsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasActiveAppointments) {
                      setShowAppointmentsDropdown(!showAppointmentsDropdown);
                      setShowGroomingDropdown(false);
                      setShowDebtDropdown(false);
                    }
                  }}
                  className={`indicator-button ${hasActiveAppointments ? "indicator-button-appointments" : "indicator-button-inactive"}`}
                  title={hasActiveAppointments ? `${activeAppointments?.length} cita(s) activas` : "Sin citas activas"}
                >
                  <Calendar className="indicator-icon" />
                  {hasActiveAppointments && (
                    <span className="indicator-badge indicator-badge-appointments">{activeAppointments?.length}</span>
                  )}
                </button>

                {showAppointmentsDropdown && hasActiveAppointments && (
                  <div className="indicator-dropdown indicator-dropdown-md">
                    <div className="indicator-dropdown-header indicator-dropdown-header-appointments">
                      <p className="indicator-dropdown-title">Citas Activas</p>
                      <p className="indicator-dropdown-subtitle">
                        {activeAppointments?.length} programada{activeAppointments?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="indicator-dropdown-content">
                      {activeAppointments?.map((appt) => (
                        <Link
                          key={appt._id}
                          to={`/patients/${patient._id}/appointments/${appt._id}`}
                          className="indicator-dropdown-item"
                          onClick={() => setShowAppointmentsDropdown(false)}
                        >
                          <p className="indicator-dropdown-item-title">{appt.type}</p>
                          <p className="indicator-dropdown-item-meta">
                            {new Date(appt.date).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={groomingRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasTodaysGrooming) {
                      setShowGroomingDropdown(!showGroomingDropdown);
                      setShowAppointmentsDropdown(false);
                      setShowDebtDropdown(false);
                    }
                  }}
                  className={`indicator-button ${hasTodaysGrooming ? "indicator-button-grooming" : "indicator-button-inactive"}`}
                  title={hasTodaysGrooming ? `${todaysGroomingCount} servicio(s) hoy` : "Sin servicios hoy"}
                >
                  <Scissors className="indicator-icon" />
                  {hasTodaysGrooming && (
                    <span className="indicator-badge indicator-badge-grooming">{todaysGroomingCount}</span>
                  )}
                </button>

                {showGroomingDropdown && hasTodaysGrooming && (
                  <div className="indicator-dropdown indicator-dropdown-md">
                    <div className="indicator-dropdown-header indicator-dropdown-header-grooming">
                      <p className="indicator-dropdown-title">Servicios de Hoy</p>
                      <p className="indicator-dropdown-subtitle">
                        {todaysGroomingCount} servicio{todaysGroomingCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="indicator-dropdown-content">
                      {todaysGroomingServices.map((service) => (
                        <Link
                          key={service._id}
                          to={`/patients/${patient._id}/grooming-services/${service._id}`}
                          className="indicator-dropdown-item"
                          onClick={() => setShowGroomingDropdown(false)}
                        >
                          <p className="indicator-dropdown-item-title">{service.service}</p>
                          {service.specifications && (
                            <p className="indicator-dropdown-item-meta">{service.specifications}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="header-clock">
                <div className="text-right">
                  <p className="header-clock-time">{formatTime(currentTime)}</p>
                  <p className="header-clock-date">{formatDate(currentTime).split(",")[0]}</p>
                </div>
                <Clock className="header-clock-icon" />
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-[var(--color-vet-text)] hover:bg-[var(--color-hover)] transition-colors ml-1"
                title="Menú"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {showMobileMenu && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 z-40 animate-fadeIn"
            onClick={() => setShowMobileMenu(false)}
            style={{ top: "7rem" }}
          />

          <div 
            className="lg:hidden fixed right-0 top-0 bottom-0 w-72 mobile-menu-drawer z-50" 
            style={{ top: "7rem" }}
          >
            <div className="p-4">
              <h3 className="text-sm font-bold text-[var(--color-vet-muted)] uppercase tracking-wider mb-3">
                Expediente Médico
              </h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const basePath = `/patients/${patientId}`;
                  const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
                  const isActive = item.path ? location.pathname.includes(item.path) : location.pathname === basePath;

                  return (
                    <Link
                      key={item.id}
                      to={fullPath}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white shadow-md"
                          : "text-[var(--color-vet-text)] hover:bg-[var(--color-hover)]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-[var(--color-hover)]"}`}>
                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[var(--color-vet-accent)]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isActive ? "text-white" : "text-[var(--color-vet-text)]"}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs truncate ${isActive ? "text-white/70" : "text-[var(--color-vet-muted)]"}`}>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}

      
     <div className="patient-header-level-2 hidden lg:block">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-center">
      <nav 
        className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-invisible" 
        ref={navScrollRef}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const basePath = `/patients/${patientId}`;
          const fullPath = item.path ? `${basePath}/${item.path}` : basePath;
          const isActive = item.path ? location.pathname.includes(item.path) : location.pathname === basePath;

          return (
            <Link
              key={item.id}
              to={fullPath}
              data-active={isActive}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "bg-[var(--color-vet-primary)] text-white shadow-md"
                  : "bg-[var(--color-card)] text-[var(--color-vet-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-vet-text)] border border-[var(--color-border)]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-[var(--color-vet-muted)]"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  </div>
</div>

      <div className="patient-layout-content">
        <div className="max-w-7xl mx-auto">
          <div className="patient-layout-card">
            <div className="patient-layout-card-inner">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={removePatient}
        title="¿Eliminar mascota?"
        message={`¿Estás seguro de que deseas eliminar a ${patient.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />

      <PhotoModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} patient={patient} />
    </>
  );
}