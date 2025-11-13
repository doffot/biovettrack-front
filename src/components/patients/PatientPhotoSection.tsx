// src/views/patient/components/PatientPhotoSection.tsx
import { Camera } from "lucide-react";
import { PawPrint } from "lucide-react";
import type { Patient } from "../../types";

interface PatientPhotoSectionProps {
  patient: Patient;
  onEditPhoto: () => void;
}

export default function PatientPhotoSection({ patient, onEditPhoto }: PatientPhotoSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="relative group mb-3">
        {patient.photo ? (
          <img
            src={patient.photo}
            alt={patient.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-vet-light rounded-lg flex items-center justify-center">
            <PawPrint className="w-16 h-16 text-vet-primary/30" />
          </div>
        )}
        <button
          onClick={onEditPhoto}
          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-vet-text mb-1">
          {patient.name}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-vet-muted mb-2">
          <span className="px-2 py-0.5 bg-vet-primary/10 text-vet-primary rounded-full font-medium">
            {patient.species}
          </span>
          <span>•</span>
          <span>{patient.sex === "Macho" ? "♂" : "♀"}</span>
        </div>
      </div>
    </div>
  );
}