// src/components/consultations/ConsultationModal.tsx
import { X, Calendar, Thermometer, Heart, Wind, Scale } from "lucide-react";
import type { Consultation } from "../../types/consultation";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  consultation,
}: ConsultationModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h4>
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">{children}</div>
    </div>
  );

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | boolean;
  }) => {
    if (value === undefined || value === null || value === "") return null;
    const displayValue =
      typeof value === "boolean" ? (value ? "Sí" : "No") : value;
    return (
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900 font-medium text-right max-w-[60%]">
          {displayValue}
        </span>
      </div>
    );
  };

  // Campo de texto largo (para tratamiento, diagnósticos)
  const TextField = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => {
    if (!value) return null;
    return (
      <div className="text-sm">
        <span className="text-gray-500 block mb-1">{label}</span>
        <p className="text-gray-900 bg-white p-2 rounded border border-gray-100">
          {value}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Detalle de Consulta
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(consultation.consultationDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Signos vitales  */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {consultation.temperature}°C
              </p>
              <p className="text-xs text-gray-500">Temperatura</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <Heart className="w-5 h-5 text-pink-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {consultation.heartRate} lpm
              </p>
              <p className="text-xs text-gray-500">Frec. Cardíaca</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Wind className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {consultation.respiratoryRate} rpm
              </p>
              <p className="text-xs text-gray-500">Frec. Respiratoria</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <Scale className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {consultation.weight} kg
              </p>
              <p className="text-xs text-gray-500">Peso</p>
            </div>
          </div>

          {/* Motivo de consulta */}
          <Section title="Motivo de consulta">
            <TextField label="Motivo" value={consultation.reasonForVisit} />
            <Field label="Inicio síntomas" value={consultation.symptomOnset} />
            <Field label="Evolución" value={consultation.symptomEvolution} />
          </Section>

          {/* Diagnóstico */}
          <Section title="Diagnóstico">
            <TextField
              label="Diagnóstico presuntivo"
              value={consultation.presumptiveDiagnosis}
            />
            <TextField
              label="Diagnóstico definitivo"
              value={consultation.definitiveDiagnosis}
            />
            <TextField
              label="Exámenes solicitados"
              value={consultation.requestedTests}
            />
          </Section>

          {/* Tratamiento - SECCIÓN DESTACADA */}
          <Section title="Plan de tratamiento">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {consultation.treatmentPlan}
              </p>
            </div>
          </Section>

          {/* Medicamentos actuales (si hay) */}
          {(consultation.currentTreatment || consultation.medications) && (
            <Section title="Medicación previa">
              <Field
                label="Tratamiento actual"
                value={consultation.currentTreatment}
              />
              <Field label="Medicamentos" value={consultation.medications} />
            </Section>
          )}

          {/* Estado general */}
          <Section title="Estado general">
            <Field label="Apetito" value={consultation.appetite} />
            <Field label="Esterilizado" value={consultation.isNeutered} />
            <Field label="Fiebre" value={consultation.feverSigns} />
            <Field
              label="Letargo/Debilidad"
              value={consultation.lethargyOrWeakness}
            />
            <Field
              label="Dificultad respiratoria"
              value={consultation.breathingDifficulty}
            />
            <Field
              label="Picazón/Lamido excesivo"
              value={consultation.itchingOrExcessiveLicking}
            />
          </Section>

          {/* Otros parámetros */}
          {(consultation.lymphNodes || consultation.capillaryRefillTime) && (
            <Section title="Otros parámetros">
              <Field label="Ganglios linfáticos" value={consultation.lymphNodes} />
              <Field label="TRC" value={consultation.capillaryRefillTime} />
            </Section>
          )}

          {/* Sistemas (solo si hay datos) */}
          {(consultation.integumentarySystem ||
            consultation.cardiovascularSystem ||
            consultation.respiratorySystem ||
            consultation.nervousSystem ||
            consultation.musculoskeletalSystem ||
            consultation.gastrointestinalSystem ||
            consultation.ocularSystem) && (
            <Section title="Evaluación por sistemas">
              <TextField
                label="Tegumentario"
                value={consultation.integumentarySystem}
              />
              <TextField
                label="Cardiovascular"
                value={consultation.cardiovascularSystem}
              />
              <TextField
                label="Respiratorio"
                value={consultation.respiratorySystem}
              />
              <TextField label="Nervioso" value={consultation.nervousSystem} />
              <TextField
                label="Musculoesquelético"
                value={consultation.musculoskeletalSystem}
              />
              <TextField
                label="Gastrointestinal"
                value={consultation.gastrointestinalSystem}
              />
              <TextField label="Ocular" value={consultation.ocularSystem} />
            </Section>
          )}

          {/* Digestivo/Urinario (si hay datos) */}
          {(consultation.vomiting ||
            consultation.bowelMovementFrequency ||
            consultation.stoolConsistency ||
            consultation.normalUrination) && (
            <Section title="Sistema digestivo y urinario">
              <Field label="Vómitos" value={consultation.vomiting} />
              <Field
                label="Frecuencia deposiciones"
                value={consultation.bowelMovementFrequency}
              />
              <Field
                label="Consistencia heces"
                value={consultation.stoolConsistency}
              />
              <Field
                label="Sangre/parásitos en heces"
                value={consultation.bloodOrParasitesInStool}
              />
              <Field label="Micción normal" value={consultation.normalUrination} />
              <Field
                label="Frecuencia/cantidad orina"
                value={consultation.urineFrequencyAndAmount}
              />
              <Field label="Color orina" value={consultation.urineColor} />
              <Field
                label="Dolor al orinar"
                value={consultation.painOrDifficultyUrinating}
              />
            </Section>
          )}

          {/* Respiratorio (si hay datos) */}
          {(consultation.cough || consultation.sneezing) && (
            <Section title="Sistema respiratorio (síntomas)">
              <Field label="Tos" value={consultation.cough} />
              <Field label="Estornudos" value={consultation.sneezing} />
            </Section>
          )}

          {/* Piel y pelaje (si hay datos) */}
          {(consultation.hairLossOrSkinLesions ||
            consultation.eyeDischarge ||
            consultation.earIssues) && (
            <Section title="Piel, ojos y oídos">
              <Field
                label="Caída pelo/lesiones"
                value={consultation.hairLossOrSkinLesions}
              />
              <Field label="Secreción ocular" value={consultation.eyeDischarge} />
              <Field label="Problemas oídos" value={consultation.earIssues} />
            </Section>
          )}

          {/* Historial (si hay datos) */}
          {(consultation.previousIllnesses ||
            consultation.previousSurgeries ||
            consultation.adverseReactions) && (
            <Section title="Historial médico">
              <TextField
                label="Enfermedades previas"
                value={consultation.previousIllnesses}
              />
              <TextField
                label="Cirugías anteriores"
                value={consultation.previousSurgeries}
              />
              <TextField
                label="Reacciones adversas"
                value={consultation.adverseReactions}
              />
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div>
            <p className="text-xs text-gray-500">Costo de consulta</p>
            <p className="text-xl font-bold text-gray-900">
              ${consultation.cost.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}