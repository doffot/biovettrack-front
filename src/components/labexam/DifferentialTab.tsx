// components/DifferentialTab.tsx

import type { DifferentialField, LabExamFormData } from "../../types";
import { DifferentialControls } from "./DifferentialControls";
import { DifferentialFieldComponent } from "./DifferentialField";

interface DifferentialTabProps {
  differentialCount: LabExamFormData["differentialCount"];
  totalCells: number;
  totalWhiteCells: number;
  species: 'perro' | 'gato';
  lastAction: { field: keyof LabExamFormData["differentialCount"] } | null;
  calculatedValues: Record<keyof LabExamFormData["differentialCount"], {
    percentage: string;
    absolute: string;
  }>;
  differentialFields: DifferentialField[];
  onIncrement: (field: keyof LabExamFormData["differentialCount"], sound: HTMLAudioElement) => void;
  onUndo: () => void;
  onReset: () => void;
  isOutOfRange: (value: number | string | undefined, rangeKey: keyof LabExamFormData["differentialCount"]) => boolean;
}

export function DifferentialTab({
  differentialCount,
  totalCells,
  totalWhiteCells,
  species,
  lastAction,
  calculatedValues,
  differentialFields,
  onIncrement,
  onUndo,
  onReset,
  isOutOfRange
}: DifferentialTabProps) {
  return (
    <div className="space-y-4">
      <DifferentialControls
        totalCells={totalCells}
        lastAction={lastAction}
        onUndo={onUndo}
        onReset={onReset}
      />

      {/* Móvil */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {differentialFields.map((field) => (
            <DifferentialFieldComponent
              key={field.key}
              field={field}
              count={differentialCount[field.key] || 0}
              percentage={calculatedValues[field.key]?.percentage || "0.0"}
              absolute={calculatedValues[field.key]?.absolute || "0.0"}
              totalWhiteCells={totalWhiteCells}
              species={species}
              totalCells={totalCells}
              onIncrement={onIncrement}
              isOutOfRange={isOutOfRange}
              isMobile={true}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-2">
        {differentialFields.map((field) => (
          <DifferentialFieldComponent
            key={field.key}
            field={field}
            count={differentialCount[field.key] || 0}
            percentage={calculatedValues[field.key]?.percentage || "0.0"}
            absolute={calculatedValues[field.key]?.absolute || "0.0"}
            totalWhiteCells={totalWhiteCells}
            species={species}
            totalCells={totalCells}
            onIncrement={onIncrement}
            isOutOfRange={isOutOfRange}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
}