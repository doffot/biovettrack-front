import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Patient, Owner } from "../../types";
import PatientCard from "./PatientCard";
import PatientEmptyState from "./PatientEmptyState";

interface PatientListProps {
  patients: Patient[];
  owners: Owner[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onClearFilters: () => void;
  hasAnyPatients: boolean;
}

export default function PatientList({
  patients,
  owners,
  currentPage,
  onPageChange,
  itemsPerPage = 8,
  onClearFilters,
  hasAnyPatients,
}: PatientListProps) {
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = patients.slice(startIndex, startIndex + itemsPerPage);

  if (patients.length === 0) {
    return (
      <PatientEmptyState
        hasPatients={hasAnyPatients}
        onClearFilters={hasAnyPatients ? onClearFilters : undefined}
      />
    );
  }

  return (
    <div>
      {/* Patient Cards */}
      <div className="space-y-2">
        {currentPatients.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            owners={owners}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-vet-muted)]">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, patients.length)} de {patients.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[var(--color-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--color-vet-text)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-[var(--color-vet-muted)] text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[var(--color-vet-primary)] text-white"
                      : "hover:bg-[var(--color-hover)] text-[var(--color-vet-text)]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[var(--color-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--color-vet-text)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  
  return [1, "...", current - 1, current, current + 1, "...", total];
}