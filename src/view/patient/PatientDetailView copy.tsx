// src/views/patients/PatientDetailView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { getPatientById, deletePatient } from "../../api/patientAPI";
import { 
  PawPrint, 
  CalendarDays, 
  Scale, 
  Tag, 
  Heart, 
  Edit, 
  Trash2, 
  TestTube,
  User,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getOwnersById } from "../../api/OwnerAPI";

export default function PatientDetailView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Query for owner data
  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["owner", patient?.owner],
    queryFn: () => getOwnersById(patient?.owner!),
    enabled: !!patient?.owner,
  });

  // Mutación para eliminar paciente
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden flex flex-col">
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57, 255, 20, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57, 255, 20, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-danger/5 rounded-full blur-3xl" />

        <FloatingParticles />

        <div className="relative z-10 flex items-center justify-center flex-1 pt-16">
          <div className="text-center animate-pulse-soft">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-primary text-lg">Cargando mascota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden flex flex-col">
        <FloatingParticles />
        <div className="relative z-10 flex items-center justify-center flex-1 pt-16">
          <div className="text-center">
            <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/30 p-8 max-w-md mx-auto shadow-premium">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              <div className="relative z-10">
                <div className="p-6 rounded-xl bg-black/20 text-primary mx-auto mb-6 w-fit">
                  <PawPrint className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-text mb-3 title-shine">
                  Mascota no encontrada
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  La mascota que buscas no existe o ha sido eliminada
                </p>
              </div>
              <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular edad
  const calculateAge = () => {
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (years > 0) return `${years} año${years !== 1 ? 's' : ''}`;
    if (months > 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
    return `${Math.max(0, days)} día${days !== 1 ? 's' : ''}`;
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'perro':
      case 'dog':
        return '🐕';
      case 'gato':
      case 'cat':
        return '🐱';
      case 'ave':
      case 'bird':
        return '🐦';
      case 'conejo':
      case 'rabbit':
        return '🐰';
      default:
        return '🐾';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    removePatient();
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden">
        {/* Fondo decorativo mejorado */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57, 255, 20, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57, 255, 20, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Efectos de iluminación dinámicos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 xl:w-[600px] xl:h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 xl:w-[500px] xl:h-[500px] bg-danger/8 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 xl:w-[400px] xl:h-[400px] bg-muted/5 rounded-full blur-3xl" />

        <FloatingParticles />

        {/* Botón regresar */}
        <div className="fixed top-6 left-6 z-50">
          <BackButton />
        </div>

        {/* Header con foto grande */}
        <div className="relative z-10 pt-16 sm:pt-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`text-center transform transition-all duration-1500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl xl:rounded-[2rem] border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/90 border-primary/30 p-4 sm:p-6 md:p-8 xl:p-12 shadow-premium-hover w-full max-w-4xl mx-auto">
                {/* Efecto shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer opacity-70" />

                <div className="relative z-10">
                  {/* Foto de la mascota - Responsive */}
                  <div className="relative mb-6 sm:mb-8 xl:mb-10">
                    <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 xl:w-48 xl:h-48">
                      {patient.photo ? (
                        <img 
                          src={patient.photo} 
                          alt={patient.name} 
                          className="w-full h-full object-cover rounded-2xl sm:rounded-3xl border-4 border-danger/40 shadow-premium"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-radial-center rounded-2xl sm:rounded-3xl flex items-center justify-center border-4 border-danger/40 shadow-premium">
                          <PawPrint className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 xl:w-24 xl:h-24 text-danger" />
                        </div>
                      )}
                      
                      {/* Indicador de especie - Responsive */}
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-background/95 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl xl:text-3xl border-2 border-primary/30 shadow-lg">
                        {getSpeciesIcon(patient.species)}
                      </div>
                      
                      {/* Efecto de resplandor */}
                      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-primary/20 animate-neon-pulse opacity-30" />
                    </div>
                  </div>

                  {/* Información principal - Responsive */}
                  <div className="space-y-3 sm:space-y-4 xl:space-y-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-text title-shine mb-2">
                        {patient.name}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 xl:gap-4 text-text/80 text-sm sm:text-base md:text-lg xl:text-xl">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-neon-pulse"></span>
                          {patient.species}
                        </span>
                        <span className="w-1 h-1 bg-text/60 rounded-full"></span>
                        <span>{calculateAge()}</span>
                        <span className="w-1 h-1 bg-text/60 rounded-full"></span>
                        <span>{patient.sex === 'Macho' ? 'Macho' : 'Hembra'}</span>
                      </div>
                    </div>

                    {/* Botones de acción principales - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-6 justify-center pt-4 sm:pt-6 xl:pt-8">
                      <Link
                        to={`/patients/edit/${patient._id}`}
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 sm:hover:scale-110 transition-all duration-300 bg-primary/20 border-primary/30 px-4 py-2.5 sm:px-6 sm:py-3 xl:px-8 xl:py-4"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                        <div className="relative z-10 flex items-center justify-center gap-2 xl:gap-3">
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 text-primary" />
                          <span className="text-primary font-bold text-sm sm:text-sm xl:text-base">Editar</span>
                        </div>
                      </Link>

                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 sm:hover:scale-110 transition-all duration-300 bg-danger/20 border-danger/30 px-4 py-2.5 sm:px-6 sm:py-3 xl:px-8 xl:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-danger/10 to-transparent animate-shimmer" />
                        <div className="relative z-10 flex items-center justify-center gap-2 xl:gap-3">
                          {isDeleting ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
                              <span className="text-danger font-bold text-sm sm:text-sm xl:text-base">Eliminando...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 text-danger" />
                              <span className="text-danger font-bold text-sm sm:text-sm xl:text-base">Eliminar</span>
                            </>
                          )}
                        </div>
                      </button>

                      <Link
  to={`/patients/${patient._id}/lab-exams/create`}
  className="group relative overflow-hidden rounded-xl sm:rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 sm:hover:scale-110 transition-all duration-300 bg-primary/20 border-primary/30 px-4 py-2.5 sm:px-6 sm:py-3 xl:px-8 xl:py-4"
>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
  <div className="relative z-10 flex items-center justify-center gap-2 xl:gap-3">
    <TestTube className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 text-primary" />
    <span className="text-primary font-bold text-sm sm:text-sm xl:text-base">Hematología</span>
  </div>
</Link>
                    </div>
                  </div>
                </div>

                {/* Puntos de animación - Responsive */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 xl:top-6 xl:right-6 w-2 h-2 sm:w-3 sm:h-3 xl:w-4 xl:h-4 bg-danger rounded-full animate-neon-pulse opacity-60" />
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 xl:bottom-6 xl:left-6 w-1.5 h-1.5 sm:w-2 sm:h-2 xl:w-3 xl:h-3 bg-primary rounded-full animate-neon-pulse opacity-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="relative z-10 px-6 pb-20 mt-12 xl:mt-16">
          <div className="max-w-6xl mx-auto">
            {/* Grid de información */}
            <div className="grid lg:grid-cols-2 gap-6 xl:gap-8">
              {/* Información básica */}
              <div
                className={`transform transition-all duration-1500 delay-300 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/80 border-danger/20 shadow-premium p-6 xl:p-8 h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 xl:mb-8">
                      <div className="p-3 xl:p-4 rounded-xl bg-danger/20 text-danger">
                        <Heart className="w-6 h-6 xl:w-8 xl:h-8" />
                      </div>
                      <h2 className="text-2xl xl:text-3xl font-bold text-text title-shine">
                        Información General
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:gap-8">
                      {/* Fecha de nacimiento */}
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-danger/10 border-danger/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-danger/20 text-danger">
                            <CalendarDays className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-danger text-sm font-bold uppercase tracking-wide mb-1">
                              Fecha de nacimiento
                            </p>
                            <p className="text-background font-semibold text-lg">
                              {formatDate(patient.birthDate)}
                            </p>
                            <p className="text-text/70 text-sm mt-1">
                              {calculateAge()} de edad
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-neon-pulse opacity-60" />
                      </div>

                      {/* Peso */}
                      {patient.weight && (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-muted/10 border-muted/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-muted/20 text-muted">
                              <Scale className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-danger text-sm font-bold uppercase tracking-wide mb-1">
                                Peso actual
                              </p>
                              <p className="text-text font-semibold text-lg">
                                {patient.weight} kg
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-muted rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      )}

                      {/* Raza */}
                      {patient.breed && (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/10 border-background/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-background/20 text-text">
                              <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-danger text-sm font-bold uppercase tracking-wide mb-1">
                                Raza
                              </p>
                              <p className="text-text font-semibold text-lg">
                                {patient.breed}
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 xl:top-6 xl:right-6 w-3 h-3 bg-danger rounded-full animate-neon-pulse opacity-60" />
                </div>
              </div>

              {/* Información del propietario */}
              <div
                className={`transform transition-all duration-1500 delay-500 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/80 border-muted/20 shadow-premium p-6 xl:p-8 h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 xl:mb-8">
                      <div className="p-3 xl:p-4 rounded-xl bg-muted/20 text-muted">
                        <User className="w-6 h-6 xl:w-8 xl:h-8" />
                      </div>
                      <h2 className="text-2xl xl:text-3xl font-bold text-text title-shine">
                        Propietario
                      </h2>
                    </div>

                    <div className="space-y-6 xl:space-y-8">
                      {isLoadingOwner ? (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/90 border-danger/20 p-4 xl:p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 xl:w-16 xl:h-16 bg-gradient-radial-center rounded-full border-2 border-danger/30 animate-pulse">
                              <div className="w-full h-full bg-danger/20 rounded-full" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-danger/20 rounded animate-pulse" />
                              <div className="h-3 bg-muted/20 rounded w-2/3 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      ) : owner ? (
                        <>
                          <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/90 border-danger/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                            <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 xl:w-16 xl:h-16 bg-gradient-radial-center rounded-full flex items-center justify-center border-2 border-danger/30">
                                  <span className="text-danger font-bold text-lg xl:text-xl">
                                    {owner.name
                                      ?.split(" ")
                                      .map((n: string) => n.charAt(0))
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-text font-bold text-xl xl:text-2xl">
                                    {owner.name}
                                  </p>
                                  <p className="text-text/70 text-sm">
                                    Propietario responsable
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <p className="text-text/70 text-sm flex items-center gap-2">
                                  <span className="w-1 h-1 bg-danger rounded-full"></span>
                                  Teléfono: {owner.contact}
                                </p>
                                {owner.email && (
                                  <p className="text-text/70 text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 bg-danger rounded-full"></span>
                                    Email: {owner.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-neon-pulse opacity-60" />
                          </div>

                          <Link
                            to={`/owners/${owner._id}`}
                            className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 bg-primary/20 border-primary/30 p-4 xl:p-6 block"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                            <div className="relative z-10 flex items-center justify-center gap-3">
                              <User className="w-5 h-5 text-primary" />
                              <span className="text-primary font-bold">Ver perfil completo</span>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <div className="text-center text-text/70">
                          No se encontró información del propietario
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 xl:top-6 xl:right-6 w-3 h-3 bg-muted rounded-full animate-neon-pulse opacity-60" />
                </div>
              </div>

              {/* NUEVO: Información del equipo médico */}
              <div
                className={`transform transition-all duration-1500 delay-700 lg:col-span-2 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/80 border-primary/20 shadow-premium p-6 xl:p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 xl:mb-8">
                      <div className="p-3 xl:p-4 rounded-xl bg-primary/20 text-primary">
                        <User className="w-6 h-6 xl:w-8 xl:h-8" />
                      </div>
                      <h2 className="text-2xl xl:text-3xl font-bold text-text title-shine">
                        Equipo Médico
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                      {/* Veterinario responsable */}
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/20 p-4 xl:p-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/20 text-primary">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-primary text-sm font-bold uppercase tracking-wide mb-1">
                              Veterinario Laboratorio
                            </p>
                            <p className="text-text font-semibold text-lg">
                              {patient.mainVet}
                            </p>
                            <p className="text-text/70 text-sm mt-1">
                             Examenes de Laboratorio
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                      </div>

                      {/* Veterinario referido (opcional) */}
                      {patient.referringVet && (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-muted/10 border-muted/20 p-4 xl:p-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-muted/20 text-muted">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-muted text-sm font-bold uppercase tracking-wide mb-1">
                                Veterinario Tratante
                              </p>
                              <p className="text-text font-semibold text-lg">
                                {patient.referringVet}
                              </p>
                              <p className="text-text/70 text-sm mt-1">
                                Origen del paciente
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-muted rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 xl:top-6 xl:right-6 w-3 h-3 bg-primary rounded-full animate-neon-pulse opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        petName={patient?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  );
}