// src/views/patient/components/AdminActionsSection.tsx
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import type { Patient } from "../../types";

interface AdminActionsSectionProps {
  patient: Patient;
  onDelete: () => void;
  isDeleting?: boolean;
  // ← Quitamos onEdit de aquí
}

export default function AdminActionsSection({ 
  patient, 
  onDelete, 
  isDeleting = false 
}: AdminActionsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-vet-text mb-3">
        Administrar
      </h3>
      <div className="space-y-2">
        <Link
          to={`/patients/edit/${patient._id}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-vet-primary/10 hover:bg-vet-primary hover:text-white text-vet-primary transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Editar información
        </Link>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isDeleting ? (
            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {isDeleting ? "Eliminando..." : "Eliminar mascota"}
        </button>
      </div>
    </div>
  );
}