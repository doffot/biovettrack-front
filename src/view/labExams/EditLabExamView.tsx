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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
    </div>
  );

  if (isError || !exam) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-slate-400">
      <AlertTriangle className="w-12 h-12 text-amber-500" />
      <p>Examen no encontrado</p>
      <Link to="/lab-exams" className="text-cyan-500 hover:text-cyan-400 font-medium">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Editar Hemograma</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <span className="text-cyan-500 uppercase font-bold text-xs tracking-widest">ID: {examId?.slice(-6)}</span>
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
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl mb-6 flex items-center justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Costo del servicio</p>
                <p className="text-2xl font-black text-white">${exam.cost?.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                <Save className="w-5 h-5" />
            </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-800/50 border-b border-slate-700">
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
                        ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5" 
                        : "text-slate-500 hover:text-slate-300"
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del paciente</label>
                    <input {...register("patientName", { required: true })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Especie</label>
                    <select {...register("species")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                      <option value="canino">Canino</option>
                      <option value="felino">Felino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raza</label>
                    <input {...register("breed")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sexo</label>
                    <select {...register("sex")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                      <option value="macho">Macho</option>
                      <option value="hembra">Hembra</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-700 space-y-4">
                    <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em]">Información del Propietario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</label>
                            <input {...register("ownerName")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</label>
                            <input {...register("ownerPhone")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" />
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="w-full md:w-1/3 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha del Examen</label>
                  <input type="date" {...register("date")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "hematocrit", label: "Hematocrito (%)", key: "hematocrit" as const },
                    { name: "whiteBloodCells", label: "WBC (x10³/µL)", key: "whiteBloodCells" as const },
                    { name: "totalProtein", label: "Proteínas (g/dL)", key: "totalProtein" as const },
                    { name: "platelets", label: "Plaquetas (x10³/µL)", key: "platelets" as const },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field.label}</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register(field.name as any, { valueAsNumber: true })}
                        className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-white outline-none transition-all ${
                          isOutOfRange(watch(field.name as any), field.key) ? "border-amber-500/50 text-amber-500" : "border-slate-700 focus:border-cyan-500"
                        }`}
                      />
                      <p className="text-[10px] text-slate-500 font-medium">Ref: {normalValues[species][field.key][0]} - {normalValues[species][field.key][1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "observations" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hemotrópicos</label>
                  <textarea {...register("hemotropico")} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 resize-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observaciones Generales</label>
                  <textarea {...register("observacion")} rows={6} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 resize-none transition-all" />
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all uppercase text-xs tracking-widest"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !isDirty}
                className="flex-[2] py-3 px-6 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
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