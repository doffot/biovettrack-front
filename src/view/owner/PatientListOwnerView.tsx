// src/views/owners/PatientListOwnerView.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PawPrint, ChevronRight } from "lucide-react";
import { getPatientsByOwner } from "../../api/patientAPI";
import type { Patient } from "../../types";

interface PatientListViewProps {
  ownerId: string;
  ownerName: string;
}

export default function PatientListView({ ownerId }: PatientListViewProps) {
  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["patients", { ownerId }],
    queryFn: () => getPatientsByOwner(ownerId),
    enabled: !!ownerId,
  });

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months < 0 ? 12 + months : months} meses`;
    }
    if (years === 1 && months < 0) {
      return `${12 + months} meses`;
    }
    return `${years} año${years > 1 ? "s" : ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <PawPrint className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">Sin mascotas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patients.map((pet) => (
        <Link
          key={pet._id}
          to={`/patients/${pet._id}`}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          {/* Foto */}
          {pet.photo ? (
            <img
              src={pet.photo}
              alt={pet.name}
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
                {pet.name}
              </h4>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  pet.sex === "Macho"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-pink-50 text-pink-600"
                }`}
              >
                {pet.sex === "Macho" ? "M" : "H"}
              </span>
            </div>

            <p className="text-sm text-vet-muted">
              {pet.species}
              {pet.breed && ` · ${pet.breed}`}
              {" · "}
              {calculateAge(pet.birthDate)}
              {pet.weight && ` · ${pet.weight} kg`}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-vet-primary transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}