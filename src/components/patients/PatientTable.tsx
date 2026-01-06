// src/views/patients/components/PatientTable.tsx
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
    <div className="bg-white rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Paciente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Especie / Raza
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Propietario
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Edad
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Peso
            </th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map((patient) => (
            <tr
              key={patient._id}
              className="group hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onNavigate(patient._id)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(patient._id)}
                  onChange={(e) => onSelectOne(patient._id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {patient.photo ? (
                    <img
                      src={patient.photo}
                      alt={patient.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-vet-light flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-vet-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-vet-text">{patient.name}</p>
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
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-vet-text">
                {patient.species}
                {patient.breed && (
                  <span className="text-vet-muted"> · {patient.breed}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-vet-text">{patient.ownerName}</td>
              <td className="px-4 py-3 text-sm text-vet-muted">
                {calculateAge(patient.birthDate)}
              </td>
              <td className="px-4 py-3 text-sm text-vet-muted">
                {patient.weight ? `${patient.weight} kg` : "—"}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(patient)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}