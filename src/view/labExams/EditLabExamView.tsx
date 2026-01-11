// src/views/labExams/EditLabExamView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FlaskConical,
  Calendar,
  User,
  Save,
  AlertTriangle,
  Loader2,
  FileText,
  Activity,
  PawPrint,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { getLabExamById, updateLabExam } from "../../api/labExamAPI";
import type { LabExamFormData } from "../../types";

// Valores normales para validación visual
const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6, 17],
    totalProtein: [5.4, 7.8],
    platelets: [175, 500],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5.5, 19.5],
    totalProtein: [5.7, 8.9],
    platelets: [180, 500],
  },
};

type EditableFields = {
  // Datos del paciente
  patientName: string;
  species: "canino" | "felino";
  breed: string;
  sex: string;
  age: string;
  ownerName: string;
  ownerPhone: string;
  // Datos del examen
  date: string;
  hematocrit: number;
  whiteBloodCells: number;
  totalProtein: number;
  platelets: number;
  hemotropico: string;
  observacion: string;
};

export default function EditLabExamView() {
  const { id, labExamId } = useParams<{ id?: string; labExamId?: string }>();
  const examId = id || labExamId;
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"patient" | "general" | "observations">("patient");

  // Cargar examen existente
  const {
    data: exam,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["labExam", examId],
    queryFn: () => getLabExamById(examId!),
    enabled: !!examId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<EditableFields>();

  // Cargar datos del examen en el formulario
  useEffect(() => {
    if (exam) {
      reset({
        // Datos del paciente
        patientName: exam.patientName || "",
        species: (exam.species?.toLowerCase() === "felino" ? "felino" : "canino") as "canino" | "felino",
        breed: exam.breed || "",
        sex: exam.sex || "",
        age: exam.age || "",
        ownerName: exam.ownerName || "",
        ownerPhone: exam.ownerPhone || "",
        // Datos del examen
        date: exam.date ? new Date(exam.date).toISOString().split("T")[0] : "",
        hematocrit: exam.hematocrit,
        whiteBloodCells: exam.whiteBloodCells,
        totalProtein: exam.totalProtein,
        platelets: exam.platelets,
        hemotropico: exam.hemotropico || "",
        observacion: exam.observacion || "",
      });
    }
  }, [exam, reset]);

  // Mutation para actualizar
  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<LabExamFormData>) => updateLabExam(examId!, data),
    onSuccess: () => {
      toast.success("Examen actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["labExam", examId] });
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      navigate(`/lab-exams/${examId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EditableFields) => {
    mutate(data);
  };

  // Verificar si está fuera de rango
  const species = watch("species") || "canino";
  
  const isOutOfRange = (value: number | undefined, key: keyof typeof normalValues.canino) => {
    if (value === undefined) return false;
    const range = normalValues[species][key];
    return value < range[0] || value > range[1];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-vet-primary animate-spin" />
          <p className="text-sm text-vet-muted">Cargando examen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <p className="text-vet-muted">Examen no encontrado</p>
        <Link
          to="/lab-exams"
          className="text-vet-primary hover:underline font-medium"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  // Bloquear edición si es paciente propio
  if (exam.patientId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-vet-text mb-2">
            Edición no disponible
          </h2>
          <p className="text-vet-muted max-w-md">
            Este examen pertenece a un paciente registrado en tu sistema. 
            Solo los exámenes de pacientes referidos pueden ser editados.
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <Link
            to={`/lab-exams/${examId}`}
            className="px-4 py-2 text-sm font-medium text-vet-text bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Ver detalles
          </Link>
          <Link
            to="/lab-exams"
            className="px-4 py-2 text-sm font-medium text-white bg-vet-primary hover:bg-vet-primary/90 rounded-lg transition-colors"
          >
            Ir a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-vet-primary hover:text-white text-vet-muted transition-all duration-200 shadow-soft group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-vet-text">
                    Editar Hemograma
                  </h1>
                  <p className="text-xs sm:text-sm text-vet-muted">
                    Paciente referido
                  </p>
                </div>
              </div>
            </div>

            {/* Badge de referido */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              <User className="w-3.5 h-3.5" />
              Referido
            </span>
          </div>

          {/* Info del costo (no editable) */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">
                  Costo del examen (No editable)
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  ${exam.cost?.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl shadow-vet-primary/5 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab("patient")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "patient"
                    ? "text-vet-primary border-b-2 border-vet-primary bg-vet-primary/5"
                    : "text-vet-muted hover:text-vet-text hover:bg-gray-50"
                }`}
              >
                <PawPrint className="w-4 h-4" />
                Paciente
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "general"
                    ? "text-vet-primary border-b-2 border-vet-primary bg-vet-primary/5"
                    : "text-vet-muted hover:text-vet-text hover:bg-gray-50"
                }`}
              >
                <Activity className="w-4 h-4" />
                Valores
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("observations")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "observations"
                    ? "text-vet-primary border-b-2 border-vet-primary bg-vet-primary/5"
                    : "text-vet-muted hover:text-vet-text hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                Observaciones
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-4 sm:p-6">
                {/* Tab Paciente */}
                {activeTab === "patient" && (
                  <div className="space-y-6">
                    {/* Datos del paciente */}
                    <div>
                      <h3 className="text-sm font-semibold text-vet-text mb-4 flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-vet-primary" />
                        Datos del Paciente
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nombre del paciente */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Nombre del paciente *
                          </label>
                          <input
                            type="text"
                            {...register("patientName", {
                              required: "El nombre es requerido",
                            })}
                            placeholder="Ej: Max, Luna..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          />
                          {errors.patientName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.patientName.message}
                            </p>
                          )}
                        </div>

                        {/* Especie */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Especie *
                          </label>
                          <select
                            {...register("species", {
                              required: "La especie es requerida",
                            })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          >
                            <option value="canino">🐕 Canino</option>
                            <option value="felino">🐈 Felino</option>
                          </select>
                        </div>

                        {/* Raza */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Raza
                          </label>
                          <input
                            type="text"
                            {...register("breed")}
                            placeholder="Ej: Labrador, Siamés..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          />
                        </div>

                        {/* Sexo */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Sexo
                          </label>
                          <select
                            {...register("sex")}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="macho">♂ Macho</option>
                            <option value="hembra">♀ Hembra</option>
                          </select>
                        </div>

                        {/* Edad */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Edad
                          </label>
                          <input
                            type="text"
                            {...register("age")}
                            placeholder="Ej: 3 años, 6 meses..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Datos del propietario */}
                    <div>
                      <h3 className="text-sm font-semibold text-vet-text mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-600" />
                        Datos del Propietario
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nombre del propietario */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Nombre del propietario *
                          </label>
                          <input
                            type="text"
                            {...register("ownerName", {
                              required: "El nombre del propietario es requerido",
                            })}
                            placeholder="Nombre completo"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          />
                          {errors.ownerName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ownerName.message}
                            </p>
                          )}
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            {...register("ownerPhone")}
                            placeholder="Ej: 0414-1234567"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Valores */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    {/* Fecha */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-vet-text mb-2">
                        <Calendar className="w-4 h-4 text-vet-muted" />
                        Fecha del examen
                      </label>
                      <input
                        type="date"
                        {...register("date", { required: "La fecha es requerida" })}
                        className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                      />
                      {errors.date && (
                        <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                      )}
                    </div>

                    {/* Valores del hemograma */}
                    <div>
                      <h3 className="text-sm font-semibold text-vet-text mb-4">
                        Valores del Hemograma
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hematocrito */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Hematocrito
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              {...register("hematocrit", {
                                required: "Requerido",
                                valueAsNumber: true,
                              })}
                              className={`w-full px-4 py-2.5 border rounded-xl transition-all ${
                                isOutOfRange(watch("hematocrit"), "hematocrit")
                                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                                  : "border-gray-200 focus:ring-vet-primary/20 focus:border-vet-primary"
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">
                              %
                            </span>
                          </div>
                          <p className="text-xs text-vet-muted mt-1">
                            Ref: {normalValues[species].hematocrit[0]} - {normalValues[species].hematocrit[1]}%
                          </p>
                        </div>

                        {/* Leucocitos */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Leucocitos (WBC)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              {...register("whiteBloodCells", {
                                required: "Requerido",
                                valueAsNumber: true,
                              })}
                              className={`w-full px-4 py-2.5 border rounded-xl transition-all ${
                                isOutOfRange(watch("whiteBloodCells"), "whiteBloodCells")
                                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                                  : "border-gray-200 focus:ring-vet-primary/20 focus:border-vet-primary"
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">
                              x10³/µL
                            </span>
                          </div>
                          <p className="text-xs text-vet-muted mt-1">
                            Ref: {normalValues[species].whiteBloodCells[0]} - {normalValues[species].whiteBloodCells[1]}
                          </p>
                        </div>

                        {/* Proteínas */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Proteínas Totales
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              {...register("totalProtein", {
                                required: "Requerido",
                                valueAsNumber: true,
                              })}
                              className={`w-full px-4 py-2.5 border rounded-xl transition-all ${
                                isOutOfRange(watch("totalProtein"), "totalProtein")
                                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                                  : "border-gray-200 focus:ring-vet-primary/20 focus:border-vet-primary"
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">
                              g/dL
                            </span>
                          </div>
                          <p className="text-xs text-vet-muted mt-1">
                            Ref: {normalValues[species].totalProtein[0]} - {normalValues[species].totalProtein[1]}
                          </p>
                        </div>

                        {/* Plaquetas */}
                        <div>
                          <label className="block text-sm font-medium text-vet-text mb-1.5">
                            Plaquetas
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="1"
                              {...register("platelets", {
                                required: "Requerido",
                                valueAsNumber: true,
                              })}
                              className={`w-full px-4 py-2.5 border rounded-xl transition-all ${
                                isOutOfRange(watch("platelets"), "platelets")
                                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                                  : "border-gray-200 focus:ring-vet-primary/20 focus:border-vet-primary"
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">
                              x10³/µL
                            </span>
                          </div>
                          <p className="text-xs text-vet-muted mt-1">
                            Ref: {normalValues[species].platelets[0]} - {normalValues[species].platelets[1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Observaciones */}
                {activeTab === "observations" && (
                  <div className="space-y-6">
                    {/* Hemotrópicos */}
                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-2">
                        Hemotrópicos
                      </label>
                      <textarea
                        {...register("hemotropico")}
                        rows={3}
                        placeholder="Observaciones sobre hemoparásitos..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all resize-none"
                      />
                    </div>

                    {/* Observación general */}
                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-2">
                        Observaciones Generales
                      </label>
                      <textarea
                        {...register("observacion")}
                        rows={5}
                        placeholder="Notas adicionales, morfología celular, comentarios..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con botones */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2.5 text-sm font-medium text-vet-text bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending || !isDirty}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-vet-primary to-vet-secondary rounded-xl hover:shadow-lg hover:shadow-vet-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Indicador de cambios */}
          {isDirty && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Tienes cambios sin guardar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}