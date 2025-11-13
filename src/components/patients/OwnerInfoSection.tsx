// src/views/patient/components/OwnerInfoSection.tsx
import { Link } from "react-router-dom";
import { User, Phone, Mail } from "lucide-react";
import type { Owner } from "../../types";

interface OwnerInfoSectionProps {
  owner: Owner | undefined;
  isLoading: boolean;
}

export default function OwnerInfoSection({ owner, isLoading }: OwnerInfoSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-vet-muted text-sm">
          No se encontró información del propietario
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-vet-primary" />
        <h3 className="text-sm font-semibold text-vet-text">
          Propietario
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vet-primary/10 flex items-center justify-center border border-vet-primary/20">
            <span className="text-vet-primary font-bold text-xs">
              {owner.name
                ? owner.name
                    .split(" ")
                    .map((n: string) => n.charAt(0))
                    .join("")
                    .toUpperCase()
                : "N/A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-vet-text font-semibold text-sm truncate">
              {owner.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-vet-muted">
              <Phone className="w-3 h-3" />
              <span>{owner.contact}</span>
            </div>
            {owner.email && (
              <div className="flex items-center gap-1 text-xs text-vet-muted">
                <Mail className="w-3 h-3" />
                <span className="truncate">{owner.email}</span>
              </div>
            )}
          </div>
        </div>
        <Link
          to={`/owners/${owner._id}`}
          className="w-full text-center py-1.5 text-xs bg-vet-primary/10 hover:bg-vet-primary hover:text-white text-vet-primary rounded-lg transition-colors font-medium"
        >
          Ver perfil completo
        </Link>
      </div>
    </div>
  );
}