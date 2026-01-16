// src/components/owners/Pagination.tsx
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Info de página */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">
          Página
        </span>
        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 text-sm font-semibold text-vet-accent bg-vet-accent/10 rounded-lg border border-vet-accent/30">
          {currentPage}
        </span>
        <span className="text-sm text-slate-400">
          de {totalPages}
        </span>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-1.5">
        {/* Botón primera página (solo en móvil si hay muchas páginas) */}
        {totalPages > 5 && currentPage > 3 && (
          <button
            onClick={() => onPageChange(1)}
            className="hidden sm:flex p-2 rounded-lg bg-slate-800/60 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all duration-200"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            p-2 rounded-lg border transition-all duration-200
            ${currentPage === 1
              ? "opacity-40 cursor-not-allowed bg-slate-800/30 border-white/5 text-slate-600"
              : "bg-slate-800/60 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
            }
          `}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Páginas */}
        <div className="flex items-center gap-1">
          {getPages().map((page, i) => (
            <button
              key={i}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`
                min-w-[2.5rem] h-9 px-3 rounded-lg text-sm font-medium 
                transition-all duration-200
                ${page === currentPage
                  ? "bg-gradient-to-r from-vet-accent to-cyan-400 text-slate-900 shadow-lg shadow-vet-accent/25 scale-105"
                  : page === "..."
                  ? "cursor-default text-slate-600 px-2"
                  : "bg-slate-800/60 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            p-2 rounded-lg border transition-all duration-200
            ${currentPage === totalPages
              ? "opacity-40 cursor-not-allowed bg-slate-800/30 border-white/5 text-slate-600"
              : "bg-slate-800/60 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
            }
          `}
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón última página (solo si hay muchas páginas) */}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="hidden sm:flex p-2 rounded-lg bg-slate-800/60 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all duration-200"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info adicional en desktop */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
        <span>
          {((currentPage - 1) * 8) + 1}-{Math.min(currentPage * 8, totalPages * 8)}
        </span>
        <span>de</span>
        <span className="font-medium text-slate-400">
          {totalPages * 8} registros
        </span>
      </div>
    </div>
  );
}