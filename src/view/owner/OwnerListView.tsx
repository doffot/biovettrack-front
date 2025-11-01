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
} from "lucide-react";
import { toast } from "../../components/Toast";
import FloatingParticles from "../../components/FloatingParticles";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// Componente: Partículas flotantes 
<FloatingParticles/>

export default function OwnerListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
   const [ownerToDelete, setOwnerToDelete] = useState<{id: string, name: string} | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const queryclient = useQueryClient();

// borrar owner
  const { mutate:removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: deleteOwners,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
      queryclient.invalidateQueries({ queryKey: ["owners"] });
      setOwnerToDelete(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

   // Manejar click de eliminar
  const handleDeleteClick = (ownerId: string, ownerName: string) => {
    setOwnerToDelete({ id: ownerId, name: ownerName });
  };

  // Confirmar eliminación
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
            <p className="text-primary text-lg">Cargando propietarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
      {/* Botón fijo de regreso  */}

      <div className="fixed top-22 left-7  z-150 ">
        <BackButton />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="tile-entrance">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text title-shine mb-2">
                Lista de Propietarios
              </h1>
              <p className="text-muted text-sm sm:text-base">
                Gestiona todos los propietarios registrados
              </p>
            </div>

            <div className="tile-entrance" style={{ animationDelay: "0.2s" }}>
              <Link
                to="/owners/new"
                className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/20 text-primary">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-text font-bold text-sm sm:text-base">
                      Nuevo Propietario
                    </div>
                    <div className="text-muted text-xs sm:text-sm">
                      Agregar propietario
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
                  placeholder="Buscar por nombre o contacto..."
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
          {filteredOwners.length ? (
            <div
              className={`transform transition-all duration-1000 delay-500 ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="grid gap-3 sm:gap-4">
                {filteredOwners.map((owner, index) => (
                  <div
                    key={owner._id}
                    className="tile-entrance relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 hover:shadow-premium-hover hover:scale-102 transition-all duration-300 cursor-pointer group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 p-3">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-black/20 text-primary flex-shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/owners/${owner._id}`}
                                className="block group-hover:text-primary transition-colors duration-300"
                              >
                                <h3 className="text-text font-semibold text-base leading-tight truncate mb-1">
                                  {owner.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                <span className="text-muted text-sm truncate">
                                  {owner.contact}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions - Mobile */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Link
                              to={`/owners/${owner._id}`}
                              className="p-2 rounded-lg bg-black/20 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                              title="Ver"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/owners/${owner._id}/edit`}
                              className="p-2 rounded-lg bg-black/20 text-muted hover:bg-muted/20 hover:scale-110 transition-all duration-300"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(owner._id, owner.name)}
                                disabled={isDeleting}
                              className="p-2 rounded-lg bg-black/20 text-danger hover:bg-danger/20 hover:scale-110 transition-all duration-300"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop/Tablet Layout */}
                      <div className="hidden sm:flex items-center justify-between gap-4">
                        {/* Info del propietario */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-3 rounded-xl bg-black/20 text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <User className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/owners/${owner._id}`}
                              className="block group-hover:text-primary transition-colors duration-300"
                            >
                              <h3 className="text-text font-bold text-lg mb-1 truncate">
                                {owner.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 text-muted">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {owner.contact}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions - Desktop */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to={`/owners/${owner._id}`}
                            className="p-3 rounded-xl bg-black/20 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>

                          <Link
                            to={`/owners/${owner._id}/edit`}
                            className="p-3 rounded-xl bg-black/20 text-muted hover:bg-muted/20 hover:scale-110 transition-all duration-300"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>

                          <button
                            type="button"
                             onClick={() => handleDeleteClick(owner._id, owner.name)}
                                disabled={isDeleting}
                            className="p-3 rounded-xl bg-black/20 text-danger hover:bg-danger/20 hover:scale-110 transition-all duration-300"
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
                      <User className="w-10 h-10 sm:w-12 sm:h-12 animate-float" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-text mb-3 title-shine">
                      {searchTerm ? "Sin resultados" : "No hay propietarios"}
                    </h3>

                    <p className="text-muted text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                      {searchTerm
                        ? `No encontramos coincidencias para "${searchTerm}"`
                        : "Comienza agregando el primer propietario al sistema"}
                    </p>

                    {!searchTerm && (
                      <Link
                        to="/owners/new"
                        className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                        <div className="relative z-10 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black/20 text-primary">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-text font-bold text-sm sm:text-base">
                              Crear Propietario
                            </div>
                            <div className="text-muted text-xs sm:text-sm">
                              Agregar nuevo propietario
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
      <DeleteConfirmationModal
              isOpen={!!ownerToDelete}
              onClose={() => setOwnerToDelete(null)}
              onConfirm={confirmDelete}
              petName={ownerToDelete?.name || ''}
              isDeleting={isDeleting}
            />
    </div>
  );
}