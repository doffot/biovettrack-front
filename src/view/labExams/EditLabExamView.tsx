import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Loader2,
  FileText,
  Activity,
  PawPrint,
  ChevronRight,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { getLabExamById, updateLabExam } from "../../api/labExamAPI";
import type { LabExamFormData } from "../../types";
import { useForm } from "react-hook-form";

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
  patientName: string;
  species: "canino" | "felino";
  breed: string;
  sex: string;
  age: string;
  ownerName: string;
  ownerPhone: string;
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

  // Estilo para el fondo de inputs (similar a sidebar)
  const inputStyle = { backgroundColor: "var(--color-vet-sidebar)" };

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ["labExam", examId],
    queryFn: () => getLabExamById(examId!),
    enabled: !!examId,
  });

  const { register, handleSubmit, formState: { isDirty }, reset, watch } = useForm<EditableFields>();

  useEffect(() => {
    if (exam) {
      reset({
        patientName: exam.patientName || "",
        species: (exam.species?.toLowerCase() === "felino" ? "felino" : "canino") as "canino" | "felino",
        breed: exam.breed || "",
        sex: exam.sex || "",
        age: exam.age || "",
        ownerName: exam.ownerName || "",
        ownerPhone: exam.ownerPhone || "",
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

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<LabExamFormData>) => updateLabExam(examId!, data),
    onSuccess: () => {
      toast.success("Examen actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["labExam", examId] });
      navigate(`/lab-exams/${examId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EditableFields) => mutate(data);

  const species = watch("species") || "canino";
  const isOutOfRange = (value: number | undefined, key: keyof typeof normalValues.canino) => {
    if (value === undefined) return false;
    const range = normalValues[species][key];
    return value < range[0] || value > range[1];
  };

  if (isLoading) return (
    <div className="min-h-screen bg-vet-light flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-vet-primary animate-spin" />
    </div>
  );

  if (isError || !exam) return (
    <div className="min-h-screen bg-vet-light flex flex-col items-center justify-center gap-4 text-vet-muted">
      <AlertTriangle className="w-12 h-12 text-vet-danger" />
      <p>Examen no encontrado</p>
      <Link to="/lab-exams" className="text-vet-primary hover:text-vet-accent font-medium">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-vet-light text-vet-text pb-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-card text-vet-muted hover:text-vet-text border border-border transition-all hover:bg-hover"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-vet-text">Editar Hemograma</h1>
              <div className="flex items-center gap-2 text-vet-muted text-sm mt-1">
                <span className="text-vet-primary uppercase font-bold text-xs tracking-widest">ID: {examId?.slice(-6)}</span>
                <ChevronRight className="w-3 h-3" />
                <span>Referido</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg uppercase tracking-wider">
            Edición Habilitada
          </div>
        </div>

        {/* Costo info */}
        <div className="bg-card border border-border p-4 rounded-2xl mb-6 flex items-center justify-between shadow-soft">
            <div>
                <p className="text-[10px] uppercase tracking-widest text-vet-muted font-bold">Costo del servicio</p>
                <p className="text-2xl font-black text-vet-text">${exam.cost?.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-vet-light flex items-center justify-center text-vet-muted border border-border">
                <Save className="w-5 h-5" />
            </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          {/* Tabs */}
          <div className="flex bg-vet-light border-b border-border">
            {[
                { id: "patient", label: "Paciente", icon: PawPrint },
                { id: "general", label: "Valores", icon: Activity },
                { id: "observations", label: "Notas", icon: FileText }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? "text-vet-primary border-b-2 border-vet-primary bg-vet-primary/5" 
                        : "text-vet-muted hover:text-vet-text hover:bg-hover"
                    }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {activeTab === "patient" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Nombre del paciente</label>
                    <input style={inputStyle} {...register("patientName", { required: true })} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Especie</label>
                    <select style={inputStyle} {...register("species")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all">
                      <option value="canino" className="bg-card">Canino</option>
                      <option value="felino" className="bg-card">Felino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Raza</label>
                    <input style={inputStyle} {...register("breed")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Sexo</label>
                    <select style={inputStyle} {...register("sex")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all">
                      <option value="macho" className="bg-card">Macho</option>
                      <option value="hembra" className="bg-card">Hembra</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border space-y-4">
                    <h3 className="text-xs font-black text-vet-primary uppercase tracking-[0.2em]">Información del Propietario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Nombre</label>
                            <input style={inputStyle} {...register("ownerName")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Teléfono</label>
                            <input style={inputStyle} {...register("ownerPhone")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary outline-none transition-all" />
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="w-full md:w-1/3 space-y-2">
                  <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Fecha del Examen</label>
                  <input style={inputStyle} type="date" {...register("date")} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text outline-none focus:border-vet-primary transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "hematocrit", label: "Hematocrito (%)", key: "hematocrit" as const },
                    { name: "whiteBloodCells", label: "WBC (x10³/µL)", key: "whiteBloodCells" as const },
                    { name: "totalProtein", label: "Proteínas (g/dL)", key: "totalProtein" as const },
                    { name: "platelets", label: "Plaquetas (x10³/µL)", key: "platelets" as const },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">{field.label}</label>
                      <input
                        type="number"
                        step="0.1"
                        style={inputStyle}
                        {...register(field.name as any, { valueAsNumber: true })}
                        className={`w-full border rounded-xl px-4 py-3 text-vet-text outline-none transition-all ${
                          isOutOfRange(watch(field.name as any), field.key) 
                            ? "border-red-500/50 text-red-500 focus:ring-red-500/20" 
                            : "border-border focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                        }`}
                      />
                      <p className="text-[10px] text-vet-muted font-medium">Ref: {normalValues[species][field.key][0]} - {normalValues[species][field.key][1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "observations" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Hemotrópicos</label>
                  <textarea style={inputStyle} {...register("hemotropico")} rows={3} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text outline-none focus:border-vet-primary resize-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-vet-muted uppercase tracking-wider">Observaciones Generales</label>
                  <textarea style={inputStyle} {...register("observacion")} rows={6} className="w-full border border-border rounded-xl px-4 py-3 text-vet-text outline-none focus:border-vet-primary resize-none transition-all" />
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 rounded-xl bg-card border border-border text-vet-muted font-bold hover:bg-hover transition-all uppercase text-xs tracking-widest"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !isDirty}
                className="flex-[2] py-3 px-6 rounded-xl bg-vet-primary text-white font-bold hover:bg-vet-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 shadow-soft hover:shadow-card"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}