import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import type { LabExamFormData } from "../../types";

// Sonidos
import segmentedSound from '/sounds/segmented.mp3';
import bandSound from '/sounds/band.mp3';
import lymphocytesSound from '/sounds/lymphocytes.mp3';
import monocytesSound from '/sounds/monocytes.mp3';
import basophilsSound from '/sounds/basophils.mp3';
import reticulocytesSound from '/sounds/reticulocytes.mp3';
import eosinophilsSound from '/sounds/eosinophils.mp3';
import nrbcSound from '/sounds/nrbc.mp3';
import errorSound from '/sounds/error.mp3';

import ShareResultsModal from "../../components/ShareResultsModal";
import { getPatientById } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";

// Valores normales
const normalValues = {
  perro: {
    hematocrit: [37, 55],
    whiteBloodCells: [6, 17],
    totalProtein: [5.4, 7.8],
    platelets: [175, 500],
    segmentedNeutrophils: [3.3, 11.4],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.0, 4.8],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.3],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5]
  },
  gato: {
    hematocrit: [30, 45],
    whiteBloodCells: [5.5, 19.5],
    totalProtein: [5.7, 8.9],
    platelets: [180, 500],
    segmentedNeutrophils: [2.5, 12.5],
    bandNeutrophils: [0, 0.3],
    lymphocytes: [1.5, 7.0],
    monocytes: [0.1, 1.4],
    eosinophils: [0.1, 1.5],
    basophils: [0, 0.2],
    nrbc: [0, 0.2],
    reticulocytes: [0, 1.5]
  }
};

export default function CreateLabExamView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [species, setSpecies] = useState<'perro' | 'gato'>('perro');
  const [activeTab, setActiveTab] = useState<'general' | 'differential' | 'observations'>('general');

  const [differentialCount, setDifferentialCount] = useState<LabExamFormData["differentialCount"]>({
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
  const [lastAction, setLastAction] = useState<{ field: keyof LabExamFormData["differentialCount"] } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedExamData, setSavedExamData] = useState<any>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Omit<LabExamFormData, "differentialCount" | "totalCells">>({
    defaultValues: {
      patientId: patientId || "",
      date: new Date().toISOString().split("T")[0],
      hematocrit: 0,
      whiteBloodCells: 0,
      totalProtein: 0,
      platelets: 0,
      hemotropico: "",
      observacion: "",
    },
  });

  const totalWhiteCells = watch("whiteBloodCells") || 0;

  const calculatedValues = useMemo(() => {
    const calculated = {} as Record<keyof LabExamFormData["differentialCount"], {
      percentage: string;
      absolute: string;
    }>;

    Object.keys(differentialCount).forEach((key) => {
      const cellKey = key as keyof LabExamFormData["differentialCount"];
      const percentage = totalCells > 0 ? ((differentialCount[cellKey] ?? 0) / totalCells) : 0;
      const absolute = (percentage * totalWhiteCells) || 0;

      calculated[cellKey] = {
        percentage: (percentage * 100).toFixed(1),
        absolute: absolute.toFixed(1),
      };
    });

    return calculated;
  }, [differentialCount, totalCells, totalWhiteCells]);

  const differentialFields = [
    { key: "segmentedNeutrophils", sound: new Audio(segmentedSound), label: "Neutrófilos Segmentados", image: "/img/segmentedNeutrophils.png" },
    { key: "bandNeutrophils", sound: new Audio(bandSound), label: "Neutrófilos en Banda", image: "/img/band.png" },
    { key: "lymphocytes", sound: new Audio(lymphocytesSound), label: "Linfocitos", image: "/img/lymphocytes.png" },
    { key: "monocytes", sound: new Audio(monocytesSound), label: "Monocitos", image: "/img/monocytes.png" },
    { key: "basophils", sound: new Audio(basophilsSound), label: "Basófilos", image: "/img/basophils.png" },
    { key: "reticulocytes", sound: new Audio(reticulocytesSound), label: "Reticulocitos", image: "/img/reticulocytes.png" },
    { key: "eosinophils", sound: new Audio(eosinophilsSound), label: "Eosinófilos", image: "/img/eosinophils.png" },
    { key: "nrbc", sound: new Audio(nrbcSound), label: "NRBC", image: "/img/nrbc.png" },
  ] as const;

  const { data: pet } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: owner } = useQuery({
    queryKey: ["owner", pet?.owner],
    queryFn: () => getOwnersById(pet?.owner!),
    enabled: !!pet?.owner,
  });

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
    onSuccess: (data) => {
      toast.success("Examen de laboratorio creado con éxito");
      setSavedExamData({
        ...data,
        differentialCount,
        totalCells,
        whiteBloodCells: watch("whiteBloodCells"),
        hematocrit: watch("hematocrit"),
        totalProtein: watch("totalProtein"),
        platelets: watch("platelets"),
        date: watch("date")
      });
      setShowShareModal(true);
      queryClient.invalidateQueries({
        queryKey: ["labExams", { patientId }],
      });
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
    setLastAction({ field });
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const handleUndo = () => {
    if (!lastAction || totalCells === 0) {
      toast.error("No hay acciones para deshacer");
      return;
    }

    const { field } = lastAction;
    if (differentialCount[field] && differentialCount[field]! > 0) {
      setDifferentialCount((prev) => ({
        ...prev,
        [field]: (prev[field] || 0) - 1,
      }));
      setTotalCells((prev) => prev - 1);
      setLastAction(null);
      toast.success("Último conteo deshecho");
    }
  };

  const handleReset = () => {
    setDifferentialCount({
      segmentedNeutrophils: 0,
      bandNeutrophils: 0,
      lymphocytes: 0,
      monocytes: 0,
      basophils: 0,
      reticulocytes: 0,
      eosinophils: 0,
      nrbc: 0,
    });
    setTotalCells(0);
    setLastAction(null);
    toast.success("Conteo diferencial reiniciado");
  };

  const onSubmit = (data: Omit<LabExamFormData, "differentialCount" | "totalCells">) => {
    // ✅ Ya NO se requiere totalCells === 100
    const finalData = {
      ...data,
      differentialCount,
      totalCells,
    } as LabExamFormData;

    mutate(finalData);
  };

  useEffect(() => {
    if (totalCells === 100) {
      if (!errorAudioRef.current) {
        errorAudioRef.current = new Audio(errorSound);
      }
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch((e) => console.warn("Error al reproducir sonido de 100:", e));
    }
  }, [totalCells]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOutOfRange = (value: number | string | undefined, rangeKey: keyof typeof normalValues.perro) => {
    if (value === undefined || value === null) return false;
    const numValue = Number(value);
    const range = normalValues[species][rangeKey];
    return numValue < range[0] || numValue > range[1];
  };

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetch(`/api/patients/${patientId}`).then(res => res.json()),
    enabled: !!patientId,
  });

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

      <div className="fixed top-20 left-6 z-50">
        <BackButton />
      </div>

      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Hematología</h1>
          <p className="text-sm text-lavender-fog/70">
            Paciente: {isLoading ? "Cargando..." : patient?.name || patientId}
          </p>
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
                className="relative bg-space-navy/90 backdrop-blur-xl border-2 border-coral-pulse/20 rounded-3xl p-6 sm:p-8 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/[0.02] via-transparent to-lavender-fog/[0.02] rounded-3xl" />
                <div className="relative z-10 space-y-6">

                  {/* Pestañas */}
                  <div className="flex border-b border-coral-pulse/30">
                    {(['general', 'differential', 'observations'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors ${
                          activeTab === tab
                            ? 'text-coral-pulse border-b-2 border-coral-pulse'
                            : 'text-lavender-fog/70 hover:text-misty-lilac'
                        }`}
                      >
                        {tab === 'general' && 'Datos Generales'}
                        {tab === 'differential' && 'Conteo Diferencial'}
                        {tab === 'observations' && 'Observaciones'}
                      </button>
                    ))}
                  </div>

                  {/* Controles del conteo diferencial (solo en su pestaña) */}
                  {activeTab === 'differential' && (
                    <div className="flex justify-between items-center">
                      <div className={`text-lg font-bold px-3 py-1.5 rounded-xl bg-space-navy/60 border transition-colors ${
                        totalCells === 100 ? 'text-electric-mint border-electric-mint/50' : 'text-coral-pulse border-coral-pulse/30'
                      }`}>
                        {totalCells}/100
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={!lastAction || totalCells === 0}
                          className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-electric-mint/20 to-electric-mint/30 border-2 border-electric-mint/40 rounded-xl text-electric-mint hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title="Deshacer último conteo"
                        >
                          <span className="text-xl">↶</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          disabled={totalCells === 0}
                          className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-lavender-fog/20 to-lavender-fog/30 border-2 border-lavender-fog/40 rounded-xl text-lavender-fog hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title="Reiniciar conteo"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contenido por pestaña */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-misty-lilac font-semibold text-sm mb-1">Especie</label>
                        <select
                          value={species}
                          onChange={(e) => setSpecies(e.target.value as 'perro' | 'gato')}
                          className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac focus:outline-none focus:border-coral-pulse/50"
                        >
                          <option value="perro">Perro</option>
                          <option value="gato">Gato</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-misty-lilac font-semibold text-sm mb-1">Fecha del examen</label>
                        <input
                          type="date"
                          {...register("date", { required: "La fecha es obligatoria" })}
                          className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50"
                        />
                        {errors.date && <p className="mt-1 text-sm text-coral-pulse">{errors.date.message}</p>}
                      </div>
                      {[
                        { name: "hematocrit", label: "Hematocrito (%)", step: "0.1", rangeKey: 'hematocrit' },
                        { name: "whiteBloodCells", label: "Glóbulos Blancos (x10³/μL)", step: "1", rangeKey: 'whiteBloodCells' },
                        { name: "totalProtein", label: "Proteína Total (g/dL)", step: "0.1", rangeKey: 'totalProtein' },
                        { name: "platelets", label: "Plaquetas (x10³/μL)", step: "1", rangeKey: 'platelets' },
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block text-misty-lilac font-semibold text-sm mb-1">{field.label}</label>
                          <input
                            type="number"
                            step={field.step}
                            {...register(field.name as keyof Omit<LabExamFormData, "differentialCount" | "totalCells">, {
                              required: `${field.label} es obligatorio`,
                              min: { value: 0, message: "Debe ser positivo" },
                            })}
                            className={`w-full bg-space-navy/60 border rounded-2xl px-4 py-3 placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50
                              ${isOutOfRange(watch(field.name as keyof Omit<LabExamFormData, "differentialCount" | "totalCells">), field.rangeKey as keyof typeof normalValues.perro)
                                ? 'border-coral-pulse text-coral-pulse'
                                : 'border-coral-pulse/30 text-misty-lilac'
                              }`}
                          />
                          {errors[field.name as keyof Omit<LabExamFormData, "differentialCount" | "totalCells">] && (
                            <p className="mt-1 text-sm text-coral-pulse">
                              {(errors[field.name as keyof Omit<LabExamFormData, "differentialCount" | "totalCells">]?.message as string)}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-lavender-fog/70">
                            Normal ({species}): {normalValues[species][field.rangeKey as keyof typeof normalValues.perro][0]} - {normalValues[species][field.rangeKey as keyof typeof normalValues.perro][1]}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'differential' && (
                    <div className="space-y-6">
                      {/* Móvil */}
                      <div className="block lg:hidden">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {differentialFields.map(({ key, sound, label, image }) => {
                            const cellNames = {
                              segmentedNeutrophils: 'SEG',
                              bandNeutrophils: 'BAND',
                              lymphocytes: 'LYM',
                              monocytes: 'MONO',
                              basophils: 'BASO',
                              reticulocytes: 'RET',
                              eosinophils: 'EOS',
                              nrbc: 'NRBC'
                            };
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleIncrement(key, sound)}
                                disabled={totalCells >= 100}
                                className="relative aspect-square bg-gradient-to-br from-space-navy/20 to-space-navy/10 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-2xl"
                              >
                                <div className="absolute inset-1 rounded-xl overflow-hidden border-2 border-coral-pulse/40 group-hover:border-coral-pulse/70 transition-colors duration-300">
                                  <img 
                                    src={image} 
                                    alt={label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-between p-2">
                                  <div className="self-start text-[10px] sm:text-xs font-bold text-white bg-space-navy/90 rounded-md px-2 py-1 backdrop-blur-sm border border-coral-pulse/30 shadow-lg">
                                    {cellNames[key as keyof typeof cellNames]}
                                  </div>
                                  <div className="self-end bg-coral-pulse rounded-lg px-2 py-1 text-white shadow-lg border border-coral-pulse/20">
                                    <div className="text-sm sm:text-base font-bold leading-none">
                                      {differentialCount[key] as number}
                                    </div>
                                    <div className="text-[10px] sm:text-xs opacity-90 leading-none">
                                      {calculatedValues[key as keyof typeof calculatedValues]?.percentage || "0.0"}%
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                        {differentialFields.map(({ key, sound, label, image }) => {
                          const cellNames = {
                            segmentedNeutrophils: 'SEG',
                            bandNeutrophils: 'BAND',
                            lymphocytes: 'LYM',
                            monocytes: 'MONO',
                            basophils: 'BASO',
                            reticulocytes: 'RET',
                            eosinophils: 'EOS',
                            nrbc: 'NRBC'
                          };
                          return (
                            <div key={key} className="text-center">
                              <label className="block text-misty-lilac text-sm font-medium mb-3 leading-tight">
                                {label}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleIncrement(key, sound)}
                                disabled={totalCells >= 100}
                                className="relative w-full aspect-square bg-gradient-to-br from-space-navy/20 to-space-navy/10 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group rounded-2xl mb-3"
                              >
                                <div className="absolute inset-1 rounded-xl overflow-hidden border-2 border-coral-pulse/40 group-hover:border-coral-pulse/70 transition-colors duration-300">
                                  <img 
                                    src={image} 
                                    alt={label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-between p-3">
                                  <div className="self-start text-xs font-bold text-white bg-space-navy/90 rounded-md px-2 py-1 backdrop-blur-sm border border-coral-pulse/30 shadow-lg">
                                    {cellNames[key as keyof typeof cellNames]}
                                  </div>
                                  <div className="self-end bg-coral-pulse rounded-lg px-3 py-2 text-white shadow-lg border border-coral-pulse/20">
                                    <div className="text-lg font-bold leading-none">
                                      {differentialCount[key] as number}
                                    </div>
                                    <div className="text-sm opacity-90 leading-none">
                                      {calculatedValues[key as keyof typeof calculatedValues]?.percentage || "0.0"}%
                                    </div>
                                  </div>
                                </div>
                              </button>
                              <div className="text-sm space-y-1">
                                <p className={`text-xs ${isOutOfRange(calculatedValues[key as keyof typeof calculatedValues]?.absolute || '0', key as keyof typeof normalValues.perro) ? 'text-coral-pulse' : 'text-electric-mint'}`}>
                                  {totalWhiteCells > 0 ? (calculatedValues[key as keyof typeof calculatedValues]?.absolute || "0.0") : "0.0"}
                                  <span className="text-misty-lilac/70"> x10³/μL</span>
                                </p>
                                <p className="text-xs text-lavender-fog/70 leading-tight">
                                  Normal: {normalValues[species][key as keyof typeof normalValues.perro][0]} - {normalValues[species][key as keyof typeof normalValues.perro][1]}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'observations' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-misty-lilac font-semibold text-sm mb-1">Hemotrópico</label>
                        <textarea
                          {...register("hemotropico")}
                          placeholder="Ej: Se observan formas compatibles con Mycoplasma hemofelis"
                          className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50 resize-none"
                          rows={3}
                        />
                        {errors.hemotropico && (
                          <p className="mt-1 text-sm text-coral-pulse">{errors.hemotropico.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-misty-lilac font-semibold text-sm mb-1">Observación</label>
                        <textarea
                          {...register("observacion")}
                          placeholder="Ej: Muestra con ligera hemólisis. Paciente febril, se sugiere repetir en 72h."
                          className="w-full bg-space-navy/60 border border-coral-pulse/30 rounded-2xl px-4 py-3 text-misty-lilac placeholder-lavender-fog focus:outline-none focus:border-coral-pulse/50 resize-none"
                          rows={4}
                        />
                        {errors.observacion && (
                          <p className="mt-1 text-sm text-coral-pulse">{errors.observacion.message}</p>
                        )}
                      </div>

                      {/* ✅ Botón de guardar SOLO en la última pestaña */}
                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-coral-pulse to-coral-pulse/80 text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                          {isPending ? (
                            <>
                              <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Guardar Examen
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de compartir resultados */}
     {showShareModal && savedExamData && patient && (
  <ShareResultsModal
    isOpen={showShareModal}
    onClose={() => {
      setShowShareModal(false);
      navigate(`/patients/${patientId}`);
    }}
    examData={savedExamData}
    patientData={{
      name: patient.name || 'Paciente',
      species: species,
      owner: {
        name: owner?.name || 'Propietario',
        contact: owner?.contact || ''
      },
      mainVet: patient.mainVet || 'No especificado', // ✅ Añadido
      refVet: patient.referringVet || 'No especificado' // ✅ Añadido
    }}
  />
)}
    </div>
  );
}