// src/views/patient/components/QuickActionsSection.tsx
import { Link } from "react-router-dom";
import { TestTube, Scissors, Calendar, Camera } from "lucide-react";

interface QuickActionsSectionProps {
  patientId: string | undefined;
  onEditPhoto: () => void;
}

export default function QuickActionsSection({ patientId, onEditPhoto }: QuickActionsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-vet-text mb-3">
        Acciones
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <Link
          to={`/patients/${patientId}/lab-exams`}
          className="flex flex-col items-center p-2 rounded-lg bg-green-50 hover:bg-green-500 hover:text-white text-green-600 transition-colors group"
        >
          <TestTube className="w-4 h-4 mb-1" />
          <span className="text-xs font-medium text-center">
            Exámenes
          </span>
        </Link>

        <Link
          to={`/patients/${patientId}/grooming-services/create`}
          className="flex flex-col items-center p-2 rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 transition-colors group"
        >
          <Scissors className="w-4 h-4 mb-1" />
          <span className="text-xs font-medium text-center">
            Peluquería
          </span>
        </Link>

        <Link
          to={`/patients/${patientId}/appointments/create`}
          className="flex flex-col items-center p-2 rounded-lg bg-purple-50 hover:bg-purple-500 hover:text-white text-purple-600 transition-colors group"
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-xs font-medium text-center">
            Cita
          </span>
        </Link>

        <button
          onClick={onEditPhoto}
          className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-500 hover:text-white text-gray-600 transition-colors group"
        >
          <Camera className="w-4 h-4 mb-1" />
          <span className="text-xs font-medium text-center">
            Foto
          </span>
        </button>
      </div>
    </div>
  );
}