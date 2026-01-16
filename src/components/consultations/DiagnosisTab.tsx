import type { ConsultationFormData } from "../../types/consultation";

interface DiagnosisTabProps {
  formData: ConsultationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ConsultationFormData>>;
}

export default function DiagnosisTab({
  formData,
  setFormData,
}: DiagnosisTabProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* ===================== */}
      {/* DIAGNÓSTICO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Diagnóstico
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Diagnóstico presuntivo *
            </label>
            <textarea
              name="presumptiveDiagnosis"
              value={formData.presumptiveDiagnosis}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Diagnóstico inicial basado en la evaluación clínica..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Diagnóstico definitivo *
            </label>
            <textarea
              name="definitiveDiagnosis"
              value={formData.definitiveDiagnosis}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Diagnóstico confirmado (puede ser igual al presuntivo)..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Exámenes solicitados
            </label>
            <textarea
              name="requestedTests"
              value={formData.requestedTests || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Hemograma, bioquímica, radiografía, ecografía..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* TRATAMIENTO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Plan de tratamiento
        </h3>
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
            Tratamiento indicado *
          </label>
          <textarea
            name="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Medicamentos, dosis, frecuencia, duración, indicaciones especiales, dieta, reposo..."
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
          />
        </div>
      </section>

      {/* ===================== */}
      {/* COSTO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Facturación
        </h3>
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
            Costo de la consulta ($) *
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
          />
          <span className="text-[10px] text-[var(--color-vet-muted)] opacity-70">
            Se generará factura automáticamente
          </span>
        </div>
      </section>
    </div>
  );
}