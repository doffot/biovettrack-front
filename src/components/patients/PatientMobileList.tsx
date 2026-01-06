// src/views/patients/components/PatientMobileList.tsx
import { Trash2, ChevronRight, PawPrint } from "lucide-react";
import type { PatientWithOwner } from "../../view/patient/PatientListView";
import type { Patient } from "../../types";

interface Props {
  patients: PatientWithOwner[];
  selectedIds: Set<string>;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientMobileList({
  patients,
  selectedIds,
  onSelectOne,
  onNavigate,
  onDelete,
}: Props) {
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const today = new Date();
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    if (months < 1) return "< 1 mes";
    if (months < 12) return `${months} mes${months > 1 ? "es" : ""}`;
    const years = Math.floor(months / 12);
    return `${years} año${years > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-2">
      {patients.map((patient) => (
        <div key={patient._id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(patient._id)}
              onChange={(e) => onSelectOne(patient._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
            />

            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-vet-light flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-5 h-5 text-vet-primary" />
              </div>
            )}

            <div className="flex-1 min-w-0" onClick={() => onNavigate(patient._id)}>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-vet-text truncate">{patient.name}</h3>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    patient.sex === "Macho"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-pink-50 text-pink-600"
                  }`}
                >
                  {patient.sex === "Macho" ? "M" : "H"}
                </span>
              </div>
              <p className="text-sm text-vet-muted">
                {patient.species}
                {patient.breed && ` · ${patient.breed}`}
                {" · "}
                {calculateAge(patient.birthDate)}
                {patient.weight && ` · ${patient.weight} kg`}
              </p>
              <p className="text-sm text-vet-muted">{patient.ownerName}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onDelete(patient)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate(patient._id)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}