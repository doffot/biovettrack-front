import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOwners } from "../../api/OwnerAPI";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Plus,
  Search,
  PawPrint,
  MoreVertical,
  Calendar,
  Weight,
  Venus,
  ArrowLeft
} from "lucide-react";
import type { Patient } from "../../types";
import type { Owner } from "../../types";
import { getPatients, deletePatient } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function PatientListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [petToDelete, setPetToDelete] = useState<{ id: string; name: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const { data: owners, isLoading: isLoadingOwners } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

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

  const getOwnerName = (ownerId: string): string => {
    const owner = owners?.find((o: Owner) => o._id === ownerId);
    return owner?.name || "Propietario no encontrado";
  };

  const handleDeleteClick = (petId: string, petName: string) => {
    setPetToDelete({ id: petId, name: petName });
    setActiveDropdown(null);
  };

  const confirmDelete = () => {
    if (petToDelete) {
      removePatient(petToDelete.id);
    }
  };

  const toggleDropdown = (patientId: string) => {
    setActiveDropdown(activeDropdown === patientId ? null : patientId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const filteredPatients =
    patients?.filter((patient: Patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOwnerName(patient.owner).toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const isLoading = isLoadingPatients || isLoadingOwners;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Fijo Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          {/* Línea principal: Título + Botón */}
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <PawPrint className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Lista de Pacientes
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Gestiona todos los pacientes y mascotas registradas
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-vet-text">{patients?.length || 0}</p>
                <p className="text-vet-muted text-sm">Total registrados</p>
              </div>
            </div>

            {/* Botón "Nueva Mascota" */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/owners"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Mascota</span>
              </Link>
            </div>
          </div>

          {/* Search Bar Mejorada */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-vet-muted" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, especie o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-vet-light border border-vet-muted/30 rounded-xl text-vet-text placeholder-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/50 focus:border-vet-primary transition-colors"
            />
          </div>

          {/* Mensaje informativo */}
          <p className="text-xs text-vet-muted mt-2">
            🐾 Primero selecciona un dueño para agregar su mascota
          </p>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-55 md:h-50 lg:h-45"></div>

      {/* Botón flotante móvil */}
      <Link
        to="/owners"
        className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-vet-primary hover:bg-vet-secondary text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Content Mejorado con Cards Pro */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        {filteredPatients.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredPatients.map((patient, index) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-vet-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Card Content */}
                <div className="p-6">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center shadow-md">
                          {patient.photo ? (
                            <img
                              src={patient.photo}
                              alt={patient.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <PawPrint className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                          <PawPrint className="w-2.5 h-2.5 text-vet-primary" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/patients/${patient._id}`}
                          className="block hover:text-vet-primary transition-colors"
                        >
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-vet-primary transition-colors truncate">
                            {patient.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {patient.species} • {patient.breed}
                        </p>
                      </div>
                    </div>
                    
                    {/* Dropdown para desktop */}
                    <div className="relative hidden sm:block">
                      <button
                        onClick={() => toggleDropdown(patient._id)}
                        className="p-2 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-muted transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === patient._id && (
                        <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                          <Link
                            to={`/patients/${patient._id}`}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-vet-light text-gray-700 transition-colors first:rounded-t-xl text-sm"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Link>
                          
                          <Link
                            to={`/patients/edit/${patient._id}`}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-blue-600 transition-colors text-sm"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteClick(patient._id, patient.name)}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-600 transition-colors w-full text-left last:rounded-b-xl text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del paciente */}
                  <div className="space-y-3 mb-6">
                    {/* Propietario */}
                    <div className="flex items-center gap-3 p-3 bg-vet-light rounded-lg hover:bg-vet-primary/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-vet-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getOwnerName(patient.owner)}
                        </p>
                        <p className="text-xs text-gray-500">Propietario</p>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-500 mb-1" />
                        <p className="text-xs font-medium text-gray-900">{formatDate(patient.birthDate)}</p>
                        <p className="text-xs text-gray-500">Nacimiento</p>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Weight className="w-4 h-4 text-gray-500 mb-1" />
                        <p className="text-xs font-medium text-gray-900">{patient.weight} kg</p>
                        <p className="text-xs text-gray-500">Peso</p>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Venus className="w-4 h-4 text-gray-500 mb-1" />
                        <p className="text-xs font-medium text-gray-900">
                          {patient.sex === "Macho" ? "Macho" : "Hembra"}
                        </p>
                        <p className="text-xs text-gray-500">Sexo</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones para móvil */}
                  <div className="sm:hidden flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-vet-light hover:bg-vet-primary hover:text-white text-vet-text font-medium text-sm transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver</span>
                    </Link>

                    <Link
                      to={`/patients/edit/${patient._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-medium text-sm transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(patient._id, patient.name)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium text-sm transition-all duration-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-vet-muted/20 p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vet-light flex items-center justify-center">
              <PawPrint className="w-10 h-10 text-vet-muted" />
            </div>

            <h3 className="text-2xl font-bold text-vet-text mb-3">
              {searchTerm ? "No se encontraron resultados" : "No hay pacientes registrados"}
            </h3>

            <p className="text-vet-muted mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No encontramos coincidencias para "${searchTerm}". Intenta con otros términos.`
                : "Para registrar una mascota, primero debes crear o seleccionar un dueño."}
            </p>

            {!searchTerm && (
              <Link
                to="/owners"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                Ir a Dueños
              </Link>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!petToDelete}
        onClose={() => setPetToDelete(null)}
        onConfirm={confirmDelete}
        petName={petToDelete?.name || ''}
        isDeleting={isDeleting}
      />

      {/* Overlay para dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-30 sm:hidden"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}