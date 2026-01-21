// src/views/settings/StaffListView.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  User,
  Phone,
  BadgeCheck,
  ArrowLeft,
  Plus,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import type { Staff } from "../../types/staff";
import { deleteStaff, getStaffList } from "../../api/staffAPI";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function StaffListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success("Miembro del staff eliminado con éxito");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setStaffToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el staff");
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.name} ${staff.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && staff.active) ||
      (statusFilter === "inactive" && !staff.active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      veterinario: "Veterinario",
      groomer: "Peluquero",
      asistente: "Asistente",
      recepcionista: "Recepcionista",
    };
    return roles[role] || role;
  };

  const stats = {
    total: staffList.length,
    active: staffList.filter((s) => s.active).length,
    inactive: staffList.filter((s) => !s.active).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-vet-light)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3">
            <div className="absolute inset-0 border-4 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
            <Users className="w-4 h-4 lg:w-6 lg:h-6 text-[var(--color-vet-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[var(--color-vet-text)] font-medium font-montserrat text-sm lg:text-base">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-vet-light)]">
      {/* Header */}
      <header className="bg-[var(--color-card)] shadow-sm border-b border-[var(--color-border)] sticky top-14 lg:top-16 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Link
                to="/"
                className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-[var(--color-hover)] text-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)]/10 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </Link>

              <div className="hidden sm:block h-6 lg:h-8 w-px bg-[var(--color-border)]" />

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2.5 bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-lg lg:rounded-xl shadow-sm">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm lg:text-lg font-bold text-[var(--color-vet-text)] font-montserrat leading-tight">
                    Staff
                  </h1>
                  <p className="text-[10px] lg:text-xs text-[var(--color-vet-muted)] hidden sm:block">
                    {stats.total} miembro{stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/staff/new")}
              className="inline-flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white font-medium lg:font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs lg:text-sm"
            >
              <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        <div
          className={`grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <StatCard icon={Users} label="Total" value={stats.total} variant="primary" />
          <StatCard icon={UserCheck} label="Activos" value={stats.active} variant="accent" />
          <StatCard icon={UserX} label="Inactivos" value={stats.inactive} variant="muted" />
        </div>

        {/* Table Container */}
        <div
          className={`bg-[var(--color-card)] rounded-xl lg:rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Filters */}
          <div className="p-3 lg:p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--color-vet-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg lg:rounded-xl text-xs lg:text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="px-3 lg:px-4 py-2 lg:py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg lg:rounded-xl text-xs lg:text-sm text-[var(--color-vet-text)] focus:outline-none focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 transition-all appearance-none cursor-pointer min-w-[100px] lg:min-w-[140px]"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Active filters */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-[var(--color-border)] flex items-center gap-1.5 lg:gap-2 flex-wrap">
                <span className="text-[10px] lg:text-xs text-[var(--color-vet-muted)]">Filtros:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium border border-[var(--color-vet-primary)]/20">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-[var(--color-vet-secondary)] ml-0.5">
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium border border-[var(--color-vet-primary)]/20">
                    {statusFilter === "active" ? "Activos" : "Inactivos"}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-[var(--color-vet-secondary)] ml-0.5">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-[10px] lg:text-xs text-[var(--color-vet-muted)] hover:text-[var(--color-vet-primary)] transition-colors ml-1"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {currentStaff.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--color-hover)] border-b border-[var(--color-border)]">
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider hidden sm:table-cell">
                        Rol
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider hidden md:table-cell">
                        Teléfono
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-center text-[10px] lg:text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-center text-[10px] lg:text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {currentStaff.map((staff, index) => (
                      <tr
                        key={staff._id}
                        className="hover:bg-[var(--color-hover)] transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-[var(--color-vet-primary)]/10">
                              <User className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--color-vet-primary)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs lg:text-sm font-semibold text-[var(--color-vet-text)] font-montserrat truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                                {staff.name} {staff.lastName}
                              </p>
                              {staff.isOwner && (
                                <span className="text-[10px] lg:text-xs text-[var(--color-vet-accent)] font-medium">
                                  Propietario
                                </span>
                              )}
                              <span className="text-[10px] text-[var(--color-vet-muted)] sm:hidden block">
                                {getRoleLabel(staff.role)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <BadgeCheck className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--color-vet-primary)]" />
                            <span className="text-xs lg:text-sm text-[var(--color-vet-text)]">
                              {getRoleLabel(staff.role)}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-[var(--color-vet-muted)]">
                            <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span>{staff.phone || "—"}</span>
                          </div>
                        </td>

                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-0.5 lg:gap-1 px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold ${
                              staff.active
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                : "bg-[var(--color-vet-muted)]/10 text-[var(--color-vet-muted)] border border-[var(--color-vet-muted)]/20"
                            }`}
                          >
                            {staff.active ? (
                              <>
                                <UserCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                <span className="hidden sm:inline">Activo</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                <span className="hidden sm:inline">Inactivo</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-3 lg:px-6 py-2.5 lg:py-4">
                          <div className="flex items-center justify-center gap-1 lg:gap-2">
                            {!staff.isOwner && (
                              <>
                                <button
                                  onClick={() => navigate(`/staff/${staff._id}/edit`)}
                                  className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-[var(--color-vet-light)] text-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)] hover:text-white transition-all duration-200"
                                  title="Editar"
                                >
                                  <Pencil className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                                <button
                                  onClick={() => setStaffToDelete(staff)}
                                  className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                              </>
                            )}
                            {staff.isOwner && (
                              <span className="text-[10px] lg:text-xs text-[var(--color-vet-muted)] italic">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-3 lg:px-6 py-3 lg:py-4 border-t border-[var(--color-border)] bg-[var(--color-vet-light)]/20 flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-4">
                  <p className="text-[10px] lg:text-sm text-[var(--color-vet-muted)]">
                    <span className="font-semibold text-[var(--color-vet-text)]">{startIndex + 1}</span>-
                    <span className="font-semibold text-[var(--color-vet-text)]">
                      {Math.min(startIndex + itemsPerPage, filteredStaff.length)}
                    </span>{" "}
                    de <span className="font-semibold text-[var(--color-vet-text)]">{filteredStaff.length}</span>
                  </p>

                  <div className="flex items-center gap-1 lg:gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg transition-all ${
                        currentPage === 1
                          ? "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] cursor-not-allowed"
                          : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)] hover:text-white"
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>

                    <div className="flex items-center gap-0.5 lg:gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = currentPage === pageNum;

                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-7 h-7 lg:w-9 lg:h-9 rounded-md lg:rounded-lg text-[10px] lg:text-sm font-medium transition-all ${
                                isCurrentPage
                                  ? "bg-[var(--color-vet-primary)] text-white shadow-sm"
                                  : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-vet-text)] hover:border-[var(--color-vet-primary)] hover:text-[var(--color-vet-primary)]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="text-[var(--color-vet-muted)] px-0.5 text-xs">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg transition-all ${
                        currentPage === totalPages
                          ? "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] cursor-not-allowed"
                          : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)] hover:text-white"
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 lg:p-12 text-center">
              <div className="w-14 h-14 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 bg-[var(--color-vet-light)] rounded-full flex items-center justify-center border border-[var(--color-border)]">
                <Users className="w-7 h-7 lg:w-10 lg:h-10 text-[var(--color-vet-muted)]" />
              </div>

              {staffList.length === 0 ? (
                <>
                  <h3 className="text-base lg:text-xl font-bold text-[var(--color-vet-text)] mb-2 font-montserrat">
                    No hay miembros en el staff
                  </h3>
                  <p className="text-[var(--color-vet-muted)] text-xs lg:text-base mb-6 lg:mb-8 max-w-md mx-auto">
                    Comienza agregando tu primer miembro del equipo.
                  </p>
                  <button
                    onClick={() => navigate("/staff/new")}
                    className="inline-flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm lg:text-base"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    Crear Staff
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base lg:text-xl font-bold text-[var(--color-vet-text)] mb-2 font-montserrat">
                    Sin resultados
                  </h3>
                  <p className="text-[var(--color-vet-muted)] text-xs lg:text-base mb-4 lg:mb-6">
                    Ajusta los filtros de búsqueda
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-md lg:rounded-lg bg-[var(--color-vet-light)] text-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)] hover:text-white transition-all font-medium text-xs lg:text-sm border border-[var(--color-border)]"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => staffToDelete && deleteMutation.mutate(staffToDelete._id!)}
        title="Eliminar miembro"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de que deseas eliminar a <strong>{staffToDelete?.name} {staffToDelete?.lastName}</strong>?
            </p>
            <p className="text-sm text-[var(--color-vet-muted)]">
              Esta acción no se puede deshacer y el usuario perderá acceso al sistema.
            </p>
          </div>
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={deleteMutation.isPending}
        loadingText="Eliminando..."
      />
    </div>
  );
}

// StatCard 
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: "primary" | "accent" | "muted";
}

function StatCard({ icon: Icon, label, value, variant }: StatCardProps) {
  const variantClasses = {
    primary: {
      bg: "bg-[var(--color-card)]",
      iconBg: "bg-[var(--color-vet-primary)]/10",
      icon: "text-[var(--color-vet-primary)]",
      value: "text-[var(--color-vet-primary)]",
    },
    accent: {
      bg: "bg-[var(--color-card)]",
      iconBg: "bg-[var(--color-vet-accent)]/10",
      icon: "text-[var(--color-vet-accent)]",
      value: "text-[var(--color-vet-secondary)]",
    },
    muted: {
      bg: "bg-[var(--color-card)]",
      iconBg: "bg-[var(--color-vet-muted)]/10",
      icon: "text-[var(--color-vet-muted)]",
      value: "text-[var(--color-vet-muted)]",
    },
  };

  const classes = variantClasses[variant];

  return (
    <div
      className={`${classes.bg} rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-vet-primary)]/30 hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <div className={`p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl ${classes.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-[10px] lg:text-xs text-[var(--color-vet-muted)] font-medium">{label}</p>
          <p className={`text-base lg:text-xl font-bold ${classes.value} font-montserrat`}>{value}</p>
        </div>
      </div>
    </div>
  );
}