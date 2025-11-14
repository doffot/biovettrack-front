// components/DifferentialField.tsx

import type { DifferentialField, LabExamFormData } from "../../types";

interface DifferentialFieldProps {
  field: DifferentialField;
  count: number;
  percentage: string;
  absolute: string;
  totalWhiteCells: number;
  species: 'perro' | 'gato';
  totalCells: number;
  onIncrement: (field: keyof LabExamFormData["differentialCount"], sound: HTMLAudioElement) => void;
  isOutOfRange: (value: number | string | undefined, rangeKey: keyof LabExamFormData["differentialCount"]) => boolean;
  isMobile?: boolean;
}

const normalValues = {
  perro: {
    segmentedNeutrophils: [3.3, 11.4],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.0, 4.8],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.3],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5]
  },
  gato: {
    segmentedNeutrophils: [2.5, 12.5],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.5, 7.0],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.5],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5]
  }
};

export function DifferentialFieldComponent({
  field,
  count,
  percentage,
  absolute,
  totalWhiteCells,
  species,
  totalCells,
  onIncrement,
  isOutOfRange,
  isMobile = false
}: DifferentialFieldProps) {
  const cellNames = {
    segmentedNeutrophils: 'SEG',
    bandNeutrophils: 'BAND',
    lymphocytes: 'LYM',
    monocytes: 'MONO',
    basophils: 'BASO',
    reticulocytes: 'RET',
    eosinophils: 'EOS',
    nrbc: 'NRBC'
  };

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={() => onIncrement(field.key, field.sound)}
        disabled={totalCells >= 100}
        className="relative aspect-square bg-vet-light hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-md border border-vet-muted/30"
      >
        <div className="absolute inset-1 rounded-md overflow-hidden border-2 border-vet-primary/40 group-hover:border-vet-primary/70 transition-colors duration-300">
          <img 
            src={field.image} 
            alt={field.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-1">
          <div className="self-start text-[8px] sm:text-[10px] font-bold text-white bg-vet-primary rounded-sm px-1 py-0.5 backdrop-blur-sm border border-vet-primary/30 shadow-lg">
            {cellNames[field.key]}
          </div>
          <div className="self-end bg-vet-primary rounded-sm px-1 py-0.5 text-white shadow-lg border border-vet-primary/20">
            <div className="text-xs sm:text-sm font-bold leading-none">
              {count}
            </div>
            <div className="text-[8px] sm:text-[10px] opacity-90 leading-none">
              {percentage}%
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="text-center">
      <label className="block text-vet-text text-xs font-medium mb-1 leading-tight">
        {field.label}
      </label>
      <button
        type="button"
        onClick={() => onIncrement(field.key, field.sound)}
        disabled={totalCells >= 100}
        className="relative w-full aspect-square bg-vet-light hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-md mb-1 border border-vet-muted/30"
      >
        <div className="absolute inset-1 rounded-md overflow-hidden border-2 border-vet-primary/40 group-hover:border-vet-primary/70 transition-colors duration-300">
          <img 
            src={field.image} 
            alt={field.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-1">
          <div className="self-start text-[8px] font-bold text-white bg-vet-primary rounded-sm px-1 py-0.5 backdrop-blur-sm border border-vet-primary/30 shadow-lg">
            {cellNames[field.key]}
          </div>
          <div className="self-end bg-vet-primary rounded-sm px-1 py-0.5 text-white shadow-lg border border-vet-primary/20">
            <div className="text-sm font-bold leading-none">
              {count}
            </div>
            <div className="text-[8px] opacity-90 leading-none">
              {percentage}%
            </div>
          </div>
        </div>
      </button>
      <div className="text-xs space-y-0.5">
        <p className={`text-[10px] ${isOutOfRange(absolute, field.key) ? 'text-vet-danger' : 'text-vet-accent'}`}>
          {totalWhiteCells > 0 ? absolute : "0.0"}
          <span className="text-vet-muted/70"> x10³/μL</span>
        </p>
        <p className="text-[10px] text-vet-muted/70 leading-tight">
          Normal: {normalValues[species][field.key][0]} - {normalValues[species][field.key][1]}
        </p>
      </div>
    </div>
  );
}