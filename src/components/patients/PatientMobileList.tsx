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
        <div 
          key={patient._id} 
          className="bg-[var(--color-card)] rounded-xl p-4 shadow-sm border border-[var(--color-border)]"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(patient._id)}
              onChange={(e) => onSelectOne(patient._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-vet-primary)] focus:ring-[var(--color-vet-primary)] bg-[var(--color-card)] cursor-pointer"
            />

            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[var(--color-border)]"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-vet-primary)]/20">
                <PawPrint className="w-5 h-5 text-[var(--color-vet-accent)]" />
              </div>
            )}

            <div className="flex-1 min-w-0" onClick={() => onNavigate(patient._id)}>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-[var(--color-vet-text)] truncate">{patient.name}</h3>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    patient.sex === "Macho"
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                      : "bg-pink-600/10 text-pink-400 border border-pink-500/20"
                  }`}
                >
                  {patient.sex === "Macho" ? "M" : "H"}
                </span>
              </div>
              <p className="text-sm text-[var(--color-vet-muted)]">
                {patient.species}
                {patient.breed && ` · ${patient.breed}`}
                {" · "}
                {calculateAge(patient.birthDate)}
                {patient.weight && ` · ${patient.weight} kg`}
              </p>
              <p className="text-sm text-[var(--color-vet-muted)]">{patient.ownerName}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onDelete(patient)}
                className="p-2 rounded-lg hover:bg-red-600/10 text-[var(--color-vet-muted)] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate(patient._id)}
                className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
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