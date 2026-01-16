// components/LabExamHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, PawPrint, Calendar, TestTube, Scissors, Camera } from "lucide-react";
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
  const navigate = useNavigate();
  return (
    <div className="fixed top-14 left-0 right-0 lg:top-16 lg:left-64 z-30 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-700 text-vet-muted hover:text-vet-accent transition-all duration-200"
              title="Volver al propietario"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-vet-text">
                  {patientLoading ? "Cargando..." : patient?.name || "Paciente"}
                </h1>
                {hasActiveAppointments && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-400 text-xs font-semibold rounded-full border border-green-700/50 flex items-center gap-1.5 shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Cita Activa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patientId}/appointments/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/20 hover:bg-purple-600 hover:text-white text-purple-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Nueva cita"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Cita</span>
            </Link>

            <Link
              to={`/patients/${patientId}/lab-exams`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-900/20 hover:bg-green-600 hover:text-white text-green-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Exámenes de laboratorio"
            >
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Exámenes</span>
            </Link>

            <Link
              to={`/patients/${patientId}/grooming-services/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900/20 hover:bg-blue-600 hover:text-white text-blue-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              title="Servicio de peluquería"
            >
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Peluquería</span>
            </Link>

            <button
              onClick={() => toast.info("Función de cambio de foto en desarrollo")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 hover:text-white text-slate-400 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
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