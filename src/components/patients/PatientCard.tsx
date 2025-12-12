// src/components/patients/PatientCard.tsx
import { Link } from "react-router-dom";
import { PawPrint, Calendar, Weight, User, ChevronRight } from "lucide-react";
import type { Patient, Owner } from "../../types";
import { extractId } from "../../utils/extractId";

interface PatientCardProps {
  patient: Patient;
  owners: Owner[];
  index: number;
}

export default function PatientCard({ patient, owners, index }: PatientCardProps) {
  const isCanino = patient.species.toLowerCase() === "canino";

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

  const speciesConfig = {
    canino: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      icon: "🐕",
    },
    felino: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      icon: "🐱",
    },
  };

  const config = isCanino ? speciesConfig.canino : speciesConfig.felino;

  return (
    <Link
      to={`/patients/${patient._id}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`
          relative overflow-hidden
          bg-white rounded-xl border ${config.border}
          p-4 sm:p-5
          transition-all duration-300 ease-out
          hover:shadow-card hover:border-vet-primary/30
          hover:-translate-y-0.5
          cursor-pointer
          animate-fade-in-up
        `}
      >
        {/* Gradient accent line */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 w-1 
            bg-gradient-to-b ${config.gradient}
            transition-all duration-300
            group-hover:w-1.5
          `}
        />

        {/* Content Grid */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`
                w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden
                ${config.bg} 
                flex items-center justify-center
                transition-transform duration-300
                group-hover:scale-105
                shadow-soft
              `}
            >
              {patient.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">{config.icon}</span>
              )}
            </div>
            {/* Species badge */}
            <div
              className={`
                absolute -bottom-1 -right-1 
                w-6 h-6 rounded-full 
                bg-gradient-to-br ${config.gradient}
                flex items-center justify-center
                shadow-md
              `}
            >
              <PawPrint className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            {/* Name & Breed */}
            <div className="sm:col-span-4 min-w-0">
              <h3
                className={`
                  font-bold text-vet-text font-montserrat text-base sm:text-lg
                  truncate
                  transition-colors duration-200
                  group-hover:text-vet-primary
                `}
              >
                {patient.name}
              </h3>
              <p className="text-xs sm:text-sm text-vet-muted truncate">
                {patient.breed || patient.species}
                {patient.sex && (
                  <span className="ml-1.5">
                    {patient.sex === "Macho" ? "♂" : "♀"}
                  </span>
                )}
              </p>
            </div>

            {/* Owner - Hidden on mobile */}
            <div className="hidden sm:flex sm:col-span-3 items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-vet-light/50">
                <User className="w-3.5 h-3.5 text-vet-accent" />
              </div>
              <span className="text-sm text-vet-text truncate">{getOwnerName()}</span>
            </div>

            {/* Age */}
            <div className="hidden sm:flex sm:col-span-2 items-center gap-2">
              <div className="p-1.5 rounded-lg bg-vet-light/50">
                <Calendar className="w-3.5 h-3.5 text-vet-accent" />
              </div>
              <span className="text-sm text-vet-text font-medium">{calculateAge()}</span>
            </div>

            {/* Weight */}
            <div className="hidden lg:flex lg:col-span-2 items-center gap-2">
              <div className="p-1.5 rounded-lg bg-vet-light/50">
                <Weight className="w-3.5 h-3.5 text-vet-accent" />
              </div>
              <span className="text-sm text-vet-text font-medium">
                {patient.weight ? `${patient.weight} kg` : "—"}
              </span>
            </div>

            {/* Mobile info row */}
            <div className="flex sm:hidden items-center gap-3 text-xs text-vet-muted">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {getOwnerName()}
              </span>
              <span>•</span>
              <span>{calculateAge()}</span>
              {patient.weight && (
                <>
                  <span>•</span>
                  <span>{patient.weight} kg</span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div
            className={`
              flex-shrink-0 p-2 rounded-xl
              bg-vet-light/50 
              transition-all duration-300
              group-hover:bg-vet-primary group-hover:shadow-md
            `}
          >
            <ChevronRight
              className={`
                w-5 h-5 text-vet-muted
                transition-all duration-300
                group-hover:text-white group-hover:translate-x-0.5
              `}
            />
          </div>
        </div>

        {/* Hover glow effect */}
        <div
          className="
            absolute inset-0 opacity-0 
            bg-gradient-to-r from-vet-primary/5 to-transparent
            transition-opacity duration-300
            group-hover:opacity-100
            pointer-events-none
          "
        />
      </div>
    </Link>
  );
}