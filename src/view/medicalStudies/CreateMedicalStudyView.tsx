// src/views/medicalStudies/CreateMedicalStudyView.tsx
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, FileText, Save, AlertCircle } from "lucide-react";
import { createMedicalStudy } from "../../api/medicalStudyAPI";
import { toast } from "../../components/Toast";

const STUDY_TYPES = [
  "Radiografía",
  "Ecografía",
  "Hemograma externo",
  "Química sanguínea",
  "Otro",
];

export default function CreateMedicalStudyView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    professional: "",
    studyType: "",
    customStudyType: "",
    presumptiveDiagnosis: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => createMedicalStudy(patientId!, data),
    onSuccess: () => {
      toast.success(
        "Estudio registrado",
        "El archivo PDF ha sido guardado en el expediente médico"
      );
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al registrar",
        error.message || "No se pudo guardar el estudio"
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.warning("Formato inválido", "Solo se permiten archivos PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Archivo muy grande", "El tamaño máximo es 10MB");
      return;
    }
    setPdfFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.warning("PDF requerido", "Debes seleccionar un archivo PDF");
      return;
    }

    const studyType = formData.studyType === "Otro" 
      ? formData.customStudyType 
      : formData.studyType;

    if (!studyType || !formData.professional) {
      toast.warning("Campos incompletos", "Completa todos los campos obligatorios");
      return;
    }

    const data = new FormData();
    data.append("pdfFile", pdfFile);
    data.append("patientId", patientId!);
    data.append("professional", formData.professional);
    data.append("studyType", studyType);
    data.append("date", formData.date);
    if (formData.presumptiveDiagnosis) {
      data.append("presumptiveDiagnosis", formData.presumptiveDiagnosis);
    }
    if (formData.notes) {
      data.append("notes", formData.notes);
    }

    mutate(data);
  };

  const isValid = pdfFile && 
    formData.professional && 
    formData.studyType && 
    (formData.studyType !== "Otro" || formData.customStudyType);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-[var(--color-vet-text)]">Agregar Estudio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Upload PDF destacado */}
        <div className="bg-[var(--color-vet-primary)]/5 border border-[var(--color-vet-primary)]/20 rounded-lg p-3">
          <label className="block text-xs font-semibold text-[var(--color-vet-text)] mb-2">
            Archivo PDF <span className="text-red-500">*</span>
          </label>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all ${
              dragActive
                ? "border-[var(--color-vet-primary)] bg-[var(--color-vet-primary)]/10"
                : pdfFile
                ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/5"
                : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] bg-[var(--color-card)]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {pdfFile ? (
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-vet-text)] truncate">{pdfFile.name}</p>
                  <p className="text-xs text-[var(--color-vet-muted)]">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Quitar archivo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-10 h-10 mx-auto text-[var(--color-vet-muted)] mb-2" />
                <p className="text-sm font-medium text-[var(--color-vet-text)]">
                  Arrastra un PDF o haz click para seleccionar
                </p>
                <p className="text-xs text-[var(--color-vet-muted)] mt-1">
                  Máximo 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Grid compacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Tipo de estudio <span className="text-red-500">*</span>
            </label>
            <select
              name="studyType"
              value={formData.studyType}
              onChange={handleInputChange}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] transition-all"
            >
              <option value="">Seleccionar</option>
              {STUDY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          {/* Profesional/Laboratorio */}
          <div className={formData.studyType === "Otro" ? "sm:col-span-2 lg:col-span-1" : "lg:col-span-1"}>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Laboratorio / Profesional <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="professional"
              value={formData.professional}
              onChange={handleInputChange}
              placeholder="Nombre del lab. o profesional"
              maxLength={100}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-all"
            />
          </div>
        </div>

        {/* Tipo personalizado si "Otro" */}
        {formData.studyType === "Otro" && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Especificar tipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customStudyType"
              value={formData.customStudyType}
              onChange={handleInputChange}
              placeholder="Ej: Electrocardiograma, Tomografía, etc."
              maxLength={50}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-all"
            />
          </div>
        )}

        {/* Diagnóstico y Notas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Diagnóstico presuntivo
            </label>
            <input
              type="text"
              name="presumptiveDiagnosis"
              value={formData.presumptiveDiagnosis}
              onChange={handleInputChange}
              placeholder="Opcional"
              maxLength={500}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Notas adicionales
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Opcional"
              maxLength={300}
              className="w-full px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-all"
            />
          </div>
        </div>

        {/* Advertencia */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-medium text-amber-700 dark:text-amber-300">Importante</p>
            <p className="text-amber-600 dark:text-amber-400 mt-0.5">
              Verifica que el PDF sea legible y contenga toda la información del estudio.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isPending}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Estudio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}