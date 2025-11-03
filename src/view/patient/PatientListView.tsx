import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOwners } from "../../api/OwnerAPI";
import BackButton from "../../components/BackButton";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 font-medium">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Fijo */}
      <div className="fixed mt-10 lg:mt-0 top-16 left-0 right-0 lg:top-0 lg:left-64 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <BackButton />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Lista de Pacientes</h1>
                <p className="text-gray-400 text-sm">Gestiona todos los pacientes y mascotas registradas</p>
              </div>
            </div>

          {/* Botón "Nueva Mascota" - visible desde tablet */}
<div className="hidden sm:block flex-shrink-0">
  <Link
    to="/owners"
    className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium text-sm transition-colors whitespace-nowrap"
  >
    <Plus className="w-4 h-4" />
    <span className="hidden md:inline">Nueva Mascota</span>
    <span className="md:hidden">Nueva</span>
  </Link>
</div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, especie o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Mensaje informativo */}
          <p className="text-xs text-gray-500 mt-2 hidden sm:block">
            🐾 Primero selecciona un dueño para agregar su mascota
          </p>
        </div>
      </div>

      {/* Espacio para el header fijo */}
      <div className="h-40 sm:h-44"></div>

      {/* Botón flotante móvil */}
<Link
  to="/owners"
  className="sm:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-95 transition-all"
>
  <Plus className="w-6 h-6" />
</Link>

      {/* Content */}
      <div className={`mt-10 lg:mt-0 px-4 lg:px-8 max-w-7xl mx-auto pb-12 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        {filteredPatients.length ? (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group"
              >
                {/* Mobile Layout - CORREGIDO */}
                <div className="sm:hidden p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10 overflow-hidden flex-shrink-0">
                      {patient.photo ? (
                        <img
                          src={patient.photo}
                          alt={patient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-6 h-6 text-green-400" />
                      )}
                    </div>

                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/patients/${patient._id}`}
                        className="block hover:text-green-400 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {patient.name}
                        </h3>
                      </Link>
                      
                      {/* Especie y raza */}
                      <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                        <PawPrint className="w-4 h-4 text-green-400" />
                        <span className="font-medium">{patient.species}</span>
                        <span className="text-gray-500">•</span>
                        <span>{patient.breed}</span>
                      </div>

                      {/* Propietario */}
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{getOwnerName(patient.owner)}</span>
                      </div>

                      {/* Información adicional en fila */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(patient.birthDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Weight className="w-3.5 h-3.5" />
                          <span>{patient.weight} kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Venus className="w-3.5 h-3.5" />
                          <span>{patient.sex === "Macho" ? "Macho" : "Hembra"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown para móvil */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(patient._id)}
                        className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === patient._id && (
                        <div className="absolute right-0 top-10 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10">
                          <Link
                            to={`/patients/${patient._id}`}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700/50 text-gray-300 transition-colors first:rounded-t-xl text-sm"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Link>
                          
                          <Link
                            to={`/patients/edit/${patient._id}`}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700/50 text-gray-300 transition-colors text-sm"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteClick(patient._id, patient.name)}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-500/20 text-red-400 transition-colors w-full text-left last:rounded-b-xl text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:flex items-center gap-4 p-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10 overflow-hidden">
                      {patient.photo ? (
                        <img
                          src={patient.photo}
                          alt={patient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-8 h-8 text-green-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-gray-900 flex items-center justify-center">
                      <PawPrint className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="block hover:text-green-400 transition-colors group"
                    >
                      <h3 className="text-xl font-semibold text-white mb-2 truncate group-hover:text-green-400">
                        {patient.name}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                          <PawPrint className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="font-medium">{patient.species} • {patient.breed}</span>
                      </div>
                      
                      <div className="hidden lg:block w-px h-4 bg-gray-600"></div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="truncate">{getOwnerName(patient.owner)}</span>
                      </div>

                      <div className="hidden lg:block w-px h-4 bg-gray-600"></div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(patient.birthDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Weight className="w-4 h-4 text-gray-400" />
                          <span>{patient.weight} kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Venus className="w-4 h-4 text-gray-400" />
                          <span>{patient.sex === "Macho" ? "Macho" : "Hembra"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones - Desktop */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="p-3 rounded-xl bg-gray-700/50 hover:bg-green-500/20 text-gray-300 hover:text-green-400 border border-gray-600 hover:border-green-500/30 transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>

                    <Link
                      to={`/patients/edit/${patient._id}`}
                      className="p-3 rounded-xl bg-gray-700/50 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 border border-gray-600 hover:border-blue-500/30 transition-all duration-200"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(patient._id, patient.name)}
                      disabled={isDeleting}
                      className="p-3 rounded-xl bg-gray-700/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-600 hover:border-red-500/30 transition-all duration-200 disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center shadow-2xl">
                <PawPrint className="w-10 h-10 text-gray-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm ? "Sin resultados" : "No hay pacientes"}
              </h3>

              <p className="text-gray-400 mb-8 leading-relaxed">
                {searchTerm
                  ? `No encontramos coincidencias para "${searchTerm}". Intenta con otros términos.`
                  : "Para registrar una mascota, primero debes crear o seleccionar un dueño."}
              </p>

              {!searchTerm && (
                <Link
                  to="/owners"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Ir a Dueños
                </Link>
              )}
            </div>
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