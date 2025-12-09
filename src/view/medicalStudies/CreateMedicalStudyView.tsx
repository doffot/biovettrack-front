// src/views/medicalStudies/CreateMedicalStudyView.tsx
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, FileText, Loader2, AlertCircle } from "lucide-react";
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
      toast.success("Estudio registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      toast.error("Solo se permiten archivos PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB");
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
      toast.error("Selecciona un archivo PDF");
      return;
    }

    const studyType = formData.studyType === "Otro" 
      ? formData.customStudyType 
      : formData.studyType;

    if (!studyType || !formData.professional) {
      toast.error("Completa los campos obligatorios");
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Agregar Estudio</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isPending}
            className="px-4 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={`px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fila 1: PDF + Tipo + Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Subir PDF - Compacto */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg px-3 py-2 cursor-pointer transition-all flex items-center gap-3 ${
              dragActive
                ? "border-vet-primary bg-vet-primary/5"
                : pdfFile
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
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
              <>
                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{pdfFile.name}</p>
                  <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                  className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Subir PDF</p>
                  <p className="text-xs text-gray-400">Máx 10MB</p>
                </div>
              </>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
            <select
              name="studyType"
              value={formData.studyType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
            >
              <option value="">Seleccionar</option>
              {STUDY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 2: Tipo personalizado (condicional) + Profesional */}
        <div className={`grid gap-3 ${formData.studyType === "Otro" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {formData.studyType === "Otro" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Especificar tipo *</label>
              <input
                type="text"
                name="customStudyType"
                value={formData.customStudyType}
                onChange={handleInputChange}
                placeholder="Ej: Electrocardiograma"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Laboratorio / Profesional *</label>
            <input
              type="text"
              name="professional"
              value={formData.professional}
              onChange={handleInputChange}
              placeholder="Nombre del laboratorio o profesional"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 3: Diagnóstico + Notas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Diagnóstico presuntivo</label>
            <input
              type="text"
              name="presumptiveDiagnosis"
              value={formData.presumptiveDiagnosis}
              onChange={handleInputChange}
              placeholder="Opcional"
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Opcional"
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>
      </form>
       {/* Advertencia */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Importante</p>
            <p className="text-amber-700 mt-0.5">
              Asegúrate de que el PDF sea legible y contenga toda la información del estudio.
            </p>
          </div>
        </div>
    </div>
  );
}