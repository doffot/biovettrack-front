import { X, Calendar, FlaskConical, FileText, Beaker, AlertCircle, BadgeDollarSign } from "lucide-react";
import type { LabExam } from "../../types/labExam";

interface LabExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam;
}

export default function LabExamModal({
  isOpen,
  onClose,
  exam,
}: LabExamModalProps) {
  if (!isOpen) return null;

  const cost = exam?.cost ?? 0;
  const discount = exam?.discount ?? 0;
  const totalPaid = cost - discount;

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="bg-vet-card rounded-2xl shadow-card max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col border border-vet-border animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-vet-border bg-vet-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-vet-text text-sm sm:text-base">Hemograma Completo</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-400">${totalPaid.toFixed(2)}</p>
                {discount > 0 && (
                  <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">
                    Desc. -${discount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-vet-hover text-vet-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Sección Financiera Rápida */}
          {discount > 0 && (
            <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-900/30 rounded-xl">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400/80 font-medium">Ahorro aplicado</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">-${discount.toFixed(2)}</span>
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 bg-vet-hover rounded-xl border border-vet-border">
            <Calendar className="w-4 h-4 text-vet-muted" />
            <div>
              <p className="text-[10px] text-vet-muted uppercase font-bold tracking-wider">Fecha Realización</p>
              <p className="text-sm font-medium text-vet-text">{formatDate(exam.date)}</p>
            </div>
          </div>

          {/* Resultados principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-blue-400" />
                <p className="text-[10px] font-bold text-blue-400/70 uppercase">Hematocrito</p>
              </div>
              <p className="text-lg font-bold text-blue-200">{(exam?.hematocrit ?? 0)}%</p>
            </div>

            <div className="p-3 bg-purple-900/20 border border-purple-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-purple-400" />
                <p className="text-[10px] font-bold text-purple-400/70 uppercase">Leucocitos</p>
              </div>
              <p className="text-lg font-bold text-purple-200">{(exam?.whiteBloodCells ?? 0).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-amber-400" />
                <p className="text-[10px] font-bold text-amber-400/70 uppercase">P. Total</p>
              </div>
              <p className="text-lg font-bold text-amber-200">{(exam?.totalProtein ?? 0)} <span className="text-xs font-normal opacity-60">g/dL</span></p>
            </div>

            <div className="p-3 bg-rose-900/20 border border-rose-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-rose-400" />
                <p className="text-[10px] font-bold text-rose-400/70 uppercase">Plaquetas</p>
              </div>
              <p className="text-lg font-bold text-rose-200">{(exam?.platelets ?? 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Hemotrópicos */}
          {exam.hemotropico && (
            <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-900/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-red-400 uppercase">Hallazgos Hemotrópicos</p>
                <p className="text-sm text-red-200 leading-relaxed">{exam.hemotropico}</p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {exam.observacion && (
            <div className="flex items-start gap-3 p-3 bg-vet-hover border border-vet-border rounded-xl">
              <FileText className="w-4 h-4 text-vet-muted mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-vet-muted uppercase">Notas del Laboratorio</p>
                <p className="text-sm text-vet-text italic">"{exam.observacion}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-vet-border bg-vet-card/50">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-vet-text bg-vet-hover hover:bg-vet-border rounded-xl transition-all active:scale-[0.98]"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}