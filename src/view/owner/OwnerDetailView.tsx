import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  PawPrint,
  ArrowLeft,
  Users
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

  // ✅ Función auxiliar para evitar el error de 'any'
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando propietario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md mx-auto shadow-sm">
            <User className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Propietario no encontrado</h2>
            <p className="text-gray-600 mb-6">El propietario que buscas no existe o ha sido eliminado.</p>
            <Link
              to="/owners"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to="/owners"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver a la lista"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    {owner.name}
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Información completa del propietario
                </p>
              </div>
            </div>

            {/* Botón Editar */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to={`/owners/${owner._id}/edit`}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Edit className="w-5 h-5" />
                <span>Editar información</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-40"></div>

      {/* Contenedor principal */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Columna izquierda: Información del Propietario */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0 space-y-6">
            {/* Tarjeta de información */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              {/* Avatar y Nombre */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-vet-primary/10 flex items-center justify-center border-2 border-vet-primary/20">
                  <span className="text-vet-primary font-bold text-lg">
                    {owner.name ? getInitials(owner.name) : "N/A"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{owner.name}</h2>
                  <p className="text-gray-500 text-sm">Propietario</p>
                </div>
              </div>

              {/* Info de contacto */}
              <div className="space-y-4">
                {owner.contact && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-vet-light border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-vet-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-gray-900 font-medium truncate">{owner.contact}</p>
                    </div>
                    <a
                      href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-lg text-xs font-bold transition-all duration-200"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}

                {owner.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-vet-light border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium truncate">{owner.email}</p>
                    </div>
                    <a
                      href={`mailto:${owner.email}`}
                      className="flex-shrink-0 px-3 py-1.5 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-lg text-xs font-bold transition-all duration-200"
                    >
                      Enviar
                    </a>
                  </div>
                )}

                {owner.address && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-vet-light border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="text-gray-900 font-medium">{owner.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Registrado</p>
                    <p className="text-gray-900 text-sm font-medium">
                      {owner.createdAt
                        ? new Date(owner.createdAt).toLocaleDateString("es-ES")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Actualizado</p>
                    <p className="text-gray-900 text-sm font-medium">
                      {owner.updatedAt
                        ? new Date(owner.updatedAt).toLocaleDateString("es-ES")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción para móvil */}
              <div className="sm:hidden flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <Link
                  to={`/owners/${owner._id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-vet-light hover:bg-vet-primary hover:text-white text-vet-text font-medium transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium transition-all duration-200 disabled:opacity-50"
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

            {/* Botón Eliminar para desktop */}
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Eliminando..." : "Eliminar Propietario"}
              </button>
            </div>
          </div>

          {/* Columna derecha: Mascotas y Acciones */}
          <div className="flex-1">
            {/* Panel de mascotas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              {/* Header del panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <PawPrint className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mascotas de {owner.name.split(" ")[0]}</h2>
                    <p className="text-sm text-gray-500">Gestiona las mascotas y citas médicas</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    to={`/owners/${owner._id}/patients/new`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white font-medium transition-all duration-200"
                  >
                    <PawPrint className="w-4 h-4" />
                    <span>Nueva Mascota</span>
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-medium transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Programar Cita</span>
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