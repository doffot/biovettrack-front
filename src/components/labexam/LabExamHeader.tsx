// components/LabExamHeader.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, PawPrint, Calendar, TestTube, Scissors, Camera } from "lucide-react";
import { extractId } from "../../utils/extractId";
import type { Patient } from "../../types";
import { toast } from "../Toast";

interface LabExamHeaderProps {
  patientId: string;
  patient: Patient | undefined;
  patientLoading: boolean;
  hasActiveAppointments: boolean;
}

export function LabExamHeader({ 
  patientId, 
  patient, 
  patientLoading, 
  hasActiveAppointments 
}: LabExamHeaderProps) {
  return (
    <div className="fixed top-14 left-0 right-0 lg:top-16 lg:left-64 z-30 bg-white/95 backdrop-blur-sm border-b border-vet-muted/20 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={patient?.owner ? `/owners/${extractId(patient.owner)}` : "/patients"}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-vet-light text-vet-muted hover:text-vet-primary transition-all duration-200"
              title="Volver al propietario"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-vet-text">
                  {patientLoading ? "Cargando..." : patient?.name || "Paciente"}
                </h1>
                {hasActiveAppointments && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1.5 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Cita Activa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patientId}/appointments/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-500 hover:text-white text-purple-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Nueva cita"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Cita</span>
            </Link>

            <Link
              to={`/patients/${patientId}/lab-exams`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 hover:bg-green-500 hover:text-white text-green-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Exámenes de laboratorio"
            >
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Exámenes</span>
            </Link>

            <Link
              to={`/patients/${patientId}/grooming-services/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Servicio de peluquería"
            >
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Peluquería</span>
            </Link>

            <button
              onClick={() => toast.info("Función de cambio de foto en desarrollo")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-600 hover:text-white text-gray-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Cambiar foto"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}