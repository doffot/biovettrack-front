// src/components/patients/PatientFilters.tsx
import { Search, X } from "lucide-react";
import type { Owner } from "../../types";

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  speciesFilter: string;
  onSpeciesChange: (value: string) => void;
  ownerFilter: string;
  onOwnerChange: (value: string) => void;
  owners: Owner[];
}

export default function PatientFilters({
  searchTerm,
  onSearchChange,
  speciesFilter,
  onSpeciesChange,
  ownerFilter,
  onOwnerChange,
  owners,
}: PatientFiltersProps) {
  const hasActiveFilters = searchTerm || speciesFilter !== "all" || ownerFilter !== "all";

  const clearAllFilters = () => {
    onSearchChange("");
    onSpeciesChange("all");
    onOwnerChange("all");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
        <input
          type="text"
          placeholder="Buscar paciente, raza..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-vet-muted" />
          </button>
        )}
      </div>

      {/* Species Filter */}
      <select
        value={speciesFilter}
        onChange={(e) => onSpeciesChange(e.target.value)}
        className="w-full sm:w-40 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
      >
        <option value="all">Todas las especies</option>
        <option value="canino">Canino</option>
        <option value="felino">Felino</option>
      </select>

      {/* Owner Filter */}
      <select
        value={ownerFilter}
        onChange={(e) => onOwnerChange(e.target.value)}
        className="w-full sm:w-48 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
      >
        <option value="all">Todos los propietarios</option>
        {owners.map((owner) => (
          <option key={owner._id} value={owner._id}>
            {owner.name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="px-3 py-2.5 text-sm text-vet-muted hover:text-vet-primary transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}