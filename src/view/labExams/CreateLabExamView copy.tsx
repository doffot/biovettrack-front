// src/views/labExams/CreateLabExamView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, TestTube, Sparkles, Heart } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import type { LabExamFormData } from "../../types";

// Debes tener estos archivos de sonido en tu carpeta public/sounds
import segmentedSound from '/sounds/segmented.mp3';
import bandSound from '/sounds/band.mp3';
import lymphocytesSound from '/sounds/lymphocytes.mp3';
import monocytesSound from '/sounds/monocytes.mp3';
import basophilsSound from '/sounds/basophils.mp3';
import reticulocytesSound from '/sounds/reticulocytes.mp3';
import eosinophilsSound from '/sounds/eosinophils.mp3';
import nrbcSound from '/sounds/nrbc.mp3';

export default function CreateLabExamView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [differentialCount, setDifferentialCount] = useState<
    LabExamFormData["differentialCount"]
  >({
    segmentedNeutrophils: 0,
    bandNeutrophils: 0,
    lymphocytes: 0,
    monocytes: 0,
    basophils: 0,
    reticulocytes: 0,
    eosinophils: 0,
    nrbc: 0,
  });

  const [totalCells, setTotalCells] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<LabExamFormData, "differentialCount" | "totalCells">>({
    defaultValues: {
      patientId: patientId || "",
      date: new Date().toISOString().split("T")[0],
      hematocrit: 0,
      whiteBloodCells: 0,
      totalProtein: 0,
      platelets: 0,
    },
  });

  // Arreglo para mapear campos y sonidos
  const differentialFields = [
    { key: "segmentedNeutrophils", sound: new Audio(segmentedSound) },
    { key: "bandNeutrophils", sound: new Audio(bandSound) },
    { key: "lymphocytes", sound: new Audio(lymphocytesSound) },
    { key: "monocytes", sound: new Audio(monocytesSound) },
    { key: "basophils", sound: new Audio(basophilsSound) },
    { key: "reticulocytes", sound: new Audio(reticulocytesSound) },
    { key: "eosinophils", sound: new Audio(eosinophilsSound) },
    { key: "nrbc", sound: new Audio(nrbcSound) },
  ] as const;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LabExamFormData) => {
      if (!patientId) {
        throw new Error("ID del paciente no encontrado.");
      }
      return createLabExam(data, patientId);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Examen de laboratorio creado con éxito");
      queryClient.invalidateQueries({
        queryKey: ["labExams", { patientId }],
      });
      navigate(`/patients/${patientId}`);
    },
  });

  const handleIncrement = (field: keyof LabExamFormData["differentialCount"], sound: HTMLAudioElement) => {
    if (totalCells >= 100) {
      toast.error("El conteo total no puede superar 100");
      return;
    }
    setDifferentialCount((prev) => ({
      ...prev,
      [field]: (prev[field] || 0) + 1,
    }));
    setTotalCells((prev) => prev + 1);

    // Reproducir el sonido
    sound.currentTime = 0; // Reiniciar el sonido por si se reproduce rápido
    sound.play();
  };

  const onSubmit = (data: Omit<LabExamFormData, "differentialCount" | "totalCells">) => {
    if (totalCells !== 100) {
      toast.error("El conteo total debe ser exactamente 100");
      return;
    }

    const finalData = {
      ...data,
      differentialCount,
      totalCells,
    } as LabExamFormData;

    mutate(finalData);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-coral-pulse/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-coral-pulse/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-coral-pulse/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-lavender-fog/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-56 h-56 bg-electric-mint/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '3s' }} />
      </div>

      <FloatingParticles />

      <div className="fixed top-6 left-6 z-50">
        <BackButton />
      </div>

      <div className="relative pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center transform transition-all duration-1200 ease-out">
          <div className={`transform transition-all duration-1200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-space-navy/80 backdrop-blur-xl border-2 border-coral-pulse/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/5 via-transparent to-lavender-fog/5 rounded-3xl" />
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-coral-pulse/20 to-coral-pulse/10 rounded-2xl border-2 border-coral-pulse/30 shadow-lg">
                      <TestTube className="w-10 h-10 text-coral-pulse animate-pulse-soft" />
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-coral-pulse via-misty-lilac to-coral-pulse bg-clip-text text-transparent">
                    Nuevo Examen
                  </h1>
                  <p className="text-lg sm:text-xl text-lavender-fog/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                    Registra los resultados del análisis de laboratorio
                  </p>
                  <div className="flex justify-center items-center gap-4 text-coral-pulse/40">
                    <Heart className="w-4 h-4 animate-pulse-soft" />
                    <Sparkles className="w-5 h-5 animate-float" />
                    <Heart className="w-4 h-4 animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 pb-20 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className={`transform transition-all duration-1200 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-coral-pulse/10 via-coral-pulse/20 to-coral-pulse/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="relative bg-space-navy/90 backdrop-blur-xl border-2 border-coral-pulse/20 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/[0.02] via-transparent to-lavender-fog/[0.02] rounded-3xl" />
                <div className="relative z-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-misty-lilac font-semibold text-sm mb-1">Fecha del examen</label>
                      <input
                        type="date"
                        {...register("date", { required: "La fecha es obligatoria" })}
                        className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                      />
                      {errors.date && <p className="mt-1 text-sm text-coral-pulse">{errors.date.message}</p>}
                    </div>
                    <div>
                      <label className="block text-misty-lilac font-semibold text-sm mb-1">Hematocrito (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register("hematocrit", {
                          required: "El hematocrito es obligatorio",
                          min: { value: 0, message: "Debe ser positivo" },
                        })}
                        className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                      />
                      {errors.hematocrit && <p className="mt-1 text-sm text-coral-pulse">{errors.hematocrit.message}</p>}
                    </div>
                    <div>
                      <label className="block text-misty-lilac font-semibold text-sm mb-1">Glóbulos Blancos</label>
                      <input
                        type="number"
                        step="1"
                        {...register("whiteBloodCells", {
                          required: "Glóbulos blancos es obligatorio",
                          min: { value: 0, message: "Debe ser positivo" },
                        })}
                        className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                      />
                      {errors.whiteBloodCells && <p className="mt-1 text-sm text-coral-pulse">{errors.whiteBloodCells.message}</p>}
                    </div>
                    <div>
                      <label className="block text-misty-lilac font-semibold text-sm mb-1">Proteína Total</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register("totalProtein", {
                          required: "Proteína total es obligatorio",
                          min: { value: 0, message: "Debe ser positivo" },
                        })}
                        className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                      />
                      {errors.totalProtein && <p className="mt-1 text-sm text-coral-pulse">{errors.totalProtein.message}</p>}
                    </div>
                    <div>
                      <label className="block text-misty-lilac font-semibold text-sm mb-1">Plaquetas</label>
                      <input
                        type="number"
                        step="1"
                        {...register("platelets", {
                          required: "Plaquetas es obligatorio",
                          min: { value: 0, message: "Debe ser positivo" },
                        })}
                        className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                      />
                      {errors.platelets && <p className="mt-1 text-sm text-coral-pulse">{errors.platelets.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold text-coral-pulse mb-4">
                    <h3>Conteo Diferencial</h3>
                    <div className={`transition-colors duration-300 ${totalCells === 100 ? 'text-electric-mint' : 'text-coral-pulse'}`}>
                      {totalCells} / 100
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {differentialFields.map(({ key, sound }) => (
                      <div key={key} className="text-center">
                        <label className="block text-misty-lilac text-xs font-medium mb-1 capitalize">
                          {getLabel(key)}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleIncrement(key, sound)}
                          disabled={totalCells >= 100}
                          className="w-full py-2 bg-space-navy/60 border border-coral-pulse/30 rounded-2xl text-misty-lilac font-bold text-lg hover:bg-space-navy/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <div className="mt-1 text-sm">
                          <span className="font-medium text-electric-mint">
                            {differentialCount[key] as number}
                          </span>
                          <span className="ml-1 text-misty-lilac/70">
                            (
                            {totalCells > 0
                              ? ((differentialCount[key] as number) / totalCells * 100).toFixed(1)
                              : "0.0"}
                            %)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isPending || totalCells !== 100}
                      className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 border-2 border-coral-pulse/40 rounded-2xl text-misty-lilac font-bold text-lg hover:scale-105 hover:shadow-2xl hover:border-coral-pulse/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <Save className={`w-6 h-6 mr-3 ${isPending ? 'animate-spin' : ''}`} />
                      {isPending ? "Guardando..." : "Guardar Examen"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}