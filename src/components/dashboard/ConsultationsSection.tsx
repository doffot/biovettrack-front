// src/views/dashboard/components/ConsultationsSection.tsx
import { useState, useMemo } from "react";
import { Stethoscope, ChevronRight, FileText, Eye, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "../../utils/dashboardUtils";
import { getPatients } from "../../api/patientAPI";
import ConsultationModal from "../../components/consultations/ConsultationModal";
import type { Consultation } from "../../types/consultation";
import type { Patient } from "../../types/patient";

interface ConsultationsSectionProps {
  consultations: Consultation[];
}

export function ConsultationsSection({ consultations }: ConsultationsSectionProps) {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const isEmpty = consultations.length === 0;

  // Obtener información de pacientes
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });

  // Crear mapa de pacientes para búsqueda rápida
  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach(patient => {
      map.set(patient._id, patient);
    });
    return map;
  }, [patients]);

  // Función para obtener info del paciente
  const getPatientInfo = (patientId: string) => {
    const patient = patientsMap.get(patientId);
    if (!patient) {
      return { 
        name: "Paciente", 
        owner: "Sin información",
        species: "Desconocido"
      };
    }
    
    const ownerName = typeof patient.owner === "object" 
      ? patient.owner.name 
      : "Sin dueño";
    
    return {
      name: patient.name,
      owner: ownerName,
      species: patient.species || "Sin especificar",
      photo: patient.photo
    };
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-vet-light overflow-hidden animate-fade-in-up">
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-vet-text flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg shadow-soft">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
            </div>
            Consultas de Hoy
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-vet-muted shadow-soft">
              {consultations.length} {consultations.length === 1 ? 'consulta' : 'consultas'}
            </span>
            <Link
              to="/consultations"
              className="text-xs text-vet-primary hover:text-vet-accent font-medium flex items-center gap-0.5 transition-colors group"
            >
              Ver todas
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {isEmpty ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-3 bg-emerald-50 rounded-full flex items-center justify-center animate-gentle-pulse">
                <Stethoscope className="w-8 h-8 text-emerald-300" />
              </div>
              <p className="text-vet-text text-sm font-medium">Sin consultas programadas</p>
              <p className="text-vet-muted text-xs mt-1">No hay consultas para hoy</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {consultations.slice(0, 3).map((consultation) => {
                const patientInfo = getPatientInfo(consultation.patientId);
                return (
                  <ConsultationItem
                    key={consultation._id}
                    consultation={consultation}
                    patientInfo={patientInfo}
                    onClick={() => setSelectedConsultation(consultation)}
                  />
                );
              })}
              
              {consultations.length > 3 && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-vet-light"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-vet-muted">
                        {consultations.length - 3} más
                      </span>
                    </div>
                  </div>
                  {consultations.slice(3).map((consultation) => {
                    const patientInfo = getPatientInfo(consultation.patientId);
                    return (
                      <ConsultationItem
                        key={consultation._id}
                        consultation={consultation}
                        patientInfo={patientInfo}
                        onClick={() => setSelectedConsultation(consultation)}
                      />
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedConsultation && (
        <ConsultationModal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          consultation={selectedConsultation}
        />
      )}
    </>
  );
}

// Componente interno mejorado con información del paciente
interface ConsultationItemProps {
  consultation: Consultation;
  patientInfo: {
    name: string;
    owner: string;
    species: string;
    photo?: string | null;
  };
  onClick: () => void;
}

function ConsultationItem({ consultation, patientInfo, onClick }: ConsultationItemProps) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200/50 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group animate-fadeIn"
    >
      {/* Foto o icono del paciente */}
      <div className="relative">
        {patientInfo.photo ? (
          <img
            src={patientInfo.photo}
            alt={patientInfo.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-green-50 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-vet-text text-sm truncate">
            {patientInfo.name}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
            {patientInfo.species}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-vet-muted">
          <User className="w-3 h-3" />
          <span className="truncate">{patientInfo.owner}</span>
        </div>
        <p className="text-xs text-emerald-600 mt-0.5 truncate">
          {consultation.presumptiveDiagnosis}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-semibold text-emerald-600">
            ${consultation.cost.toFixed(0)}
          </p>
          <p className="text-xs text-vet-muted">
            {formatTime(consultation.consultationDate)}
          </p>
        </div>
        <button
          onClick={onClick}
          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 transition-colors group-hover:opacity-100 lg:opacity-0"
          title="Ver detalle"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}