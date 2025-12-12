// src/components/patients/PatientFilters.tsx
import { Search, X, SlidersHorizontal } from "lucide-react";

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  speciesFilter: string;
  onSpeciesChange: (value: string) => void;
}

export default function PatientFilters({
  searchTerm,
  onSearchChange,
  speciesFilter,
  onSpeciesChange,
}: PatientFiltersProps) {
  const hasActiveFilters = searchTerm || speciesFilter !== "all";

  const clearAllFilters = () => {
    onSearchChange("");
    onSpeciesChange("all");
  };

  return (
    <div className="space-y-3">
      {/* Main filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted transition-colors group-focus-within:text-vet-primary" />
          <input
            type="text"
            placeholder="Buscar paciente, raza, propietario..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full pl-11 pr-10 py-3 
              bg-white border border-vet-light rounded-xl 
              text-sm text-vet-text placeholder:text-vet-muted 
              focus:outline-none focus:border-vet-primary focus:ring-4 focus:ring-vet-primary/10 
              transition-all duration-200
            "
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-vet-light transition-colors"
            >
              <X className="w-4 h-4 text-vet-muted hover:text-vet-text" />
            </button>
          )}
        </div>

        {/* Species Filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          <select
            value={speciesFilter}
            onChange={(e) => onSpeciesChange(e.target.value)}
            className="
              w-full sm:w-48 pl-10 pr-4 py-3 
              bg-white border border-vet-light rounded-xl 
              text-sm text-vet-text 
              focus:outline-none focus:border-vet-primary focus:ring-4 focus:ring-vet-primary/10 
              transition-all duration-200
              appearance-none cursor-pointer
            "
          >
            <option value="all">Todas las especies</option>
            <option value="canino">🐕 Caninos</option>
            <option value="felino">🐱 Felinos</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-vet-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
          <span className="text-xs text-vet-muted font-medium">Filtros activos:</span>
          
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vet-primary/10 text-vet-primary rounded-full text-xs font-medium">
              <Search className="w-3 h-3" />
              "{searchTerm}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:bg-vet-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {speciesFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vet-primary/10 text-vet-primary rounded-full text-xs font-medium capitalize">
              {speciesFilter === "canino" ? "🐕" : "🐱"} {speciesFilter}
              <button
                onClick={() => onSpeciesChange("all")}
                className="ml-1 hover:bg-vet-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-vet-muted hover:text-vet-primary transition-colors ml-2 underline underline-offset-2"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}