// src/views/patient/components/PatientDetailHeader.tsx
import { Link } from "react-router-dom";
import { PawPrint, Edit, ArrowLeft } from "lucide-react";
import type { Patient } from "../../types";

interface PatientDetailHeaderProps {
  patient: Patient;
  hasActiveAppointments: boolean;
}

export default function PatientDetailHeader({ patient, hasActiveAppointments }: PatientDetailHeaderProps) {
  return (
    <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/owners/${patient?.owner}`}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Volver al propietario"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-vet-primary/10 rounded">
                <PawPrint className="w-4 h-4 text-vet-primary" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-vet-text">
                  {patient.name}
                </h1>
                {hasActiveAppointments && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    Cita Programada
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/patients/edit/${patient._id}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white font-medium transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>
    </div>
  );
}