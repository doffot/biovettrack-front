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
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

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

  // Filtrado
  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.name} ${staff.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && staff.active) ||
      (statusFilter === "inactive" && !staff.active);
    return matchesSearch && matchesStatus;
  });

  // Paginación
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
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 border-4 border-vet-light border-t-vet-primary rounded-full animate-spin" />
            <Users className="w-4 h-4 lg:w-6 lg:h-6 text-vet-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-vet-text font-medium font-montserrat text-sm lg:text-base">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-gradient">
      {/* Header - Más compacto en mobile */}
      <header className="bg-white shadow-soft border-b border-vet-light sticky mt-2 lg:mt-0 top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Left side */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Link
                to="/"
                className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-vet-light text-vet-primary hover:bg-vet-accent/20 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </Link>

              <div className="hidden sm:block h-6 lg:h-8 w-px bg-vet-light" />

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-lg lg:rounded-xl shadow-soft">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm lg:text-lg font-bold text-vet-text font-montserrat leading-tight">
                    Staff
                  </h1>
                  <p className="text-[10px] lg:text-xs text-vet-muted hidden sm:block">
                    {stats.total} miembro{stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <button
              onClick={() => navigate("/staff/new")}
              className="inline-flex items-center gap-1.5 lg:gap-2 px-2.5 py-1.5 lg:px-4 lg:py-2.5 rounded-lg lg:rounded-xl bg-vet-primary text-white font-medium lg:font-semibold hover:bg-vet-secondary transition-all duration-200 shadow-soft text-xs lg:text-sm"
            >
              <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content  */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Stats Cards  */}
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
          className={`bg-white rounded-xl lg:rounded-2xl shadow-soft border border-vet-light/50 overflow-hidden transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Filters */}
          <div className="p-3 lg:p-4 border-b border-vet-light/50 bg-gradient-to-r from-vet-light/30 to-transparent">
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-vet-muted" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-white border border-vet-light rounded-lg lg:rounded-xl text-xs lg:text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="px-3 lg:px-4 py-2 lg:py-2.5 bg-white border border-vet-light rounded-lg lg:rounded-xl text-xs lg:text-sm text-vet-text focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all appearance-none cursor-pointer min-w-[100px] lg:min-w-[140px]"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Active filters */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-vet-light/50 flex items-center gap-1.5 lg:gap-2 flex-wrap">
                <span className="text-[10px] lg:text-xs text-vet-muted">Filtros:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-vet-primary/10 text-vet-primary rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-vet-secondary ml-0.5">
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-vet-primary/10 text-vet-primary rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium">
                    {statusFilter === "active" ? "Activos" : "Inactivos"}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-vet-secondary ml-0.5">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-[10px] lg:text-xs text-vet-muted hover:text-vet-primary transition-colors ml-1"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {currentStaff.length > 0 ? (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-vet-light/30 border-b border-vet-light/50">
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-vet-muted uppercase tracking-wider hidden sm:table-cell">
                        Rol
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-left text-[10px] lg:text-xs font-semibold text-vet-muted uppercase tracking-wider hidden md:table-cell">
                        Teléfono
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-center text-[10px] lg:text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 lg:px-6 py-2.5 lg:py-4 text-center text-[10px] lg:text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vet-light/50">
                    {currentStaff.map((staff, index) => (
                      <tr
                        key={staff._id}
                        className="hover:bg-vet-light/30 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Nombre */}
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-vet-primary/10">
                              <User className="w-3 h-3 lg:w-4 lg:h-4 text-vet-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs lg:text-sm font-semibold text-vet-text font-montserrat truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                                {staff.name} {staff.lastName}
                              </p>
                              {staff.isOwner && (
                                <span className="text-[10px] lg:text-xs text-vet-accent font-medium">
                                  Propietario
                                </span>
                              )}
                              {/* Rol visible solo en mobile */}
                              <span className="text-[10px] text-vet-muted sm:hidden block">
                                {getRoleLabel(staff.role)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <BadgeCheck className="w-3 h-3 lg:w-4 lg:h-4 text-vet-primary" />
                            <span className="text-xs lg:text-sm text-vet-text">
                              {getRoleLabel(staff.role)}
                            </span>
                          </div>
                        </td>

                        {/* Teléfono */}
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-vet-muted">
                            <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span>{staff.phone || "—"}</span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-0.5 lg:gap-1 px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold ${
                              staff.active
                                ? "bg-vet-accent/10 text-vet-secondary border border-vet-accent/30"
                                : "bg-vet-muted/10 text-vet-muted border border-vet-muted/30"
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

                        {/* Acciones */}
                        <td className="px-3 lg:px-6 py-2.5 lg:py-4">
                          <div className="flex items-center justify-center gap-1 lg:gap-2">
                            {!staff.isOwner && (
                              <>
                                <button
                                  onClick={() => navigate(`/staff/${staff._id}/edit`)}
                                  className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all duration-200"
                                  title="Editar"
                                >
                                  <Pencil className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                                <button
                                  onClick={() => setStaffToDelete(staff)}
                                  className="p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-vet-danger/10 text-vet-danger hover:bg-vet-danger hover:text-white transition-all duration-200"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                              </>
                            )}
                            {staff.isOwner && (
                              <span className="text-[10px] lg:text-xs text-vet-muted italic">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination  */}
              {totalPages > 1 && (
                <div className="px-3 lg:px-6 py-3 lg:py-4 border-t border-vet-light/50 bg-vet-light/20 flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-4">
                  <p className="text-[10px] lg:text-sm text-vet-muted">
                    <span className="font-semibold text-vet-text">{startIndex + 1}</span>-
                    <span className="font-semibold text-vet-text">
                      {Math.min(startIndex + itemsPerPage, filteredStaff.length)}
                    </span>{" "}
                    de <span className="font-semibold text-vet-text">{filteredStaff.length}</span>
                  </p>

                  <div className="flex items-center gap-1 lg:gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg transition-all ${
                        currentPage === 1
                          ? "bg-vet-light/50 text-vet-muted cursor-not-allowed"
                          : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white"
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
                                  ? "bg-vet-primary text-white shadow-soft"
                                  : "bg-white border border-vet-light text-vet-text hover:border-vet-primary hover:text-vet-primary"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="text-vet-muted px-0.5 text-xs">
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
                          ? "bg-vet-light/50 text-vet-muted cursor-not-allowed"
                          : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white"
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
              <div className="w-14 h-14 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 bg-vet-light rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 lg:w-10 lg:h-10 text-vet-muted" />
              </div>

              {staffList.length === 0 ? (
                <>
                  <h3 className="text-base lg:text-xl font-bold text-vet-text mb-2 font-montserrat">
                    No hay miembros en el staff
                  </h3>
                  <p className="text-vet-muted text-xs lg:text-base mb-6 lg:mb-8 max-w-md mx-auto">
                    Comienza agregando tu primer miembro del equipo.
                  </p>
                  <button
                    onClick={() => navigate("/staff/new")}
                    className="inline-flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-soft transition-all text-sm lg:text-base"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    Crear Staff
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base lg:text-xl font-bold text-vet-text mb-2 font-montserrat">
                    Sin resultados
                  </h3>
                  <p className="text-vet-muted text-xs lg:text-base mb-4 lg:mb-6">
                    Ajusta los filtros de búsqueda
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-md lg:rounded-lg bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all font-medium text-xs lg:text-sm"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {staffToDelete && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setStaffToDelete(null)}
          onConfirm={() => deleteMutation.mutate(staffToDelete._id!)}
          petName={`${staffToDelete.name} ${staffToDelete.lastName}`}
          isDeleting={deleteMutation.isPending}
        />
      )}
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
      bg: "bg-vet-light",
      iconBg: "bg-vet-primary/10",
      icon: "text-vet-primary",
      value: "text-vet-primary",
    },
    accent: {
      bg: "bg-vet-accent/5",
      iconBg: "bg-vet-accent/20",
      icon: "text-vet-secondary",
      value: "text-vet-secondary",
    },
    muted: {
      bg: "bg-white",
      iconBg: "bg-vet-muted/10",
      icon: "text-vet-muted",
      value: "text-vet-muted",
    },
  };

  const classes = variantClasses[variant];

  return (
    <div
      className={`${classes.bg} rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-soft border border-vet-light/50 hover:shadow-card transition-all duration-300`}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <div className={`p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl ${classes.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-[10px] lg:text-xs text-vet-muted font-medium">{label}</p>
          <p className={`text-base lg:text-xl font-bold ${classes.value} font-montserrat`}>{value}</p>
        </div>
      </div>
    </div>
  );
}