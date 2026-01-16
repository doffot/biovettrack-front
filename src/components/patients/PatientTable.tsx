import { Trash2, ChevronRight, PawPrint } from "lucide-react";
import type { PatientWithOwner } from "../../view/patient/PatientListView";
import type { Patient } from "../../types";

interface Props {
  patients: PatientWithOwner[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  selectedIds,
  allSelected,
  onSelectAll,
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
    <div className="bg-[var(--color-card)] rounded-xl overflow-hidden border border-[var(--color-border)]">
      <table className="w-full">
        <thead className="bg-[var(--color-hover)] border-b border-[var(--color-border)]">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-vet-primary)] focus:ring-[var(--color-vet-primary)] bg-[var(--color-card)] cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide">
              Paciente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide">
              Especie / Raza
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide">
              Propietario
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide">
              Edad
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide">
              Peso
            </th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {patients.map((patient) => (
            <tr
              key={patient._id}
              className="group hover:bg-[var(--color-hover)] cursor-pointer transition-colors"
              onClick={() => onNavigate(patient._id)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(patient._id)}
                  onChange={(e) => onSelectOne(patient._id, e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-vet-primary)] focus:ring-[var(--color-vet-primary)] bg-[var(--color-card)] cursor-pointer"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {patient.photo ? (
                    <img
                      src={patient.photo}
                      alt={patient.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[var(--color-border)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                      <PawPrint className="w-5 h-5 text-[var(--color-vet-accent)]" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-vet-text)]">{patient.name}</p>
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
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-vet-text)]">
                {patient.species}
                {patient.breed && (
                  <span className="text-[var(--color-vet-muted)]"> · {patient.breed}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-vet-text)]">{patient.ownerName}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-vet-muted)]">
                {calculateAge(patient.birthDate)}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-vet-muted)]">
                {patient.weight ? `${patient.weight} kg` : "—"}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(patient)}
                    className="p-1.5 rounded hover:bg-red-600/10 text-[var(--color-vet-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[var(--color-vet-muted)] opacity-30 ml-1" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}