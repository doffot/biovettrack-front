// src/components/consultations/DiagnosisTab.tsx
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
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Diagnóstico
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Diagnóstico presuntivo *
            </label>
            <textarea
              name="presumptiveDiagnosis"
              value={formData.presumptiveDiagnosis}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Diagnóstico inicial basado en la evaluación clínica..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Diagnóstico definitivo *
            </label>
            <textarea
              name="definitiveDiagnosis"
              value={formData.definitiveDiagnosis}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Diagnóstico confirmado (puede ser igual al presuntivo)..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Exámenes solicitados
            </label>
            <textarea
              name="requestedTests"
              value={formData.requestedTests || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Hemograma, bioquímica, radiografía, ecografía..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* TRATAMIENTO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Plan de tratamiento
        </h3>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tratamiento indicado *
          </label>
          <textarea
            name="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Medicamentos, dosis, frecuencia, duración, indicaciones especiales, dieta, reposo..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
          />
        </div>
      </section>

      {/* ===================== */}
      {/* COSTO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Facturación
        </h3>
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">
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
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
          />
          <span className="text-[10px] text-gray-400">
            Se generará factura automáticamente
          </span>
        </div>
      </section>
    </div>
  );
}