// src/components/labexam/DifferentialControls.tsx
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { LabExamFormData } from "../../types";
import ConfirmationModal from "../modal/ConfirmationModal";

interface DifferentialControlsProps {
  totalCells: number;
  lastAction: { field: keyof LabExamFormData["differentialCount"] } | null;
  onUndo: () => void;
  onReset: () => void;
}

export function DifferentialControls({ 
  totalCells, 
  lastAction, 
  onUndo, 
  onReset 
}: DifferentialControlsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetConfirm = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className={`text-base font-bold px-2 py-1 rounded-md bg-vet-light border transition-colors ${
          totalCells === 100 ? 'text-vet-accent border-vet-accent' : 'text-vet-primary border-vet-primary/30'
        }`}>
          {totalCells}/100
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!lastAction || totalCells === 0}
            className="flex items-center justify-center w-8 h-8 bg-vet-light border-2 border-vet-accent/40 rounded-md text-vet-accent hover:bg-vet-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Deshacer último conteo"
          >
            <span className="text-sm">↶</span>
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={totalCells === 0}
            className="flex items-center justify-center w-8 h-8 bg-vet-light border-2 border-vet-muted/40 rounded-md text-vet-muted hover:bg-vet-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Reiniciar conteo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
        title="¿Reiniciar conteo?"
        message={
          <>
            <p className="text-vet-text mb-2 font-inter">
              Se eliminarán{" "}
              <span className="font-bold text-vet-primary">{totalCells} células</span>{" "}
              contadas.
            </p>
            <p className="text-vet-muted text-sm font-inter">
              Esta acción no se puede deshacer.
            </p>
          </>
        }
        confirmText="Reiniciar"
        confirmIcon={RotateCcw}
        variant="warning"
      />
    </>
  );
}