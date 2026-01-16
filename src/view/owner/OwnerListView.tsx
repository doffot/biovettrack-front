// src/views/owners/OwnerListView.tsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, X, Download, UserPlus, Filter, CreditCard, Clock } from "lucide-react";
import { getOwners, deleteOwners } from "../../api/OwnerAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { getPatients } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import type { Owner } from "../../types/owner";
import type { Patient } from "../../types/patient";
import type { Invoice } from "../../types/invoice";
import OwnerTable from "../../components/owners/OwnerTable";
import OwnerMobileList from "../../components/owners/OwnerMobileList";
import Pagination from "../../components/owners/Pagination";

type FilterType = "all" | "withDebt" | "noRecentVisit";
type SortField = "name" | "petsCount" | "lastVisit" | "totalDebt";
type SortDirection = "asc" | "desc";

export interface OwnerWithStats extends Owner {
  petsCount: number;
  lastVisit: string | null;
  totalDebt: number;
  pendingInvoices: number;
}

const ITEMS_PER_PAGE = 8;

export default function OwnerListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

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

  const invoices: Invoice[] = invoicesData?.invoices || [];

  // Calcular estadísticas
  const ownersWithStats = useMemo((): OwnerWithStats[] => {
    return owners.map((owner) => {
      const ownerPatients = patients.filter((p) => {
        const ownerId = typeof p.owner === "string" ? p.owner : p.owner?._id;
        return ownerId === owner._id;
      });

      const patientIds = ownerPatients.map((p) => p._id);

      const ownerInvoices = invoices.filter((inv) => {
        const invOwnerId = typeof inv.ownerId === "string" ? inv.ownerId : inv.ownerId?._id;
        const invPatientId = typeof inv.patientId === "string" ? inv.patientId : inv.patientId?._id;
        return invOwnerId === owner._id || (invPatientId && patientIds.includes(invPatientId));
      });

      const pendingInvoices = ownerInvoices.filter(
        (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
      );

      const totalDebt = pendingInvoices.reduce((sum, inv) => {
        return sum + (inv.total - (inv.amountPaid || 0));
      }, 0);

      const sortedInvoices = [...ownerInvoices].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        ...owner,
        petsCount: ownerPatients.length,
        lastVisit: sortedInvoices[0]?.date || null,
        totalDebt,
        pendingInvoices: pendingInvoices.length,
      };
    });
  }, [owners, patients, invoices]);

  // Filtrar
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

  // Ordenar
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
    return sortedOwners.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedOwners, currentPage]);

  // Estadísticas para filtros
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

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [searchTerm, activeFilter]);

  // Mutación eliminar
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

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedOwners.map((o) => o._id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? sortedOwners.filter((o) => selectedIds.has(o._id))
      : sortedOwners;

    const headers = ["Nombre", "Teléfono", "Email", "Cédula", "Mascotas", "Última Visita", "Deuda"];
    const rows = toExport.map((owner) => [
      owner.name,
      owner.contact,
      owner.email || "",
      owner.nationalId || "",
      owner.petsCount,
      owner.lastVisit ? new Date(owner.lastVisit).toLocaleDateString() : "Sin visitas",
      `$${owner.totalDebt.toFixed(2)}`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `propietarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`${toExport.length} registros exportados`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleDelete = (owner: Owner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  const isLoading = loadingOwners || loadingPatients || loadingInvoices;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const allPageSelected = paginatedOwners.length > 0 && paginatedOwners.every((o) => selectedIds.has(o._id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Propietarios</h1>
          <p className="text-sm text-slate-400">
            {owners.length} cliente{owners.length !== 1 ? "s" : ""} registrados
          </p>
        </div>

        <Link
          to="/owners/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-vet-accent to-cyan-400 hover:from-cyan-400 hover:to-vet-accent text-slate-900 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-vet-accent/25"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Propietario
        </Link>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-vet-accent/50 focus:border-vet-accent/50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeFilter === "all"
                ? "bg-vet-accent text-slate-900 shadow-lg shadow-vet-accent/20"
                : "bg-slate-800/60 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Todos ({owners.length})
          </button>
          
          <button
            onClick={() => setActiveFilter("withDebt")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeFilter === "withDebt"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "bg-slate-800/60 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Con deuda {filterStats.withDebt > 0 && `(${filterStats.withDebt})`}
          </button>
          
          <button
            onClick={() => setActiveFilter("noRecentVisit")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeFilter === "noRecentVisit"
                ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20"
                : "bg-slate-800/60 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Sin visita {filterStats.noRecentVisit > 0 && `(${filterStats.noRecentVisit})`}
          </button>
        </div>
      </div>

      {/* Contenido */}
      {sortedOwners.length > 0 ? (
        <>
          {/* Toolbar de exportación */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-sm text-slate-400">
              {selectedIds.size > 0 ? (
                <span className="font-medium">
                  {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>
                  {sortedOwners.length} resultado{sortedOwners.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800/60 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Exportar {selectedIds.size > 0 ? `(${selectedIds.size})` : "todos"}
            </button>
          </div>

          {/* Tabla Desktop */}
          <div className="hidden lg:block">
            <OwnerTable
              owners={paginatedOwners}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              selectedIds={selectedIds}
              allSelected={allPageSelected}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onNavigate={(id) => navigate(`/owners/${id}`)}
              onWhatsApp={handleWhatsApp}
              onDelete={handleDelete}
            />
          </div>

          {/* Lista Mobile */}
          <div className="lg:hidden">
            <OwnerMobileList
              owners={paginatedOwners}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onNavigate={(id) => navigate(`/owners/${id}`)}
              onWhatsApp={handleWhatsApp}
              onDelete={handleDelete}
            />
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
          hasFilters={!!searchTerm || activeFilter !== "all"}
          onClear={() => {
            setSearchTerm("");
            setActiveFilter("all");
          }}
        />
      )}

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

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
        <Users className="w-8 h-8 text-slate-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-1">
        {hasFilters ? "Sin resultados" : "Sin propietarios"}
      </h3>
      
      <p className="text-sm text-slate-400 mb-6">
        {hasFilters
          ? "No hay propietarios con esos criterios"
          : "Registra tu primer cliente"}
      </p>
      
      {hasFilters ? (
        <button
          onClick={onClear}
          className="text-sm text-vet-accent hover:text-white transition-colors font-medium"
        >
          Limpiar filtros
        </button>
      ) : (
        <Link
          to="/owners/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vet-accent to-cyan-400 text-slate-900 text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-vet-accent/25 transition-all duration-300"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Propietario
        </Link>
      )}
    </div>
  );
}