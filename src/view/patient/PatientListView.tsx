import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOwners } from "../../api/OwnerAPI";
import BackButton from "../../components/BackButton";
import {
  Eye,
  Edit,
  Trash2,
  Heart,
  User,
  Plus,
  Search,
  PawPrint,
  Weight,
  Calendar,
} from "lucide-react";
import FloatingParticles from "../../components/FloatingParticles";
import type { Patient } from "../../types";
import type { Owner } from "../../types";
import { getPatients, deletePatient } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function PatientListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [petToDelete, setPetToDelete] = useState<{id: string, name: string} | null>(null);
  
  const queryClient = useQueryClient();

  // Obtener pacientes
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  // Obtener propietarios
  const { data: owners, isLoading: isLoadingOwners } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  // Mutación para eliminar paciente
  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onError: (error: Error) => {
      toast.error(error.message);
      setPetToDelete(null);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPetToDelete(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para obtener el nombre del propietario
  const getOwnerName = (ownerId: string) => {
    const owner = owners?.find((owner: Owner) => owner._id === ownerId);
    return owner?.name || "Propietario no encontrado";
  };

  // Manejar click de eliminar
  const handleDeleteClick = (petId: string, petName: string) => {
    setPetToDelete({ id: petId, name: petName });
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (petToDelete) {
      removePatient(petToDelete.id);
    }
  };

  // Filtrar pacientes por búsqueda
  const filteredPatients =
    patients?.filter(
      (patient: Patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOwnerName(patient.owner)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  const isLoading = isLoadingPatients || isLoadingOwners;

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden flex flex-col">
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

        <FloatingParticles />

        <div className="relative z-10 flex items-center justify-center flex-1 pt-16">
          <div className="text-center animate-pulse-soft">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-primary text-lg">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden pb-20">
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

        <FloatingParticles />

        {/* Botón fijo de regreso */}
        <div className="fixed top-22 left-7 z-150">
          <BackButton />
        </div>

        {/* Header */}
        <div className="relative z-10 pt-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="tile-entrance">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text title-shine mb-2">
                  Lista de Pacientes
                </h1>
                <p className="text-muted text-sm sm:text-base">
                  Gestiona todos los pacientes y mascotas registradas
                </p>
              </div>

              <div className="tile-entrance" style={{ animationDelay: "0.2s" }}>
                <Link
                  to="/owners"
                  className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/20 text-primary">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-text font-bold text-sm sm:text-base">
                        Nueva Mascota
                      </div>
                      <div className="text-muted text-xs sm:text-sm">
                        Registrar paciente
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div
              className={`relative max-w-md mx-auto lg:mx-0 mb-6 transform transition-all duration-1000 delay-300 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                <div className="relative z-10 flex items-center p-3 sm:p-4">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, especie, raza o propietario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-text placeholder-muted focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {filteredPatients.length ? (
              <div
                className={`transform transition-all duration-1000 delay-500 ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="grid gap-3 sm:gap-4">
                  {filteredPatients.map((patient: Patient, index: number) => (
                    <div
                      key={patient._id}
                      className="tile-entrance relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 hover:shadow-premium-hover hover:scale-102 transition-all duration-300 cursor-pointer group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 p-3">
                        {/* Mobile/Tablet Layout */}
                        <div className="lg:hidden">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-black/20 text-primary flex-shrink-0">
                                <img
                                  src={patient.photo || "/img/default-pet.jpg"}
                                  alt={patient.name}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/patients/${patient._id}`}
                                  className="block group-hover:text-primary transition-colors duration-300"
                                >
                                  <h3 className="text-text font-semibold text-base leading-tight truncate mb-1">
                                    {patient.name}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-2 mb-1">
                                  <PawPrint className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span className="text-muted text-sm truncate">
                                    {patient.species} • {patient.breed}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span className="text-muted text-sm truncate">
                                    {getOwnerName(patient.owner)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions - Mobile/Tablet */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Link
                                to={`/patients/${patient._id}`}
                                className="p-2 rounded-lg bg-black/20 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                                title="Ver"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              <Link
                                to={`/patients/edit/${patient._id}`}
                                className="p-2 rounded-lg bg-black/20 text-muted hover:bg-muted/20 hover:scale-110 transition-all duration-300"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDeleteClick(patient._id, patient.name)}
                                disabled={isDeleting}
                                className="p-2 rounded-lg bg-black/20 text-danger hover:bg-danger/20 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Additional info - Mobile/Tablet */}
                          <div className="flex items-center gap-4 text-xs text-muted bg-black/10 rounded-lg p-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {/* <span>{patient.age} años</span> */}
                            </div>
                            <div className="flex items-center gap-1">
                              <Weight className="w-3 h-3" />
                              <span>{patient.weight} kg</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>♂♀</span>
                              <span>{patient.sex}</span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout - Solo para pantallas grandes */}
                        <div className="hidden lg:flex items-center justify-between gap-4">
                          {/* Info del paciente */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="p-3 rounded-xl bg-black/20 text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                              <img
                                src={patient.photo || "/img/default-pet.jpg"}
                                alt={patient.name}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/patients/${patient._id}`}
                                className="block group-hover:text-primary transition-colors duration-300"
                              >
                                <h3 className="text-text font-bold text-lg mb-1 truncate">
                                  {patient.name}
                                </h3>
                              </Link>

                              <div className="flex items-center gap-4 text-muted text-sm">
                                <div className="flex items-center gap-1">
                                  <PawPrint className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {patient.species} • {patient.breed}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {getOwnerName(patient.owner)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {/* <span>{patient.age} años</span> */}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Weight className="w-3 h-3" />
                                  <span>{patient.weight} kg</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>♂♀</span>
                                  <span>{patient.sex}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions - Desktop */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to={`/patients/${patient._id}`}
                              className="p-3 rounded-xl bg-black/20 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>

                            <Link
                              to={`/patients/edit/${patient._id}`}
                              className="p-3 rounded-xl bg-black/20 text-muted hover:bg-muted/20 hover:scale-110 transition-all duration-300"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(patient._id, patient.name)}
                              disabled={isDeleting}
                              className="p-3 rounded-xl bg-black/20 text-danger hover:bg-danger/20 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Decoración de esquina */}
                      <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />

                      {/* Líneas decorativas */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`transform transition-all duration-1000 delay-500 ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="text-center py-12">
                  <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-6 sm:p-8 max-w-md mx-auto shadow-premium">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                    <div className="relative z-10">
                      <div className="p-4 sm:p-6 rounded-xl bg-black/20 text-muted mx-auto mb-6 w-fit">
                        <Heart className="w-10 h-10 sm:w-12 sm:h-12 animate-float" />
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-text mb-3 title-shine">
                        {searchTerm ? "Sin resultados" : "No hay pacientes"}
                      </h3>

                      <p className="text-muted text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                        {searchTerm
                          ? `No encontramos coincidencias para "${searchTerm}"`
                          : "Comienza registrando el primer paciente al sistema"}
                      </p>

                      {!searchTerm && (
                        <Link
                          to="/patients/new"
                          className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                          <div className="relative z-10 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black/20 text-primary">
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                            </div>
                            <div className="text-left">
                              <div className="text-text font-bold text-sm sm:text-base">
                                Registrar Mascota
                              </div>
                              <div className="text-muted text-xs sm:text-sm">
                                Agregar nuevo paciente
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Decoración de esquina */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />

                    {/* Líneas decorativas */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={!!petToDelete}
        onClose={() => setPetToDelete(null)}
        onConfirm={confirmDelete}
        petName={petToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  );
}