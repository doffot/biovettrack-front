// src/views/patient/components/PatientInfoSection.tsx

import type { Patient } from "../../types";

interface PatientInfoSectionProps {
  patient: Patient;
}

export default function PatientInfoSection({ patient }: PatientInfoSectionProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = () => {
    if (!patient?.birthDate) return "";
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (years > 0) return `${years} año${years !== 1 ? "s" : ""}`;
    if (months > 0) return `${months} mes${months !== 1 ? "es" : ""}`;
    return `${Math.max(0, days)} día${days !== 1 ? "s" : ""}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-vet-text mb-3">
        Información Básica
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-vet-muted">Fecha nacimiento:</span>
          <span className="text-vet-text font-medium">
            {formatDate(patient.birthDate)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-vet-muted">Edad:</span>
          <span className="text-vet-text font-medium">
            {calculateAge()}
          </span>
        </div>
        
        {patient.weight && (
          <div className="flex justify-between">
            <span className="text-vet-muted">Peso:</span>
            <span className="text-vet-text font-medium">
              {patient.weight} kg
            </span>
          </div>
        )}
        
        {patient.breed && (
          <div className="flex justify-between">
            <span className="text-vet-muted">Raza:</span>
            <span className="text-vet-text font-medium">
              {patient.breed}
            </span>
          </div>
        )}
        
        {patient.color && (
          <div className="flex justify-between">
            <span className="text-vet-muted">Color:</span>
            <span className="text-vet-text font-medium">
              {patient.color}
            </span>
          </div>
        )}
        
        {patient.identification && (
          <div className="flex justify-between">
            <span className="text-vet-muted">Identificación:</span>
            <span className="text-vet-text font-medium">
              {patient.identification}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}