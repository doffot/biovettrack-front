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
  Clock,
  PawPrint,
} from "lucide-react";
import { getOwnersById, deleteOwners } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
import FloatingParticles from "../../components/FloatingParticles";
import PatientListView from "./PatientListOwnerView";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function OwnerDetailView() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const { ownerId } = useParams();
  const { data: owner, isLoading } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOwners(ownerId!), // Asegúrate de pasar el ID correctamente
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
            <p className="text-primary text-lg">Cargando propietario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!owner) {
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

        <FloatingParticles />

        <div className="relative z-10 flex items-center justify-center flex-1 pt-16">
          <div className="text-center">
            <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-danger/10 border-danger/30 p-8 max-w-md mx-auto shadow-premium">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10">
                <div className="p-6 rounded-xl bg-black/20 text-danger mx-auto mb-6 w-fit">
                  <User className="w-12 h-12" />
                </div>

                <h2 className="text-2xl font-bold text-text mb-3 title-shine">
                  Propietario no encontrado
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  El propietario que buscas no existe o ha sido eliminado
                </p>
              </div>

              <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-neon-pulse opacity-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-dark overflow-hidden">
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

      {/* Glow effects - Mejorados para desktop */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 xl:w-[500px] xl:h-[500px] bg-primary/5 xl:bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 xl:w-[400px] xl:h-[400px] bg-primary/3 xl:bg-primary/6 rounded-full blur-3xl" />

      <FloatingParticles />

      {/* Botón regresar */}
      <div className="fixed top-22 left-7 z-150">
        <BackButton />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mt-8 mb-8 transform transition-all duration-1000 delay-200">
            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/30 px-6 py-4 inline-block xl:min-w-[400px] xl:max-w-[480px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10">
                <div className="p-3 rounded-xl bg-black/20 text-primary mx-auto mb-3 w-fit">
                  <User className="w-8 h-8 xl:w-10 xl:h-10" />
                </div>
                <h1 className="text-3xl xl:text-3xl font-bold text-text title-shine mb-1">
                  {owner.name}
                </h1>
                <p className="text-muted text-sm xl:text-sm">
                  Información completa del propietario
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Layout mejorado para desktop */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Layout responsive mejorado */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-5 gap-6">
            {/* Información del Propietario - Más compacto en XL */}
            <div
              className={`xl:col-span-2 transform transition-all duration-1000 delay-400 ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 shadow-premium p-6 xl:p-6 h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Avatar - Más compacto */}
                  <div className="flex items-center justify-center mb-4 xl:mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 xl:w-20 xl:h-20 bg-gradient-radial-center rounded-full flex items-center justify-center border-2 xl:border-3 border-primary/30">
                        <span className="text-primary font-bold text-2xl xl:text-2xl">
                          {owner.name
                            .split(" ")
                            .map((n: string) => n.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-neon-pulse" />
                    </div>
                  </div>

                  {/* Información de contacto - Grid compacto */}
                  <div className="space-y-3 xl:space-y-4">
                    {/* Teléfono */}
                    <div className="tile-entrance">
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/20 p-3 xl:p-4 group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />

                        <div className="relative z-10 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black/20 text-primary">
                            <Phone className="w-4 h-4 xl:w-5 xl:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-primary text-xs font-bold uppercase tracking-wide mb-1">
                              Teléfono
                            </p>
                            <p className="text-text font-semibold truncate text-sm">
                              {owner.contact}
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/${owner.contact.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-200 text-xs font-bold"
                          >
                            WhatsApp
                          </a>
                        </div>

                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-neon-pulse opacity-60" />
                      </div>
                    </div>

                    {/* Email */}
                    {owner.email && (
                      <div
                        className="tile-entrance"
                        style={{ animationDelay: "0.1s" }}
                      >
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-muted/10 border-muted/20 p-3 xl:p-4 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />

                          <div className="relative z-10 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black/20 text-muted">
                              <Mail className="w-4 h-4 xl:w-5 xl:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-primary text-xs font-bold uppercase tracking-wide mb-1">
                                Email
                              </p>
                              <p className="text-text font-semibold truncate text-sm">
                                {owner.email}
                              </p>
                            </div>
                            <a
                              href={`mailto:${owner.email}`}
                              className="px-3 py-1 bg-muted/20 hover:bg-muted/30 text-muted rounded-lg transition-all duration-200 text-xs font-bold"
                            >
                              Enviar
                            </a>
                          </div>

                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-muted rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      </div>
                    )}

                    {/* Dirección */}
                    {owner.address && (
                      <div
                        className="tile-entrance"
                        style={{ animationDelay: "0.2s" }}
                      >
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-text/10 border-text/20 p-3 xl:p-4 group hover:scale-102 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />

                          <div className="relative z-10 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-black/20 text-text">
                              <MapPin className="w-4 h-4 xl:w-5 xl:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-primary text-xs font-bold uppercase tracking-wide mb-1">
                                Dirección
                              </p>
                              <p className="text-text font-semibold leading-relaxed text-sm">
                                {owner.address}
                              </p>
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-text rounded-full animate-neon-pulse opacity-60" />
                        </div>
                      </div>
                    )}

                    {/* Fechas - Grid 2 columnas más compacto */}
                    <div
                      className="grid grid-cols-2 gap-3 tile-entrance"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/60 border-primary/20 p-3 group">
                        <div className="relative z-10 flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-black/20 text-primary">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-primary text-xs font-bold uppercase">
                              Registrado
                            </p>
                            <p className="text-text text-xs font-medium">
                              {owner.createdAt
                                ? new Date(owner.createdAt).toLocaleDateString(
                                    "es-ES"
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 w-1 h-1 bg-primary rounded-full animate-neon-pulse opacity-60" />
                      </div>

                      <div className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/60 border-muted/20 p-3 group">
                        <div className="relative z-10 flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-black/20 text-muted">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-primary text-xs font-bold uppercase">
                              Actualizado
                            </p>
                            <p className="text-text text-xs font-medium">
                              {owner.updatedAt
                                ? new Date(owner.updatedAt).toLocaleDateString(
                                    "es-ES"
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 w-1 h-1 bg-muted rounded-full animate-neon-pulse opacity-60" />
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción - Más compactos */}
                  <div
                    className="flex gap-3 mt-4 xl:mt-6 pt-4 border-t border-muted/20 tile-entrance"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-muted/20 border-muted/30 p-3 flex-1 flex items-center justify-center gap-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                      <div className="relative z-10 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-muted" />
                        <span className="text-muted font-bold text-sm">
                          Editar
                        </span>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isDeleting}
                      className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-danger/20 border-danger/30 p-3 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      <div className="relative z-10 flex items-center gap-2">
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-danger" />
                        )}
                        <span className="text-danger font-bold text-sm">
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            </div>

            {/* Panel de Mascotas - Expandido para XL (3 columnas) */}
            <div
              className={`xl:col-span-3 transform transition-all duration-1000 delay-600 ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 shadow-premium p-6 xl:p-8 h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Header del panel de mascotas */}
                  <div className="flex items-center gap-4 mb-6 xl:mb-8">
                    <div className="p-4 xl:p-5 rounded-xl xl:rounded-2xl bg-black/20 text-primary">
                      <PawPrint className="w-8 h-8 xl:w-10 xl:h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl xl:text-2xl font-bold text-text mb-1 title-shine">
                        Mascotas de {owner.name.split(" ")[0]}
                      </h3>
                      <p className="text-muted text-sm xl:text-base">
                        Gestiona las mascotas y citas médicas
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción - Layout horizontal para desktop */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6 xl:mb-8">
                    <Link
                      to={`/owners/${owner._id}/patients/new`}
                      className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-4 xl:p-5 flex items-center gap-3 xl:gap-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                      <div className="relative z-10 flex items-center gap-3 xl:gap-4 w-full">
                        <div className="p-2 xl:p-3 rounded-xl bg-black/20 text-primary">
                          <PawPrint className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-text font-bold text-sm xl:text-lg">
                            Nueva Mascota
                          </div>
                          <div className="text-muted text-xs xl:text-sm">
                            Registrar nueva mascota
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 xl:top-3 xl:right-3 w-2 h-2 xl:w-3 xl:h-3 bg-primary rounded-full animate-neon-pulse opacity-60" />
                    </Link>

                    <button
                      type="button"
                      className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-text/20 border-text/30 p-4 xl:p-5 flex items-center gap-3 xl:gap-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                      <div className="relative z-10 flex items-center gap-3 xl:gap-4 w-full">
                        <div className="p-2 xl:p-3 rounded-xl bg-black/20 text-text">
                          <Calendar className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-text font-bold text-sm xl:text-lg">
                            Programar Cita
                          </div>
                          <div className="text-muted text-xs xl:text-sm">
                            Agendar consulta médica
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 xl:top-3 xl:right-3 w-2 h-2 xl:w-3 xl:h-3 bg-text rounded-full animate-neon-pulse opacity-60" />
                    </button>
                  </div>

                  {/* Lista de mascotas con más espacio */}
                  <div className="border-t border-muted/20 pt-6">
                    <PatientListView
                      ownerId={ownerId!}
                      ownerName={owner.name}
                    />
                  </div>
                </div>

                <div className="absolute top-3 right-3 xl:top-6 xl:right-6 w-2 h-2 xl:w-3 xl:h-3 bg-primary rounded-full animate-neon-pulse opacity-60" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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
    </div>
  );
}
