// src/components/patients/PatientCard.tsx
import { Link } from "react-router-dom";
import { PawPrint, ChevronRight } from "lucide-react";
import type { Patient, Owner } from "../../types";
import { extractId } from "../../utils/extractId";

interface PatientCardProps {
  patient: Patient;
  owners: Owner[];
}

export default function PatientCard({ patient, owners }: PatientCardProps) {
  const getOwnerName = (): string => {
    if (!patient.owner) return "Sin propietario";

    if (typeof patient.owner !== "string" && "name" in patient.owner) {
      return patient.owner.name;
    }

    const ownerId = extractId(patient.owner);
    const owner = owners.find((o) => o._id === ownerId);
    return owner?.name || "Sin propietario";
  };

  const calculateAge = (): string => {
    const today = new Date();
    const birth = new Date(patient.birthDate);
    const diffInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    if (diffInMonths < 1) return "< 1 mes";
    if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;

    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;

    if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`;
    return `${years}a ${months}m`;
  };

  return (
    <Link
      to={`/patients/${patient._id}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      {/* Foto */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-medium text-vet-text truncate group-hover:text-vet-primary transition-colors">
            {patient.name}
          </h4>
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
          {calculateAge()}
          {patient.weight && ` · ${patient.weight} kg`}
          {" · "}
          {getOwnerName()}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-vet-primary transition-colors flex-shrink-0" />
    </Link>
  );
}