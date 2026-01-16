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
      <h4 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wide mb-2">
        {title}
      </h4>
      <div className="bg-[var(--color-hover)] rounded-lg p-3 space-y-2 border border-[var(--color-border)]">
        {children}
      </div>
    </div>
  );

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | boolean | null;
  }) => {
    if (value === undefined || value === null || value === "") return null;
    const displayValue =
      typeof value === "boolean" ? (value ? "Sí" : "No") : value;
    return (
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-vet-muted)]">{label}</span>
        <span className="text-[var(--color-vet-text)] font-medium text-right max-w-[60%]">
          {displayValue}
        </span>
      </div>
    );
  };

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
        <span className="text-[var(--color-vet-muted)] block mb-1">{label}</span>
        <p className="text-[var(--color-vet-text)] bg-[var(--color-card)] p-2 rounded border border-[var(--color-border)]">
          {value}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[var(--color-card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-blue-600/10 to-[var(--color-card)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-vet-text)]">
              Detalle de Consulta
            </h3>
            <p className="text-sm text-[var(--color-vet-muted)] flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(consultation.consultationDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Signos vitales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-red-600/10 rounded-xl p-3 text-center border border-red-500/20">
              <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-vet-text)]">
                {consultation.temperature ?? "-"}°C
              </p>
              <p className="text-xs text-[var(--color-vet-muted)]">Temperatura</p>
            </div>
            <div className="bg-pink-600/10 rounded-xl p-3 text-center border border-pink-500/20">
              <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-vet-text)]">
                {consultation.heartRate ?? "-"} lpm
              </p>
              <p className="text-xs text-[var(--color-vet-muted)]">Frec. Cardíaca</p>
            </div>
            <div className="bg-blue-600/10 rounded-xl p-3 text-center border border-blue-500/20">
              <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-vet-text)]">
                {consultation.respiratoryRate ?? "-"} rpm
              </p>
              <p className="text-xs text-[var(--color-vet-muted)]">Frec. Respiratoria</p>
            </div>
            <div className="bg-green-600/10 rounded-xl p-3 text-center border border-green-500/20">
              <Scale className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-vet-text)]">
                {consultation.weight ?? "-"} kg
              </p>
              <p className="text-xs text-[var(--color-vet-muted)]">Peso</p>
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
          {consultation.treatmentPlan && (
            <Section title="Plan de tratamiento">
              <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-sm text-[var(--color-vet-text)] whitespace-pre-wrap">
                  {consultation.treatmentPlan}
                </p>
              </div>
            </Section>
          )}

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

          {/* Observaciones */}
          {consultation.lastHeatOrBirth && (
            <Section title="Observaciones">
              <TextField
                label="Observaciones generales"
                value={consultation.lastHeatOrBirth}
              />
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-hover)]">
          <div>
            <p className="text-xs text-[var(--color-vet-muted)]">Costo de consulta</p>
            <p className="text-xl font-bold text-[var(--color-vet-text)]">
              ${consultation.cost != null ? consultation.cost.toFixed(2) : "0.00"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium rounded-lg transition-colors border border-[var(--color-border)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}