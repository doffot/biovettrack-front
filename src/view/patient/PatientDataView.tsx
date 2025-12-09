// src/view/patient/PatientDataView.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PawPrint, User, Calendar, Weight, Clock } from "lucide-react";
import { getPatientById } from "../../api/patientAPI";
// import { extractId } from "../../utils/extractId";
import { getOwnersById } from "../../api/OwnerAPI";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function PatientDataView() {
  const { patientId } = useParams<{ patientId: string }>();

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "Sin edad";

    const bd = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - bd.getFullYear();
    let months = today.getMonth() - bd.getMonth();

    if (today.getDate() < bd.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      if (months > 0) {
        return `${years} año${years !== 1 ? "s" : ""} y ${months} mes${months !== 1 ? "es" : ""}`;
      } else {
        return `${years} año${years !== 1 ? "s" : ""}`;
      }
    }

    if (months > 0) {
      return `${months} mes${months !== 1 ? "es" : ""}`;
    }

    return "< 1 mes";
  };

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: owner } = useQuery({
    queryKey: ["owner", patient?.owner],
    queryFn: async () => {
      if (!patient?.owner) throw new Error("No owner data");
      const ownerId = typeof patient.owner === "string" ? patient.owner : patient.owner._id;
      return getOwnersById(ownerId);
    },
    enabled: !!patient?.owner,
  });

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10 text-vet-muted">
        No se encontraron datos.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">

        {/* Header con nombre */}
        <div className="bg-gradient-to-r from-vet-primary/5 to-violet-600/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vet-primary/10 rounded-lg">
              <PawPrint className="w-5 h-5 text-vet-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-vet-muted uppercase tracking-wide">Mascota</p>
              <h2 className="text-lg font-bold text-vet-text">{patient.name}</h2>
            </div>
          </div>
          {patient.mainVet && (
            <div className="text-right">
              <p className="text-xs font-medium text-vet-muted uppercase tracking-wide">Veterinario</p>
              <p className="text-sm font-semibold text-vet-primary">{patient.referringVet}</p>
            </div>
          )}
        </div>

        {/* Grid de información principal */}
        <div className="p-6 space-y-4">

          {/* Primera fila - Datos de identidad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard
              label="Raza"
              value={patient.breed || "-"}
              primary
            />
            <InfoCard
              label="Especie"
              value={patient.species}
            />
            <InfoCard
              label="Color"
              value={patient.color || "-"}
            />
            <InfoCard
              label="Sexo"
              value={patient.sex}
            />
          </div>

          {/* Segunda fila - Datos biológicos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard
              label="Peso"
              value={patient.weight ? `${patient.weight} kg` : "-"}
              icon={<Weight className="w-4 h-4" />}
            />
            <InfoCard
              label="Edad"
              value={calculateAge(patient.birthDate)}
              icon={<Clock className="w-4 h-4" />}
            />
            <InfoCard
              label="Identificación"
              value={patient.identification || "-"}
            />
            <InfoCard
              label="Nacimiento"
              value={patient.birthDate ? formatDate(patient.birthDate) : "-"}
              icon={<Calendar className="w-4 h-4" />}
              compact
            />
          </div>
        </div>

        {/* Propietario */}
        {owner && (
          <>
            <div className="border-t border-gray-100"></div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-600/10 rounded-lg">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-sm font-bold text-vet-text uppercase tracking-wide">Propietario</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OwnerField label="Nombre" value={owner.name} />
                <OwnerField label="WhatsApp" value={owner.contact || "-"} />
              </div>

              <p className="text-xs text-vet-muted mt-4 text-center bg-gray-50 rounded-md py-2">
                Para más detalles, visita <span className="font-semibold text-vet-primary">"Datos del Cliente"</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente reutilizable para campos de información
interface InfoCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  primary?: boolean;
  compact?: boolean;
}

function InfoCard({ label, value, icon, primary, compact }: InfoCardProps) {
  return (
    <div
      className={`rounded-lg p-3 flex flex-col justify-between ${
        primary
          ? "bg-vet-primary/10 border border-vet-primary/20"
          : "bg-gray-50 border border-gray-200"
      } ${compact ? "col-span-1" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <span className={primary ? "text-vet-primary" : "text-violet-600"}>
            {icon}
          </span>
        )}
        <span className="text-xs font-medium text-vet-muted uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span
        className={`text-sm font-semibold capitalize ${
          primary ? "text-vet-primary" : "text-vet-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// Componente para datos del propietario
interface OwnerFieldProps {
  label: string;
  value: string;
}

function OwnerField({ label, value }: OwnerFieldProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
        {label}
      </span>
      <span className="text-sm font-semibold text-vet-text bg-white border border-gray-200 rounded-md px-3 py-2">
        {value}
      </span>
    </div>
  );
}