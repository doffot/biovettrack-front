import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { deleteOwners, getOwners } from "../../api/OwnerAPI";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  Plus,
  Search,
  Mail,
  Users,
  ArrowLeft
} from "lucide-react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function OwnerListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const queryClient = useQueryClient();

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: deleteOwners,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setOwnerToDelete(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = (ownerId: string, ownerName: string) => {
    setOwnerToDelete({ id: ownerId, name: ownerName });
  };

  const confirmDelete = () => {
    if (ownerToDelete) {
      removeOwner(ownerToDelete.id);
    }
  };

  const filteredOwners =
    data?.filter(
      (owner) =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.contact.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando propietarios...</p>
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
          {/* Línea principal: Título + Estadísticas + Botón */}
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
                    <Users className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Lista de Propietarios
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Gestiona todos los propietarios registrados en el sistema
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-vet-text">{data?.length || 0}</p>
                <p className="text-vet-muted text-sm">Total registrados</p>
              </div>
            </div>

            {/* Botón "Nuevo Propietario" */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/owners/new"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Propietario</span>
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
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-vet-light border border-vet-muted/30 rounded-xl text-vet-text placeholder-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/50 focus:border-vet-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-55 md:h-45 lg:h-55"></div>

      {/* Botón flotante móvil mejorado */}
      <Link
        to="/owners/new"
        className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-vet-primary hover:bg-vet-secondary text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Content Mejorado con Cards Pro */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        {filteredOwners.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredOwners.map((owner, index) => (
              <div
                key={owner._id}
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
                          <span className="text-white font-bold text-sm">
                            {owner.name
                              .split(" ")
                              .map((n: string) => n.charAt(0))
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-vet-primary" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/owners/${owner._id}`}
                          className="block hover:text-vet-primary transition-colors"
                        >
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-vet-primary transition-colors truncate">
                            {owner.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Propietario</p>
                      </div>
                    </div>
                    
                    {/* Badge de estado */}
                    <div className="px-2 py-1 bg-green-50 rounded-full border border-green-200">
                      <span className="text-xs font-medium text-green-700">Activo</span>
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-vet-light/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-vet-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{owner.contact}</p>
                        <p className="text-xs text-gray-500">Teléfono</p>
                      </div>
                    </div>

                    {owner.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-vet-light/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{owner.email}</p>
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/owners/${owner._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-vet-light hover:bg-vet-primary hover:text-white text-vet-text font-medium text-sm transition-all duration-200 group/action"
                    >
                      <Eye className="w-4 h-4 group-hover/action:text-white" />
                      <span>Ver</span>
                    </Link>

                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-medium text-sm transition-all duration-200 group/action"
                    >
                      <Edit className="w-4 h-4 group-hover/action:text-white" />
                      <span>Editar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(owner._id, owner.name)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium text-sm transition-all duration-200 disabled:opacity-50 group/action"
                    >
                      <Trash2 className="w-4 h-4 group-hover/action:text-white" />
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
              <User className="w-10 h-10 text-vet-muted" />
            </div>

            <h3 className="text-2xl font-bold text-vet-text mb-3">
              {searchTerm ? "No se encontraron resultados" : "No hay propietarios registrados"}
            </h3>

            <p className="text-vet-muted mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No encontramos coincidencias para "${searchTerm}". Intenta con otros términos.`
                : "Comienza agregando el primer propietario al sistema para gestionar sus mascotas."}
            </p>

            {!searchTerm && (
              <Link
                to="/owners/new"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Propietario
              </Link>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!ownerToDelete}
        onClose={() => setOwnerToDelete(null)}
        onConfirm={confirmDelete}
        petName={ownerToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  );
}