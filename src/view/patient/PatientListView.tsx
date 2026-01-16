import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Download, PawPrint } from "lucide-react";

import { getPatients, deletePatient } from "../../api/patientAPI";
import { getOwners } from "../../api/OwnerAPI";
import { extractId } from "../../utils/extractId";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import type { Patient, Owner } from "../../types";
import PatientTable from "../../components/patients/PatientTable";
import PatientMobileList from "../../components/patients/PatientMobileList";
import Pagination from "../../components/owners/Pagination";

const ITEMS_PER_PAGE = 8;

export interface PatientWithOwner extends Patient {
  ownerName: string;
}

export default function PatientListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const { data: patients = [], isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const { data: owners = [], isLoading: isLoadingOwners } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [searchTerm, speciesFilter, ownerFilter]);

  // Helpers
  const getOwnerId = (patient: Patient): string => {
    if (!patient.owner) return "";
    if (typeof patient.owner !== "string" && "_id" in patient.owner) {
      return patient.owner._id;
    }
    return extractId(patient.owner) || "";
  };

  const getOwnerName = (patient: Patient): string => {
    if (!patient.owner) return "Sin propietario";
    if (typeof patient.owner !== "string" && "name" in patient.owner) {
      return patient.owner.name;
    }
    const ownerId = extractId(patient.owner);
    const owner = owners.find((o) => o._id === ownerId);
    return owner?.name || "Sin propietario";
  };

  // Filter & enrich patients
  const filteredPatients = useMemo((): PatientWithOwner[] => {
    return patients
      .map((patient) => ({
        ...patient,
        ownerName: getOwnerName(patient),
      }))
      .filter((patient) => {
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
          !searchTerm ||
          patient.name.toLowerCase().includes(searchLower) ||
          patient.species.toLowerCase().includes(searchLower) ||
          patient.breed?.toLowerCase().includes(searchLower) ||
          patient.ownerName.toLowerCase().includes(searchLower);

        const matchesSpecies =
          speciesFilter === "all" ||
          patient.species.toLowerCase() === speciesFilter.toLowerCase();

        const matchesOwner =
          ownerFilter === "all" || getOwnerId(patient) === ownerFilter;

        return matchesSearch && matchesSpecies && matchesOwner;
      });
  }, [patients, owners, searchTerm, speciesFilter, ownerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  // Mutation
  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      toast.success("Paciente eliminado");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowDeleteModal(false);
      setPatientToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedPatients.map((p) => p._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const toExport =
      selectedIds.size > 0
        ? filteredPatients.filter((p) => selectedIds.has(p._id))
        : filteredPatients;

    const headers = ["Nombre", "Especie", "Raza", "Sexo", "Propietario"];
    const rows = toExport.map((p) => [
      p.name,
      p.species,
      p.breed || "",
      p.sex,
      p.ownerName,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pacientes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`${toExport.length} registros exportados`);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setOwnerFilter("all");
  };

  const isLoading = isLoadingPatients || isLoadingOwners;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const allPageSelected =
    paginatedPatients.length > 0 && paginatedPatients.every((p) => selectedIds.has(p._id));
  const hasFilters = !!searchTerm || speciesFilter !== "all" || ownerFilter !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Pacientes</h1>
          <p className="text-sm text-[var(--color-vet-muted)]">
            {patients.length} registrado{patients.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="/owners"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Nuevo Paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
          <input
            type="text"
            placeholder="Buscar paciente, raza, propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--color-hover)] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[var(--color-vet-muted)]" />
            </button>
          )}
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="w-full sm:w-40 px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-colors"
        >
          <option value="all">Todas las especies</option>
          <option value="canino">Canino</option>
          <option value="felino">Felino</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-colors"
        >
          <option value="all">Todos los propietarios</option>
          {owners.map((owner) => (
            <option key={owner._id} value={owner._id}>
              {owner.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2.5 text-sm text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Content */}
      {filteredPatients.length > 0 ? (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm text-[var(--color-vet-muted)]">
              {selectedIds.size > 0
                ? `${selectedIds.size} seleccionado${selectedIds.size !== 1 ? "s" : ""}`
                : `${filteredPatients.length} resultado${filteredPatients.length !== 1 ? "s" : ""}`}
            </p>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-vet-text)] hover:bg-[var(--color-hover)] rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar {selectedIds.size > 0 ? `(${selectedIds.size})` : "todos"}
            </button>
          </div>

          {/* Table Desktop */}
          <div className="hidden lg:block">
            <PatientTable
              patients={paginatedPatients}
              selectedIds={selectedIds}
              allSelected={allPageSelected}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onNavigate={(id) => navigate(`/patients/${id}`)}
              onDelete={handleDelete}
            />
          </div>

          {/* Mobile List */}
          <div className="lg:hidden">
            <PatientMobileList
              patients={paginatedPatients}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onNavigate={(id) => navigate(`/patients/${id}`)}
              onDelete={handleDelete}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPatientToDelete(null);
        }}
        onConfirm={() => patientToDelete?._id && removePatient(patientToDelete._id)}
        petName={patientToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-hover)] rounded-xl flex items-center justify-center border border-[var(--color-border)]">
        <PawPrint className="w-8 h-8 text-[var(--color-vet-muted)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-1">
        {hasFilters ? "Sin resultados" : "Sin pacientes"}
      </h3>
      <p className="text-sm text-[var(--color-vet-muted)] mb-4">
        {hasFilters ? "No hay pacientes con esos criterios" : "Registra tu primer paciente"}
      </p>
      {hasFilters ? (
        <button onClick={onClear} className="text-sm text-[var(--color-vet-accent)] hover:underline">
          Limpiar filtros
        </button>
      ) : (
        <Link
          to="/owners"
          className="inline-flex px-4 py-2 bg-[var(--color-vet-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-vet-secondary)] transition-colors"
        >
          Registrar Paciente
        </Link>
      )}
    </div>
  );
}