// src/views/patients/PatientDetailView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { getPatientById, deletePatient } from "../../api/patientAPI";
import { 
  PawPrint, 
  Heart, 
  Edit, 
  Trash2, 
  TestTube,
  User,
  Scissors
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

  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["owner", patient?.owner],
    queryFn: () => getOwnersById(patient?.owner!),
    enabled: !!patient?.owner,
  });

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

        <div className="absolute top-1/4 left-1/4 w-96 h-96 xl:w-[600px] xl:h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 xl:w-[500px] xl:h-[500px] bg-danger/8 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 xl:w-[400px] xl:h-[400px] bg-muted/5 rounded-full blur-3xl" />

        <FloatingParticles />

        <div className="fixed top-20 left-6 z-50">
          <BackButton />
        </div>

        {/* Header con foto y título */}
        <div className="relative mt-20 z-10 pt-8 sm:pt-16 md:pt-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`flex flex-col items-center gap-4 sm:gap-6 transform transition-all duration-1500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              {/* Foto */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 xl:w-64 xl:h-64 mb-0">
                {patient.photo ? (
                  <img 
                    src={patient.photo} 
                    alt={patient.name} 
                    className="w-full h-full object-cover rounded-t-3xl border-4 border-danger/40 shadow-md"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 rounded-t-3xl flex items-center justify-center border-4 border-danger/40 shadow-md">
                    <PawPrint className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 text-danger" />
                  </div>
                )}
              </div>

              {/* Tarjeta con nombre e info básica - PEGADA a la foto */}
              <div className="w-48 sm:w-52 md:w-56 xl:w-64 -mt-1">
                <div className="relative overflow-hidden rounded-b-3xl bg-white px-4 py-6 sm:py-7 shadow-lg">
                  <div className="relative z-10 text-center">
                    <h1 className="text-xl sm:text-2xl md:text-2xl font-medium text-gray-900 mb-2">
                      {patient.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm sm:text-base font-light">
                      <span>{patient.species}</span>
                      <span>|</span>
                      <span>{calculateAge()}</span>
                      <span>|</span>
                      <span>{patient.sex === 'Macho' ? 'Macho' : 'Hembra'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-md mt-4 sm:mt-6 px-4">
                {/* Primera fila: Editar y Eliminar */}
                <div className="flex gap-3 justify-center">
                  <Link
                    to={`/patients/edit/${patient._id}`}
                    className="p-3 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200"
                  >
                    <Edit className="w-5 h-5 text-white" />
                  </Link>

                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="p-3 rounded-full bg-red-700/50 hover:bg-red-600/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="w-5 h-5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Segunda fila: Laboratorio y Peluquería */}
                <div className="flex gap-3 justify-center">
                  <Link
                    to={`/patients/${patientId}/lab-exams`}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-green-500 text-green-500 hover:bg-green-500/10 transition-colors duration-300 font-medium"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TestTube className="w-4 h-4" />
                      <span className="text-sm">Laboratorio</span>
                    </div>
                  </Link>

                  <Link
                    to={`/patients/${patientId}/grooming-services/create`}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-500/10 transition-colors duration-300 font-medium"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Scissors className="w-4 h-4" />
                      <span className="text-sm">Peluquería</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="relative z-10 px-4 sm:px-6 pb-20 mt-8 sm:mt-12 xl:mt-16">
          <div className="max-w-6xl mx-auto">
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

                    <div className="space-y-6 xl:space-y-8">
                      {/* Fecha de nacimiento */}
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-danger/10 border-danger/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                        <div className="relative z-10">
                          <p className="text-danger text-sm font-bold uppercase tracking-wide mb-2">
                            Fecha de nacimiento
                          </p>
                          <p className="text-text font-semibold text-lg">
                            {formatDate(patient.birthDate)}
                          </p>
                          <p className="text-text/70 text-sm mt-1">
                            ({calculateAge()} de edad)
                          </p>
                        </div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-neon-pulse opacity-60" />
                      </div>

                      {/* Peso */}
                      {patient.weight && (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-muted/10 border-muted/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                          <div className="relative z-10">
                            <p className="text-danger text-sm font-bold uppercase tracking-wide mb-2">
                              Peso actual
                            </p>
                            <p className="text-text font-semibold text-lg">
                              {patient.weight} kg
                            </p>
                          </div>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-muted rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      )}

                      {/* Raza */}
                      {patient.breed && (
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/10 border-background/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                          <div className="relative z-10">
                            <p className="text-danger text-sm font-bold uppercase tracking-wide mb-2">
                              Raza
                            </p>
                            <p className="text-text font-semibold text-lg">
                              {patient.breed}
                            </p>
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

              {/* Médico Veterinario */}
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
                        Médico Veterinario
                      </h2>
                    </div>

                    {patient.referringVet ? (
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-muted/10 border-muted/20 p-4 xl:p-6 group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
                        <div className="relative z-10">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 rounded-xl bg-muted/20 text-muted flex-shrink-0">
                              <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-text font-semibold text-base sm:text-lg break-words">
                                {patient.referringVet}
                              </p>
                              <p className="text-text/70 text-xs sm:text-sm mt-1">
                                Responsable del paciente
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-muted rounded-full animate-neon-pulse opacity-60" />
                      </div>
                    ) : (
                      <div className="text-center text-text/70">
                        No se ha asignado un médico veterinario
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 xl:top-6 xl:right-6 w-3 h-3 bg-primary rounded-full animate-neon-pulse opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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