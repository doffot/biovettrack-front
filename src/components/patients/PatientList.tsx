// src/components/patients/PatientList.tsx
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
  itemsPerPage = 6,
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
    <div className="space-y-4">
      {/* Patient Cards */}
      <div className="space-y-3">
        {currentPatients.map((patient, index) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            owners={owners}
            index={index}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-vet-light/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info */}
            <p className="text-sm text-vet-muted order-2 sm:order-1">
              Mostrando{" "}
              <span className="font-semibold text-vet-text">{startIndex + 1}</span>
              {" - "}
              <span className="font-semibold text-vet-text">
                {Math.min(startIndex + itemsPerPage, patients.length)}
              </span>
              {" de "}
              <span className="font-semibold text-vet-text">{patients.length}</span>
              {" pacientes"}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white hover:border-vet-primary hover:shadow-soft"
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {generatePageNumbers(currentPage, totalPages).map((page, idx) => (
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-vet-muted">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => onPageChange(page as number)}
                      className={`
                        w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200
                        ${currentPage === page
                          ? "bg-gradient-to-r from-vet-primary to-vet-secondary text-white shadow-soft"
                          : "bg-white border border-vet-light text-vet-text hover:border-vet-primary hover:text-vet-primary"
                        }
                      `}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white hover:border-vet-primary hover:shadow-soft"
                  }
                `}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}