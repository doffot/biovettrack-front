// src/components/patients/PatientEmptyState.tsx
import { Link } from "react-router-dom";
import { PawPrint, Plus, SearchX } from "lucide-react";

interface PatientEmptyStateProps {
  hasPatients: boolean;
  onClearFilters?: () => void;
}

export default function PatientEmptyState({ hasPatients, onClearFilters }: PatientEmptyStateProps) {
  if (!hasPatients) {
    // No hay pacientes en el sistema
    return (
      <div className="py-16 px-4 text-center animate-fade-in-up">
        <div className="relative inline-block mb-6">
          {/* Decorative rings */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-vet-primary/10 animate-pulse-slow" />
          <div className="absolute inset-2 w-20 h-20 rounded-full bg-vet-primary/20 animate-pulse-slow" style={{ animationDelay: "150ms" }} />
          
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-vet-light to-white rounded-full flex items-center justify-center shadow-card">
            <PawPrint className="w-12 h-12 text-vet-primary" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-vet-text mb-3 font-montserrat">
          ¡Bienvenido al sistema!
        </h3>
        <p className="text-vet-muted mb-8 max-w-md mx-auto leading-relaxed">
          Aún no hay pacientes registrados. Comienza agregando el primer paciente para gestionar sus historiales médicos.
        </p>

        <Link
          to="/owners"
          className="
            inline-flex items-center gap-2.5 
            px-6 py-3.5 rounded-xl 
            bg-gradient-to-r from-vet-primary to-vet-secondary 
            text-white font-semibold 
            shadow-card hover:shadow-lg
            transition-all duration-300
            hover:scale-105 hover:-translate-y-0.5
            group
          "
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Registrar Primer Paciente
        </Link>
      </div>
    );
  }

  // Hay pacientes pero los filtros no encuentran resultados
  return (
    <div className="py-16 px-4 text-center animate-fade-in-up">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center shadow-soft">
          <SearchX className="w-10 h-10 text-amber-500" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-vet-text mb-2 font-montserrat">
        Sin resultados
      </h3>
      <p className="text-vet-muted mb-6 max-w-sm mx-auto">
        No encontramos pacientes que coincidan con tu búsqueda. Intenta con otros términos.
      </p>

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="
            inline-flex items-center gap-2 
            px-5 py-2.5 rounded-xl 
            bg-vet-light text-vet-primary 
            font-medium
            hover:bg-vet-primary hover:text-white 
            transition-all duration-200
          "
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}