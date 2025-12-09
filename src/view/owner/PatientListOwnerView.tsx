// src/views/owners/PatientListOwnerView.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PawPrint, ChevronRight, Calendar, Weight } from "lucide-react";
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
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <PawPrint className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">Sin mascotas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map((pet) => (
        <Link
          key={pet._id}
          to={`/patients/${pet._id}`}
          className="block rounded-xl bg-gray-50 hover:bg-vet-primary/5 border border-transparent hover:border-vet-primary/20 transition-all duration-200 group"
        >
          {/* Mobile: Layout vertical compacto */}
          <div className="flex items-center gap-3 p-3 sm:hidden">
            {/* Foto */}
            {pet.photo ? (
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-6 h-6 text-vet-primary" />
              </div>
            )}

            {/* Info compacta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 truncate group-hover:text-vet-primary transition-colors">
                  {pet.name}
                </h4>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    pet.sex === "Macho"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {pet.sex === "Macho" ? "M" : "H"}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{pet.species}</span>
                {pet.breed && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="truncate">{pet.breed}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {calculateAge(pet.birthDate)}
                </span>
                {pet.weight && (
                  <span className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {pet.weight} kg
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-vet-primary transition-colors flex-shrink-0" />
          </div>

          {/* Tablet/Desktop: Layout horizontal expandido */}
          <div className="hidden sm:flex items-center gap-4 p-4">
            {/* Foto */}
            {pet.photo ? (
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-7 h-7 text-vet-primary" />
              </div>
            )}

            {/* Nombre y sexo */}
            <div className="min-w-0 w-40">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 truncate group-hover:text-vet-primary transition-colors">
                  {pet.name}
                </h4>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                    pet.sex === "Macho"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {pet.sex === "Macho" ? "M" : "H"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{pet.species}</p>
            </div>

            {/* Raza */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Raza</p>
              <p className="text-sm text-gray-700 truncate">
                {pet.breed || "Sin especificar"}
              </p>
            </div>

            {/* Edad */}
            <div className="w-24 text-center">
              <p className="text-xs text-gray-400">Edad</p>
              <p className="text-sm text-gray-700 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {calculateAge(pet.birthDate)}
              </p>
            </div>

            {/* Peso */}
            <div className="w-20 text-center">
              <p className="text-xs text-gray-400">Peso</p>
              <p className="text-sm text-gray-700 flex items-center justify-center gap-1">
                <Weight className="w-3.5 h-3.5 text-gray-400" />
                {pet.weight ? `${pet.weight} kg` : "—"}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-vet-primary transition-colors flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}