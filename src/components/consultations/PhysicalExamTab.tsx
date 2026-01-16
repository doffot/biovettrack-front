import type { ConsultationFormData } from "../../types/consultation";

interface PhysicalExamTabProps {
  formData: ConsultationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ConsultationFormData>>;
}

export default function PhysicalExamTab({
  formData,
  setFormData,
}: PhysicalExamTabProps) {
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
      {/* SIGNOS VITALES */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Signos vitales
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Temperatura (°C) *
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature || ""}
              onChange={handleChange}
              min="35"
              max="42"
              step="0.1"
              placeholder="38.5"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
            <span className="text-[10px] text-[var(--color-vet-muted)] opacity-70">Normal: 38-39.2°C</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Frec. Cardíaca (lpm) *
            </label>
            <input
              type="number"
              name="heartRate"
              value={formData.heartRate || ""}
              onChange={handleChange}
              min="0"
              max="300"
              placeholder="120"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
            <span className="text-[10px] text-[var(--color-vet-muted)] opacity-70">Normal: 60-140 lpm</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Frec. Respiratoria (rpm) *
            </label>
            <input
              type="number"
              name="respiratoryRate"
              value={formData.respiratoryRate || ""}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="20"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
            <span className="text-[10px] text-[var(--color-vet-muted)] opacity-70">Normal: 10-30 rpm</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Peso (kg) *
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ""}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="5.5"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* OTROS PARÁMETROS */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Otros parámetros
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Ganglios linfáticos
            </label>
            <input
              type="text"
              name="lymphNodes"
              value={formData.lymphNodes || ""}
              onChange={handleChange}
              maxLength={100}
              placeholder="Normal, inflamados, reactivos..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Tiempo de relleno capilar (TRC)
            </label>
            <input
              type="text"
              name="capillaryRefillTime"
              value={formData.capillaryRefillTime || ""}
              onChange={handleChange}
              maxLength={50}
              placeholder="< 2 segundos"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* EVALUACIÓN POR SISTEMAS */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Evaluación por sistemas
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema tegumentario (piel, pelo, uñas)
            </label>
            <textarea
              name="integumentarySystem"
              value={formData.integumentarySystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Estado del pelaje, lesiones, parásitos externos..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema cardiovascular
            </label>
            <textarea
              name="cardiovascularSystem"
              value={formData.cardiovascularSystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Auscultación cardíaca, pulso, mucosas..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema ocular
            </label>
            <textarea
              name="ocularSystem"
              value={formData.ocularSystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Conjuntiva, córnea, reflejos pupilares..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema respiratorio
            </label>
            <textarea
              name="respiratorySystem"
              value={formData.respiratorySystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Auscultación pulmonar, ruidos respiratorios..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema nervioso
            </label>
            <textarea
              name="nervousSystem"
              value={formData.nervousSystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Estado mental, reflejos, coordinación, propiocepción..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema musculoesquelético
            </label>
            <textarea
              name="musculoskeletalSystem"
              value={formData.musculoskeletalSystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Marcha, articulaciones, masa muscular, dolor..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
              Sistema gastrointestinal
            </label>
            <textarea
              name="gastrointestinalSystem"
              value={formData.gastrointestinalSystem || ""}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              placeholder="Palpación abdominal, ruidos intestinales, dentadura..."
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] resize-none bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
            />
          </div>
        </div>
      </section>
    </div>
  );
}