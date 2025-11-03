import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  PawPrint,
} from "lucide-react";
import { getOwnersById, deleteOwners } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
import PatientListView from "./PatientListOwnerView";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function OwnerDetailView() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const { ownerId } = useParams<{ ownerId?: string }>();
  const { data: owner, isLoading } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOwners(ownerId!),
    onError: (error) => {
      toast.error(error.message);
      setShowDeleteModal(false);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowDeleteModal(false);
      navigate("/owners");
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-500">Cargando propietario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-gray-800 p-6 rounded-xl border border-red-500/30 text-center max-w-md mx-auto">
            <User className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Propietario no encontrado</h2>
            <p className="text-gray-400">El propietario que buscas no existe o ha sido eliminado.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Función auxiliar para evitar el error de 'any'
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Header con espaciado superior */}
      <div className="mt-10 lg:mt-0 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <span className="hidden sm:inline text-gray-400 text-sm">Información completa del propietario</span>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Columna izquierda: Información del Propietario */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0 bg-gray-80 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            {/* Avatar y Nombre */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                <span className="text-green-500 font-bold text-base sm:text-lg">
                  {owner.name ? getInitials(owner.name) : "N/A"}
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{owner.name}</h2>
                <p className="text-gray-400 text-xs sm:text-sm">Propietario</p>
              </div>
            </div>

            {/* Info de contacto */}
            <div className="space-y-4">
              {owner.contact && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30">
                  <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Teléfono</p>
                    <p className="text-white font-medium truncate">{owner.contact}</p>
                  </div>
                  <a
                    href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded text-xs font-bold transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              )}

              {owner.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-white font-medium truncate">{owner.email}</p>
                  </div>
                  <a
                    href={`mailto:${owner.email}`}
                    className="flex-shrink-0 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs font-bold transition-colors"
                  >
                    Enviar
                  </a>
                </div>
              )}

              {owner.address && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Dirección</p>
                    <p className="text-white font-medium">{owner.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-700/30">
                  <p className="text-xs text-gray-400">Registrado</p>
                  <p className="text-white text-sm">
                    {owner.createdAt
                      ? new Date(owner.createdAt).toLocaleDateString("es-ES")
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-700/30">
                  <p className="text-xs text-gray-400">Actualizado</p>
                  <p className="text-white text-sm">
                    {owner.updatedAt
                      ? new Date(owner.updatedAt).toLocaleDateString("es-ES")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex gap-2">
              <Link
                to={`/owners/${owner._id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-sm disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>

          {/* Columna derecha: Mascotas y Acciones */}
          <div className="flex-1 bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            {/* Header del panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <PawPrint className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Mascotas de {owner.name.split(" ")[0]}</h2>
                  <p className="text-sm text-gray-400">Gestiona las mascotas y citas médicas</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/owners/${owner._id}/patients/new`}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-bold text-sm transition-colors"
                >
                  <PawPrint className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Mascota</span>
                  <span className="sm:hidden">Nueva</span>
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-sm transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Programar Cita</span>
                  <span className="sm:hidden">Cita</span>
                </button>
              </div>
            </div>

            {/* Lista de mascotas */}
            <div>
              <PatientListView ownerId={ownerId!} ownerName={owner.name} />
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => removeOwner()}
        petName={owner?.name || "este propietario"}
        isDeleting={isDeleting}
      />
    </>
  );
}