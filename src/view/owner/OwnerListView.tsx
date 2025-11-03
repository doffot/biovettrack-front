import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { deleteOwners, getOwners } from "../../api/OwnerAPI";
import BackButton from "../../components/BackButton";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  Plus,
  Search,
  Mail,
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
    onError: (error) => {
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
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-500">Cargando propietarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Fijo */}
      <div className="fixed  lg:mt-0 mt-6 left-0 right-0 lg:top-0 lg:left-64 z-30 bg-gray-900/98 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="px-4 lg:px-10 py-4">
          {/* Línea principal: BackButton + Título + Botón */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <BackButton />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                  Lista de Propietarios
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">
                  Gestiona todos los propietarios registrados
                </p>
              </div>
            </div>

            {/* Botón "Nuevo Propietario" - visible desde tablet */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/owners/new"
                className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium text-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Nuevo Propietario</span>
                <span className="lg:hidden">Nuevo</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-32 sm:h-36 lg:h-40"></div>

      {/* Botón flotante móvil */}
      <Link
        to="/owners/new"
        className="sm:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Content */}
      <div className={` mt-15 lg:mt-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        {filteredOwners.length ? (
          <div className="space-y-3">
            {filteredOwners.map((owner) => (
              <div
                key={owner._id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                      <span className="text-green-500 font-bold text-sm">
                        {owner.name
                          .split(" ")
                          .map((n: string) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/owners/${owner._id}`}
                        className="block hover:text-green-500 transition-colors"
                      >
                        <h3 className="text-white font-semibold text-base truncate mb-1">
                          {owner.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="truncate">{owner.contact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Mobile */}
                  <div className="flex gap-2 pt-3 border-t border-gray-700 mt-3">
                    <Link
                      to={`/owners/${owner._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver</span>
                    </Link>

                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(owner._id, owner.name)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:flex items-center gap-4 p-4">
                  {/* Avatar y info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                      <span className="text-green-500 font-bold text-lg">
                        {owner.name
                          .split(" ")
                          .map((n: string) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/owners/${owner._id}`}
                        className="block hover:text-green-500 transition-colors group"
                      >
                        <h3 className="text-white font-bold text-lg mb-1 truncate">
                          {owner.name}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className="truncate">{owner.contact}</span>
                        </div>
                        {owner.email && (
                          <>
                            <span className="text-gray-600">•</span>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="truncate">{owner.email}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions - Desktop */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/owners/${owner._id}`}
                      className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>

                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(owner._id, owner.name)}
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
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? "Sin resultados" : "No hay propietarios"}
            </h3>

            <p className="text-gray-400 text-sm mb-6">
              {searchTerm
                ? `No encontramos coincidencias para "${searchTerm}"`
                : "Comienza agregando el primer propietario al sistema"}
            </p>

            {!searchTerm && (
              <Link
                to="/owners/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Propietario
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