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

  const queryClient = useQueryClient();

  // ✅ Corrección: usar 'data' en lugar de desestructurar directamente 'patients'
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
  };

  const confirmDelete = () => {
    if (petToDelete) {
      removePatient(petToDelete.id);
    }
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
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-500">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mt-10 lg:mt-30 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="px-4 lg:px-0 mb-6">
          {/* Línea principal: BackButton + Título + Botón a la derecha */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <BackButton />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Lista de Pacientes</h1>
                <p className="text-gray-400 text-sm mt-1">Gestiona todos los pacientes y mascotas registradas</p>
              </div>
            </div>

            {/* Botón "Nueva Mascota" en la derecha (solo desktop) */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/owners"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Mascota
              </Link>
            </div>
          </div>

          {/* Mensaje informativo debajo */}
          <p className="text-xs text-gray-500 hidden sm:block mt-2">
            🐾 Primero selecciona un dueño para agregar su mascota
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 lg:px-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, especie o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Botón flotante móvil */}
      <Link
        to="/owners"
        className="sm:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Content */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        {filteredPatients.length ? (
          <div className="space-y-3 mx-4 lg:mx-0">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
              >
                {/* Mobile */}
                <div className="sm:hidden p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={patient.photo || "/img/default-pet.jpg"}
                        alt={patient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/patients/${patient._id}`} className="block hover:text-green-500">
                        <h3 className="text-white font-semibold text-base truncate mb-1">{patient.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <PawPrint className="w-3.5 h-3.5" />
                        <span className="truncate">{patient.species} • {patient.breed}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{getOwnerName(patient.owner)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="flex gap-3 text-xs text-gray-400 mt-2">
                    <span>🎂 {new Date(patient.birthDate).toLocaleDateString("es-ES")}</span>
                    <span>⚖️ {patient.weight} kg</span>
                    <span>{patient.sex === "Macho" ? "♂" : "♀"}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-3 border-t border-gray-700 mt-3">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Ver</span>
                    </Link>
                    <Link
                      to={`/patients/edit/${patient._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(patient._id, patient.name)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden sm:flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={patient.photo || "/img/default-pet.jpg"}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/patients/${patient._id}`} className="block hover:text-green-500">
                      <h3 className="text-white font-bold text-lg mb-1 truncate">{patient.name}</h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
                      <span>{patient.species} • {patient.breed}</span>
                      <span>•</span>
                      <span>{getOwnerName(patient.owner)}</span>
                      <span>•</span>
                      <span>🎂 {new Date(patient.birthDate).toLocaleDateString("es-ES")}</span>
                      <span>•</span>
                      <span>⚖️ {patient.weight} kg</span>
                      <span>•</span>
                      <span>{patient.sex === "Macho" ? "♂ Macho" : "♀ Hembra"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                      title="Ver"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/patients/edit/${patient._id}`}
                      className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(patient._id, patient.name)}
                      disabled={isDeleting}
                      className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50"
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
          <div className="mx-4 lg:mx-0">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center max-w-md mx-auto">
              <PawPrint className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm ? "Sin resultados" : "No hay pacientes"}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {searchTerm
                  ? `No se encontraron coincidencias para "${searchTerm}"`
                  : "Para registrar una mascota, primero debes crear o seleccionar un dueño."}
              </p>
              {!searchTerm && (
                <Link
                  to="/owners"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
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
    </>
  );
}