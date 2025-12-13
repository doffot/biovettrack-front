// src/views/patients/PatientDataView.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Calendar, 
  Stethoscope, 
  Phone, 
  Mail, 
  CreditCard,
  FileText,
  Clipboard,
  ExternalLink,
  PawPrint,
  Scissors
} from "lucide-react";
import { getPatientById } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";

export default function PatientDataView() {
  const { patientId } = useParams<{ patientId: string }>();

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const ownerId = patient?.owner 
    ? (typeof patient.owner === "string" ? patient.owner : patient.owner._id)
    : null;

  const { data: owner, isLoading: loadingOwner } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-vet-muted">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <PawPrint className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-vet-muted">No se encontraron datos del paciente.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-vet-text">Expediente Completo</h2>
        <p className="text-sm text-vet-muted mt-0.5">
          Información detallada de {patient.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============ INFORMACIÓN MÉDICA ============ */}
        <div className="bg-gradient-to-br from-vet-light/30 to-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-white/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl">
                <Clipboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-vet-text">Datos Médicos</h3>
                <p className="text-xs text-vet-muted">Información clínica</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Fecha de nacimiento */}
            <InfoRow 
              icon={<Calendar className="w-4 h-4" />}
              label="Fecha de Nacimiento"
              value={patient.birthDate ? formatDate(patient.birthDate) : "No registrada"}
            />

            {/* Identificación */}
            <InfoRow 
              icon={<CreditCard className="w-4 h-4" />}
              label="Identificación (Chip/Tatuaje)"
              value={patient.identification || "Sin identificación"}
              highlight={!!patient.identification}
            />

            {/* Veterinario referido */}
            <InfoRow 
              icon={<Stethoscope className="w-4 h-4" />}
              label="Veterinario"
              value={patient.referringVet || "No asignado"}
            />

            {/* Señas particulares */}
            {patient.color && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
                      Señas Particulares / Color
                    </p>
                    <p className="text-sm text-vet-text bg-amber-50/50 rounded-lg px-3 py-2 border border-amber-100">
                      {patient.color}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ PROPIETARIO ============ */}
        <div className="bg-gradient-to-br from-purple-50/30 to-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-white/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-vet-text">Propietario</h3>
                  <p className="text-xs text-vet-muted">Datos de contacto</p>
                </div>
              </div>
              {ownerId && (
                <Link
                  to={`/owners/${ownerId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-medium transition-colors"
                >
                  Ver perfil
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
          
          <div className="p-5">
            {loadingOwner ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : owner ? (
              <div className="space-y-4">
                {/* Nombre */}
                <InfoRow 
                  icon={<User className="w-4 h-4" />}
                  label="Nombre Completo"
                  value={owner.name}
                  highlight
                />

                {/* Teléfono/WhatsApp */}
                <InfoRow 
                  icon={<Phone className="w-4 h-4" />}
                  label="Teléfono / WhatsApp"
                  value={owner.contact || "No registrado"}
                  action={
                    owner.contact ? (
                      <a
                        href={`https://wa.me/${owner.contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md text-xs font-medium transition-colors"
                      >
                        WhatsApp
                      </a>
                    ) : null
                  }
                />

                {/* Email */}
                {owner.email && (
                  <InfoRow 
                    icon={<Mail className="w-4 h-4" />}
                    label="Correo Electrónico"
                    value={owner.email}
                    action={
                      <a
                        href={`mailto:${owner.email}`}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium transition-colors"
                      >
                        Enviar
                      </a>
                    }
                  />
                )}

                {/* Cédula/RIF */}
                {owner.nationalId && (
                  <InfoRow 
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Cédula / RIF"
                    value={owner.nationalId}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-vet-muted">Sin información del propietario</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ ACCESOS RÁPIDOS ============ */}
      <div className="bg-gradient-to-r from-vet-light/50 to-purple-50/50 border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-vet-text mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <QuickAction 
            to={`/patients/${patientId}/consultations`}
            icon={<Stethoscope className="w-5 h-5" />}
            label="Consulta"
            color="blue"
          />
          <QuickAction 
            to={`/patients/${patientId}/vaccinations`}
            icon={<Calendar className="w-5 h-5" />}
            label="Vacunas"
            color="green"
          />
          <QuickAction 
            to={`/patients/${patientId}/lab-exams`}
            icon={<FileText className="w-5 h-5" />}
            label="Laboratorio"
            color="purple"
          />
          <QuickAction 
            to={`/patients/${patientId}/grooming-services`}
            icon={<Scissors className="w-5 h-5" />}
            label="Peluquería"
            color="pink"
          />
          <QuickAction 
            to={`/patients/${patientId}/appointments/create`}
            icon={<Calendar className="w-5 h-5" />}
            label="Agendar Cita"
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTES AUXILIARES ============

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  action?: React.ReactNode;
}

function InfoRow({ icon, label, value, highlight, action }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-vet-primary/10' : 'bg-gray-100'}`}>
        <span className={highlight ? 'text-vet-primary' : 'text-gray-500'}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-vet-muted uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-sm font-semibold truncate ${highlight ? 'text-vet-primary' : 'text-vet-text'}`}>
          {value}
        </p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'pink';
}

function QuickAction({ to, icon, label, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-100',
    pink: 'bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-100',
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-soft ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}