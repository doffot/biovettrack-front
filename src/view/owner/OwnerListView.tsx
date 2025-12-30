// src/views/owners/OwnerListView.tsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  UserPlus,
  X,
  Trash2,
  MessageCircle,
  PawPrint,
  Calendar,
  AlertCircle,
  Filter,
  DollarSign,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Download,
} from "lucide-react";
import { getOwners, deleteOwners } from "../../api/OwnerAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { toast } from "../../components/Toast";
import type { Owner } from "../../types/owner";
import type { Patient } from "../../types/patient";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getPatients } from "../../api/patientAPI";

type FilterType = "all" | "withDebt" | "noRecentVisit";
type SortField = "name" | "petsCount" | "lastVisit" | "totalDebt";
type SortDirection = "asc" | "desc";

interface OwnerWithStats extends Owner {
  petsCount: number;
  lastVisit: string | null;
  totalDebt: number;
  pendingInvoices: number;
}

const ITEMS_PER_PAGE = 20;

export default function OwnerListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Queries
  const { data: owners = [], isLoading: loadingOwners } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ["invoices", "all"],
    queryFn: () => getInvoices({ limit: 1000 }),
  });

  const invoices = invoicesData?.invoices || [];

  // Calcular estadísticas por owner
  const ownersWithStats = useMemo((): OwnerWithStats[] => {
    return owners.map((owner) => {
      const ownerPatients = patients.filter((p) => {
        const ownerId = typeof p.owner === "string" ? p.owner : p.owner?._id;
        return ownerId === owner._id;
      });

      const patientIds = ownerPatients.map((p) => p._id);

      const ownerInvoices = invoices.filter((inv) => {
        const invOwnerId = typeof inv.ownerId === "string" 
          ? inv.ownerId 
          : inv.ownerId?._id;
        const invPatientId = typeof inv.patientId === "string"
          ? inv.patientId
          : inv.patientId?._id;
        
        return invOwnerId === owner._id || (invPatientId && patientIds.includes(invPatientId));
      });

      const pendingInvoices = ownerInvoices.filter(
        (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
      );
      
      const totalDebt = pendingInvoices.reduce((sum, inv) => {
        const remaining = inv.total - (inv.amountPaid || 0);
        return sum + remaining;
      }, 0);

      const sortedInvoices = [...ownerInvoices].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastVisit = sortedInvoices[0]?.date || null;

      return {
        ...owner,
        petsCount: ownerPatients.length,
        lastVisit,
        totalDebt,
        pendingInvoices: pendingInvoices.length,
      };
    });
  }, [owners, patients, invoices]);

  // Filtrar owners
  const filteredOwners = useMemo(() => {
    let result = ownersWithStats;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (owner) =>
          owner.name.toLowerCase().includes(search) ||
          owner.contact.includes(search) ||
          owner.email?.toLowerCase().includes(search) ||
          owner.nationalId?.toLowerCase().includes(search)
      );
    }

    if (activeFilter === "withDebt") {
      result = result.filter((owner) => owner.totalDebt > 0);
    } else if (activeFilter === "noRecentVisit") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter((owner) => {
        if (!owner.lastVisit) return true;
        return new Date(owner.lastVisit) < thirtyDaysAgo;
      });
    }

    return result;
  }, [ownersWithStats, searchTerm, activeFilter]);

  // Ordenar owners
  const sortedOwners = useMemo(() => {
    const sorted = [...filteredOwners];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "petsCount":
          comparison = a.petsCount - b.petsCount;
          break;
        case "lastVisit":
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "totalDebt":
          comparison = a.totalDebt - b.totalDebt;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredOwners, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(sortedOwners.length / ITEMS_PER_PAGE);
  const paginatedOwners = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedOwners.slice(start, end);
  }, [sortedOwners, currentPage]);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  // Estadísticas para los filtros
  const filterStats = useMemo(() => {
    const withDebt = ownersWithStats.filter((o) => o.totalDebt > 0).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const noRecentVisit = ownersWithStats.filter((o) => {
      if (!o.lastVisit) return true;
      return new Date(o.lastVisit) < thirtyDaysAgo;
    }).length;

    return { withDebt, noRecentVisit };
  }, [ownersWithStats]);

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteOwners(id),
    onSuccess: () => {
      toast.success("Propietario eliminado");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleWhatsApp = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleExportCSV = () => {
    const headers = ["Nombre", "Teléfono", "Email", "Cédula", "Mascotas", "Última Visita", "Deuda"];
    const rows = sortedOwners.map(owner => [
      owner.name,
      owner.contact,
      owner.email || "",
      owner.nationalId || "",
      owner.petsCount,
      owner.lastVisit ? new Date(owner.lastVisit).toLocaleDateString() : "Sin visitas",
      `$${owner.totalDebt.toFixed(2)}`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `propietarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Archivo exportado");
  };

  const isLoading = loadingOwners || loadingPatients || loadingInvoices;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-vet-muted text-sm">Cargando propietarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-vet-light/30">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-2xl shadow-lg shadow-vet-primary/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              {/* propietarios */}
              <h1 className="text-2xl  text-vet-text font-yellowtail">Propietarios</h1>
              <p className="text-sm text-vet-muted">
                {sortedOwners.length} de {owners.length} cliente{owners.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-vet-primary/30 hover:bg-vet-light/20 text-vet-text text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            
            <Link
              to="/owners/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-vet-primary/25 hover:shadow-xl hover:shadow-vet-primary/30 hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Propietario</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className={`mb-4 transition-all duration-500 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex items-center gap-1 text-sm text-vet-muted mr-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtrar:</span>
            </div>
            
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-vet-primary text-white shadow-md"
                  : "bg-white text-vet-text hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Todos
              <span className="ml-1.5 text-xs opacity-70">({owners.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter("withDebt")}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === "withDebt"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/25"
                  : "bg-white text-vet-text hover:bg-red-50 border border-gray-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Con deuda
              {filterStats.withDebt > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeFilter === "withDebt" ? "bg-white/20" : "bg-red-100 text-red-600"
                }`}>
                  {filterStats.withDebt}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter("noRecentVisit")}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === "noRecentVisit"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/25"
                  : "bg-white text-vet-text hover:bg-amber-50 border border-gray-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Sin visita reciente
              {filterStats.noRecentVisit > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeFilter === "noRecentVisit" ? "bg-white/20" : "bg-amber-100 text-amber-600"
                }`}>
                  {filterStats.noRecentVisit}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vet-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary shadow-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-vet-muted" />
              </button>
            )}
          </div>
          
          {(searchTerm || activeFilter !== "all") && (
            <p className="mt-2 text-xs text-vet-muted">
              {sortedOwners.length} resultado{sortedOwners.length !== 1 ? "s" : ""}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          )}
        </div>

        {/* Tabla / Lista */}
        {sortedOwners.length > 0 ? (
          <>
            {/* Vista Desktop - Tabla */}
            <div className={`hidden lg:block transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full">
                    <TableHeader
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <tbody className="divide-y divide-gray-50">
                      {paginatedOwners.map((owner, index) => (
                        <TableRow
                          key={owner._id}
                          owner={owner}
                          index={index}
                          onNavigate={() => navigate(`/owners/${owner._id}`)}
                          onWhatsApp={(e) => handleWhatsApp(e, owner.contact)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            setOwnerToDelete(owner);
                            setShowDeleteModal(true);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vista Mobile - Cards */}
            <div className={`lg:hidden space-y-3 transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {paginatedOwners.map((owner, index) => (
                <MobileCard
                  key={owner._id}
                  owner={owner}
                  index={index}
                  onNavigate={() => navigate(`/owners/${owner._id}`)}
                  onWhatsApp={(e) => handleWhatsApp(e, owner.contact)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setOwnerToDelete(owner);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <EmptyState 
            hasSearch={!!searchTerm || activeFilter !== "all"} 
            onClearSearch={() => {
              setSearchTerm("");
              setActiveFilter("all");
            }}
          />
        )}
      </div>

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        onConfirm={() => ownerToDelete?._id && removeOwner(ownerToDelete._id)}
        petName={`al propietario ${ownerToDelete?.name || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// ============ TABLE HEADER ============
interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3.5 h-3.5 text-vet-primary" />
      : <ArrowDown className="w-3.5 h-3.5 text-vet-primary" />;
  };

  const headerClass = "group px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider cursor-pointer hover:bg-vet-light/30 transition-colors select-none";
  const sortableClass = "flex items-center gap-2";

  return (
    <thead className="bg-gradient-to-r from-vet-light/40 to-white border-b-2 border-vet-primary/10">
      <tr>
        <th className={headerClass} onClick={() => onSort("name")}>
          <div className={sortableClass}>
            <span>Propietario</span>
            <SortIcon field="name" />
          </div>
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider">
          Contacto
        </th>
        <th className={headerClass} onClick={() => onSort("petsCount")}>
          <div className={sortableClass}>
            <span>Mascotas</span>
            <SortIcon field="petsCount" />
          </div>
        </th>
        <th className={headerClass} onClick={() => onSort("lastVisit")}>
          <div className={sortableClass}>
            <span>Última Visita</span>
            <SortIcon field="lastVisit" />
          </div>
        </th>
        <th className={headerClass} onClick={() => onSort("totalDebt")}>
          <div className={sortableClass}>
            <span>Deuda</span>
            <SortIcon field="totalDebt" />
          </div>
        </th>
        <th className="px-6 py-4 text-right text-xs font-semibold text-vet-muted uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}

// ============ TABLE ROW ============
interface TableRowProps {
  owner: OwnerWithStats;
  index: number;
  onNavigate: () => void;
  onWhatsApp: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function TableRow({ owner, index, onNavigate, onWhatsApp, onDelete }: TableRowProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-amber-500 to-amber-600",
      "from-rose-500 to-rose-600",
      "from-cyan-500 to-cyan-600",
      "from-indigo-500 to-indigo-600",
    ];
    const idx = name.length % colors.length;
    return colors[idx];
  };

  const getLastVisitInfo = (date: string | null) => {
    if (!date) {
      return { text: "Sin visitas", color: "text-gray-400", bgColor: "bg-gray-100", status: "none" };
    }
    
    const visitDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: "Hoy", color: "text-green-700", bgColor: "bg-green-100", status: "recent" };
    }
    if (diffDays === 1) {
      return { text: "Ayer", color: "text-green-600", bgColor: "bg-green-50", status: "recent" };
    }
    if (diffDays < 7) {
      return { text: `Hace ${diffDays}d`, color: "text-green-600", bgColor: "bg-green-50", status: "recent" };
    }
    if (diffDays < 30) {
      return { text: `Hace ${Math.floor(diffDays / 7)}sem`, color: "text-yellow-600", bgColor: "bg-yellow-50", status: "moderate" };
    }
    if (diffDays < 90) {
      return { text: `Hace ${Math.floor(diffDays / 30)}m`, color: "text-orange-600", bgColor: "bg-orange-50", status: "old" };
    }
    return { text: `Hace ${Math.floor(diffDays / 30)}m`, color: "text-red-600", bgColor: "bg-red-50", status: "very-old" };
  };

  const getDebtBadge = (debt: number) => {
    if (debt === 0) {
      return { text: "Al día", color: "text-green-700", bgColor: "bg-green-100", showAmount: false };
    }
    if (debt <= 100) {
      return { text: `$${debt.toFixed(2)}`, color: "text-yellow-700", bgColor: "bg-gradient-to-r from-yellow-100 to-yellow-50", showAmount: true };
    }
    return { text: `$${debt.toFixed(2)}`, color: "text-red-700", bgColor: "bg-gradient-to-r from-red-100 to-orange-50", showAmount: true };
  };

  const lastVisitInfo = getLastVisitInfo(owner.lastVisit);
  const debtBadge = getDebtBadge(owner.totalDebt);

  return (
    <tr
      onClick={onNavigate}
      className="group hover:bg-vet-light/20 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-l-vet-primary"
      style={{ 
        animation: `fadeIn 0.3s ease-out ${index * 50}ms backwards`,
      }}
    >
      {/* Propietario */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(owner.name)} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
              {getInitials(owner.name)}
            </div>
            {owner.totalDebt > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <AlertCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-vet-text group-hover:text-vet-primary transition-colors truncate">
              {owner.name}
            </p>
            {owner.nationalId && (
              <p className="text-xs text-vet-muted flex items-center gap-1 mt-0.5">
                <CreditCard className="w-3 h-3" />
                {owner.nationalId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Contacto */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm space-y-1">
          <p className="text-vet-text flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-vet-muted" />
            {owner.contact}
          </p>
          {owner.email && (
            <p className="text-vet-muted text-xs flex items-center gap-1.5 truncate max-w-[200px]">
              <Mail className="w-3 h-3" />
              {owner.email}
            </p>
          )}
        </div>
      </td>

      {/* Mascotas */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-vet-light/50 rounded-lg">
            <PawPrint className="w-4 h-4 text-vet-primary" />
          </div>
          <span className="text-sm font-semibold text-vet-text">
            {owner.petsCount}
          </span>
        </div>
      </td>

      {/* Última Visita */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${lastVisitInfo.color} ${lastVisitInfo.bgColor}`}>
          <Calendar className="w-3.5 h-3.5" />
          {lastVisitInfo.text}
        </span>
      </td>

      {/* Deuda */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${debtBadge.color} ${debtBadge.bgColor} shadow-sm`}>
          {debtBadge.showAmount && <DollarSign className="w-3.5 h-3.5" />}
          {debtBadge.text}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onWhatsApp}
            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-vet-primary/10 transition-all ml-1">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-vet-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </td>
    </tr>
  );
}

// ============ MOBILE CARD ============
interface MobileCardProps {
  owner: OwnerWithStats;
  index: number;
  onNavigate: () => void;
  onWhatsApp: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function MobileCard({ owner, index, onNavigate, onWhatsApp, onDelete }: MobileCardProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-amber-500 to-amber-600",
      "from-rose-500 to-rose-600",
      "from-cyan-500 to-cyan-600",
      "from-indigo-500 to-indigo-600",
    ];
    const idx = name.length % colors.length;
    return colors[idx];
  };

  const formatLastVisit = (date: string | null) => {
    if (!date) return "Sin visitas";
    
    const visitDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? "es" : ""}`;
    return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? "s" : ""}`;
  };

  const isOldVisit = () => {
    if (!owner.lastVisit) return true;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(owner.lastVisit) < thirtyDaysAgo;
  };

  return (
    <div
      onClick={onNavigate}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:shadow-vet-primary/5 hover:border-vet-primary/20 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarColor(owner.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform`}>
            {getInitials(owner.name)}
          </div>
          {owner.totalDebt > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-vet-text truncate group-hover:text-vet-primary transition-colors">
              {owner.name}
            </h3>
            
            {owner.totalDebt > 0 && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-red-100 to-orange-50 text-red-700 text-xs font-bold rounded-full flex-shrink-0 shadow-sm">
                ${owner.totalDebt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5 text-vet-muted">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{owner.contact}</span>
            </div>

            <div className="flex items-center gap-1.5 text-vet-muted">
              <PawPrint className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{owner.petsCount} mascota{owner.petsCount !== 1 ? "s" : ""}</span>
            </div>

            <div className={`flex items-center gap-1.5 col-span-2 ${isOldVisit() ? "text-amber-600" : "text-vet-muted"}`}>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{formatLastVisit(owner.lastVisit)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onWhatsApp}
            className="p-2.5 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-vet-primary/10 transition-all ml-1">
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-vet-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PAGINATION ============
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="text-sm text-vet-muted">
        Página <span className="font-semibold text-vet-text">{currentPage}</span> de{" "}
        <span className="font-semibold text-vet-text">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-vet-light/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4 text-vet-text" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-gradient-to-r from-vet-primary to-vet-secondary text-white shadow-md"
                : page === "..."
                ? "cursor-default text-vet-muted"
                : "hover:bg-vet-light/50 text-vet-text"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-vet-light/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRightIcon className="w-4 h-4 text-vet-text" />
        </button>
      </div>
    </div>
  );
}

// ============ EMPTY STATE ============
interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

function EmptyState({ hasSearch, onClearSearch }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-vet-light to-gray-100 rounded-2xl flex items-center justify-center">
          <Users className="w-10 h-10 text-vet-muted" />
        </div>
        {!hasSearch && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl flex items-center justify-center shadow-lg">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-vet-text mb-2">
        {hasSearch ? "Sin resultados" : "Sin propietarios"}
      </h3>
      <p className="text-sm text-vet-muted mb-6 max-w-sm mx-auto">
        {hasSearch
          ? "No encontramos propietarios con esos criterios"
          : "Registra tu primer cliente para comenzar a gestionar sus mascotas"
        }
      </p>

      {hasSearch ? (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-vet-primary hover:bg-vet-light rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Limpiar filtros
        </button>
      ) : (
        <Link
          to="/owners/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary text-white text-sm font-semibold rounded-xl shadow-lg shadow-vet-primary/25 hover:shadow-xl hover:scale-105 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Propietario
        </Link>
      )}
    </div>
  );
}