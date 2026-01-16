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
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sky-soft flex items-center justify-center">
          <PawPrint className="w-6 h-6 text-vet-muted" />
        </div>
        <p className="text-vet-muted text-sm">Sin mascotas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patients.map((pet) => (
        <Link
          key={pet._id}
          to={`/patients/${pet._id}`}
          className="flex items-center gap-4 p-3 rounded-xl bg-sky-soft/50 hover:bg-sky-soft border border-transparent hover:border-vet-primary/20 transition-all duration-200 group"
        >
          {/* Foto */}
          {pet.photo ? (
            <img
              src={pet.photo}
              alt={pet.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-2 ring-vet-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-vet-secondary/30 flex items-center justify-center flex-shrink-0 ring-2 ring-vet-primary/20">
              <PawPrint className="w-5 h-5 text-vet-accent" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-vet-text truncate group-hover:text-vet-accent transition-colors">
                {pet.name}
              </h4>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  pet.sex === "Macho"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-pink-500/20 text-pink-400"
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
          <ChevronRight className="w-4 h-4 text-vet-muted group-hover:text-vet-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}