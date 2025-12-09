import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PawPrint, ArrowLeft, Calendar,  Scissors, Camera, User, Stethoscope, FileText, Edit, Trash2, Mail, Phone, Home, X } from "lucide-react";
import { toast } from "../../components/Toast";
import { getPatientById, deletePatient } from "../../api/patientAPI";
import { getActiveAppointmentsByPatient, updateAppointmentStatus } from "../../api/appointmentAPI";
import { getOwnersById } from "../../api/OwnerAPI";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import PhotoModal from "../../components/patients/PhotoModal";
import type { Appointment } from "../../types";
import { extractId } from "../../utils/extractId";

export default function PatientDetailView() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("propietario");
  const [cancelingAppointment, setCancelingAppointment] = useState<Appointment | null>(null);

  // Queries
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: owner, isLoading: isLoadingOwner } = useQuery({
  queryKey: ["owner", patient?.owner],
  queryFn: () => {
  const ownerId = extractId(patient?.owner);
  if (!ownerId) {
    throw new Error("ID del propietario no disponible");
  }
  return getOwnersById(ownerId);
},
  enabled: !!patient?.owner,
});
  const { data: activeAppointments } = useQuery({
    queryKey: ["activeAppointments", patientId],
    queryFn: () => getActiveAppointmentsByPatient(patientId!),
    enabled: !!patientId,
  });

  // Mutation para eliminar paciente
  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePatient(patientId!),
    onError: (error: Error) => {
      toast.error(error.message);
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  // Mutation para cancelar cita
  const { mutate: cancelAppointment, isPending: isCanceling } = useMutation({
    mutationFn: (appointmentId: string) => 
      updateAppointmentStatus(appointmentId, { status: "Cancelada" }),
    onError: (error: Error) => {
      toast.error(error.message);
      setCancelingAppointment(null);
    },
    onSuccess: () => {
      toast.success("Cita cancelada con éxito");
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      setCancelingAppointment(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const confirmDelete = () => {
    removePatient();
  };

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
          <h2 className="text-2xl font-bold text-vet-text mb-2">
            Mascota no encontrada
          </h2>
          <p className="text-vet-muted mb-6">
            La mascota que buscas no existe o ha sido eliminada.
          </p>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 shadow-soft hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const hasActiveAppointments = activeAppointments && activeAppointments.length > 0;

  const calculateAge = () => {
    if (!patient?.birthDate) return "";
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (years > 0) return `${years} año${years !== 1 ? "s" : ""}`;
    if (months > 0) return `${months} mes${months !== 1 ? "es" : ""}`;
    return `${Math.max(0, days)} día${days !== 1 ? "s" : ""}`;
  };

  const tabs = [
    { id: "propietario", label: "Propietario", icon: User },
    { id: "veterinario", label: "Veterinario", icon: Stethoscope },
    { id: "detalles", label: "Detalles", icon: FileText }
  ];

  return (
    <>
      {/* Header*/}
      <div className="fixed top-14 left-0 right-0 lg:top-16 lg:left-64 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Lado izquierdo - Información de la mascota */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                to={`/owners/${patient?.owner}`}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl hover:bg-vet-light text-vet-muted hover:text-vet-primary transition-all duration-200"
                title="Volver al propietario"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <h1 className="text-xl font-bold text-vet-text truncate">{patient.name}</h1>
                  {hasActiveAppointments && (
                    <span className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Cita Activa
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Lado derecho - Botones de acción */}
            <div className="flex items-center gap-2 flex-shrink-0">
  {/* Botón Cita -  con tooltip */}
  <div className="relative group">
    <Link
      to={`/patients/${patientId}/appointments/create`}
      className="flex p-2 items-center justify-center w-10 h-10 rounded-md hover:bg-gray-200  text-purple-600 transition-all duration-200  hover:shadow-md"
    >
      <Stethoscope className="w-5 h-5" />
    </Link>
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40">
      Nueva cita
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-gray-900"></div>
    </div>
  </div>

  {/* Botón Exámenes - con tooltip */}
  <div className="relative group">
    <Link
      to={`/patients/${patientId}/lab-exams`}
      className="flex p-2 items-center justify-center w-10 h-10 rounded-md hover:bg-gray-200  text-green-600 transition-all duration-200  hover:shadow-md"
    >
      <FileText className="w-5 h-5" />
    </Link>
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40">
      Hematología
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-gray-900"></div>
    </div>
  </div>

  {/* Botón Peluquería  */}
  <div className="relative group">
    <Link
      to={`/patients/${patientId}/grooming-services/create`}
      className="flex p-2 items-center justify-center w-10 h-10 rounded-md hover:bg-gray-200  text-blue-600 transition-all duration-200  hover:shadow-md"
    >
      <Scissors className="w-5 h-5" />
    </Link>
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40">
      Servicios
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-gray-900"></div>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>

      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-6 py-3`}>
        <div className="max-w-6xl mx-auto">

        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
            
            {/* Columna izquierda */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                {/* Foto de perfil  */}
                <div className="relative bg-gradient-to-br from-vet-light to-white p-3">
                  {patient.photo ? (
                    <div className="relative">
                      <img
                        src={patient.photo}
                        alt={patient.name}
                        className="w-full aspect-square rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        title="Cambiar foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-gradient-to-br from-vet-light to-vet-accent/20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <PawPrint className="w-16 h-16 text-vet-primary/30" />
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="absolute bottom-3 right-3 p-2 bg-vet-primary hover:bg-vet-secondary text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        title="Agregar foto"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Información principal */}
                <div className="p-3 text-center border-b border-gray-100">
                  <h2 className="text-lg font-bold text-vet-text mb-2">{patient.name}</h2>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-gradient-to-r from-vet-primary to-vet-secondary text-white rounded-full text-xs font-semibold shadow-sm">
                      {patient.species}
                    </span>
                    <span className="text-xl">{patient.sex === "Macho" ? "♂" : "♀"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {patient.weight && (
                      <div className="bg-vet-light/50 rounded-xl p-2">
                        <p className="text-vet-muted text-xs mb-0.5">Peso</p>
                        <p className="text-vet-text font-bold">{patient.weight} kg</p>
                      </div>
                    )}
                    <div className="bg-vet-light/50 rounded-xl p-2">
                      <p className="text-vet-muted text-xs mb-0.5">Edad</p>
                      <p className="text-vet-text font-bold">{calculateAge()}</p>
                    </div>
                  </div>
                </div>

                {/*  Tooltips ARRIBA */}
                <div className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative group">
                      <Link
                        to={`/patients/${patientId}/edit`}
                        className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white transition-all duration-200 shadow-soft hover:shadow-md hover:scale-105"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40">
                        Editar información
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-soft hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isDeleting ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40">
                        Eliminar mascota
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Tabs modernos + Citas */}
            <div className="lg:col-span-2 space-y-3">
              {/* Card de Tabs */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                
                {/* Pestañas con diseño premium */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <nav className="flex">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            relative flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300
                            ${isActive
                              ? "text-vet-primary"
                              : "text-vet-muted hover:text-vet-text"
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110" : ""}`} />
                          <span className="hidden sm:inline">{tab.label}</span>
                          
                          {/* Indicador animado */}
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vet-primary to-vet-secondary rounded-t-full transform transition-all duration-300" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Contenido de las pestañas con animación */}
                <div className="p-3">
                  
                  {/* Tab: Propietario */}
                  {activeTab === "propietario" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-vet-text">
                          Información del Propietario
                        </h3>
                      </div>
                      
                      {isLoadingOwner ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : owner ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3.5 h-3.5 text-vet-primary" />
                              <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">Nombre</span>
                            </div>
                            <p className="text-vet-text font-bold">{owner.name}</p>
                          </div>

                          {owner.email && (
                            <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Mail className="w-3.5 h-3.5 text-vet-primary" />
                                <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">Email</span>
                              </div>
                              <p className="text-vet-text font-bold text-sm break-all">{owner.email}</p>
                            </div>
                          )}

                          {owner.phone && (
                            <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-3.5 h-3.5 text-vet-primary" />
                                <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">Teléfono</span>
                              </div>
                              <p className="text-vet-text font-bold">{owner.phone}</p>
                            </div>
                          )}

                          {owner.address && (
                            <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200 md:col-span-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Home className="w-3.5 h-3.5 text-vet-primary" />
                                <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">Dirección</span>
                              </div>
                              <p className="text-vet-text font-bold">{owner.address}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-vet-muted">No se encontró información del propietario</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Veterinario */}
                  {activeTab === "veterinario" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-vet-text">
                          Información Veterinaria
                        </h3>
                      </div>
                      
                      {patient.referringVet ? (
                        <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Veterinario</span>
                          <p className="text-vet-text font-bold">{patient.referringVet}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-vet-light/20 rounded-xl">
                          <Stethoscope className="w-10 h-10 mx-auto text-vet-muted/30 mb-2" />
                          <p className="text-vet-muted text-sm">No hay información veterinaria registrada</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Detalles Adicionales */}
                  {activeTab === "detalles" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-vet-text">
                          Detalles Adicionales
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Fecha de Nacimiento</span>
                          <p className="text-vet-text font-bold">
                            {patient.birthDate
                              ? new Date(patient.birthDate).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "No registrada"}
                          </p>
                        </div>

                        <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Sexo</span>
                          <p className="text-vet-text font-bold">{patient.sex}</p>
                        </div>

                        {patient.identification && (
                          <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                            <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Identificación</span>
                            <p className="text-vet-text font-bold">{patient.identification}</p>
                          </div>
                        )}

                        <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200">
                          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Raza</span>
                          <p className="text-vet-text font-bold">{patient.breed || "No especificada"}</p>
                        </div>

                        <div className="bg-vet-light/30 rounded-xl p-3 hover:bg-vet-light/50 transition-colors duration-200 md:col-span-2">
                          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Color</span>
                          <p className="text-vet-text font-bold">{patient.color || "No especificado"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Citas Activas debajo de los tabs */}
              {hasActiveAppointments && (
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-base font-bold text-vet-text flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-vet-primary" />
                      Citas Programadas
                    </h3>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {activeAppointments.map((appt) => (
                      <div key={appt._id} className="bg-gradient-to-r from-vet-light/30 to-white rounded-xl p-3 hover:shadow-md transition-all duration-200 border border-gray-100">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Tipo</span>
                              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {appt.type}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Fecha</span>
                              <p className="text-vet-text font-bold text-sm">
                                {new Date(appt.date).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Motivo</span>
                              <p className="text-vet-text font-medium text-sm">{appt.reason || "Sin motivo"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide block mb-1">Observaciones</span>
                              <p className="text-vet-text font-medium text-sm">{appt.observations || "Sin observaciones"}</p>
                            </div>
                          </div>
                          
                          {/* Botones de acción - Tooltips ABAJO */}
                          <div className="flex items-center gap-1">
                            <div className="relative group">
                              <Link
                                to={`/patients/${patientId}/appointments/${appt._id}/edit`}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40">
                                Editar cita
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-gray-900"></div>
                              </div>
                            </div>
                            <div className="relative group">
                              <button
                                onClick={() => setCancelingAppointment(appt)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40">
                                Cancelar cita
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Modales */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        patient={patient}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        petName={patient.name || ""}
        isDeleting={isDeleting}
      />

      {/* Modal de cancelar cita */}
      {cancelingAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Cancelar Cita
                  </h3>
                </div>
                <button
                  onClick={() => setCancelingAppointment(null)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro que deseas cancelar esta cita?
                </p>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="text-sm font-semibold text-gray-900">{cancelingAppointment.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fecha:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(cancelingAppointment.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {cancelingAppointment.reason && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Motivo:</span>
                      <span className="text-sm font-semibold text-gray-900">{cancelingAppointment.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelingAppointment(null)}
                  disabled={isCanceling}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No, mantener
                </button>
                <button
                  onClick={() => cancelAppointment(cancelingAppointment._id)}
                  disabled={isCanceling}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCanceling ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Sí, cancelar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}