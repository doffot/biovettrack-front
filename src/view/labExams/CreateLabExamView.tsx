import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FlaskConical,
  Calendar,
  User,
  Stethoscope,
  X,
} from "lucide-react";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import ShareResultsModal from "../../components/ShareResultsModal";
import { PatientSelectionTab } from "../../components/labexam/PatientSelectionTab";

// Sonidos
import segmentedSound from "/sounds/segmented.mp3";
import bandSound from "/sounds/band.mp3";
import lymphocytesSound from "/sounds/lymphocytes.mp3";
import monocytesSound from "/sounds/monocytes.mp3";
import basophilsSound from "/sounds/basophils.mp3";
import reticulocytesSound from "/sounds/reticulocytes.mp3";
import eosinophilsSound from "/sounds/eosinophils.mp3";
import nrbcSound from "/sounds/nrbc.mp3";
import errorSound from "/sounds/error.mp3";

import type { DifferentialField, LabExamFormData, LabExam } from "../../types";
import { GeneralTab } from "../../components/labexam/GeneralTab";
import { DifferentialTab } from "../../components/labexam/DifferentialTab";
import { ObservationsTab } from "../../components/labexam/ObservationsTab";
import { TabNavigation } from "../../components/labexam/TabNavigation";
import { PaymentModal } from "../../components/payment/PaymentModal";

// Valores normales
const normalValues = {
  canino: {
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
    reticulocytes: [0, 1.5],
  },
  felino: {
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
    reticulocytes: [0, 1.5],
  },
};

export default function CreateLabExamView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [species] = useState<"canino" | "felino">("canino");
  const [activeTab, setActiveTab] = useState<
    "patient" | "general" | "differential" | "observations"
  >("patient");

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
  const [lastAction, setLastAction] = useState<{
    field: keyof LabExamFormData["differentialCount"];
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedExamData, setSavedExamData] = useState<LabExam | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [examCostUSD, setExamCostUSD] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LabExamFormData>({
    defaultValues: {
      patientName: "",
      species: "canino",
      breed: "",
      sex: "",
      age: "",
      weight: undefined,
      cost: 0,
      date: new Date().toISOString().split("T")[0],
      hematocrit: 0,
      whiteBloodCells: 0,
      totalProtein: 0,
      platelets: 0,
      hemotropico: "",
      observacion: "",
      treatingVet: "",
      ownerName: "",
      ownerPhone: "",
      patientId: undefined,
    },
  });

  useEffect(() => {
    setValue("species", species);
  }, [species, setValue]);

  const totalWhiteCells = watch("whiteBloodCells") || 0;
  const patientName = watch("patientName");
  const ownerName = watch("ownerName");
  const treatingVet = watch("treatingVet");
  const examDate = watch("date");

  const isPatientSelected = Boolean(patientName && patientName.trim() !== "");

  const calculatedValues = useMemo(() => {
    const calculated = {} as Record<
      keyof LabExamFormData["differentialCount"],
      {
        percentage: string;
        absolute: string;
      }
    >;

    Object.keys(differentialCount).forEach((key) => {
      const cellKey = key as keyof LabExamFormData["differentialCount"];
      const percentage =
        totalCells > 0 ? (differentialCount[cellKey] ?? 0) / totalCells : 0;
      const absolute = percentage * totalWhiteCells || 0;

      calculated[cellKey] = {
        percentage: (percentage * 100).toFixed(1),
        absolute: absolute.toFixed(1),
      };
    });

    return calculated;
  }, [differentialCount, totalCells, totalWhiteCells]);

  const differentialFields: DifferentialField[] = useMemo(
    () => [
      {
        key: "segmentedNeutrophils" as const,
        sound: new Audio(segmentedSound),
        label: "Neutrófilos Segmentados",
        image: "/img/segmentedNeutrophils.png",
      },
      {
        key: "bandNeutrophils" as const,
        sound: new Audio(bandSound),
        label: "Neutrófilos en Banda",
        image: "/img/band.png",
      },
      {
        key: "lymphocytes" as const,
        sound: new Audio(lymphocytesSound),
        label: "Linfocitos",
        image: "/img/lymphocytes.png",
      },
      {
        key: "monocytes" as const,
        sound: new Audio(monocytesSound),
        label: "Monocitos",
        image: "/img/monocytes.png",
      },
      {
        key: "basophils" as const,
        sound: new Audio(basophilsSound),
        label: "Basófilos",
        image: "/img/basophils.png",
      },
      {
        key: "reticulocytes" as const,
        sound: new Audio(reticulocytesSound),
        label: "Reticulocitos",
        image: "/img/reticulocytes.png",
      },
      {
        key: "eosinophils" as const,
        sound: new Audio(eosinophilsSound),
        label: "Eosinófilos",
        image: "/img/eosinophils.png",
      },
      {
        key: "nrbc" as const,
        sound: new Audio(nrbcSound),
        label: "NRBC",
        image: "/img/nrbc.png",
      },
    ],
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LabExamFormData) => createLabExam(data),
    onSuccess: (data) => {
      toast.success("Examen de laboratorio creado con éxito");
      setSavedExamData(data);
      setShowShareModal(true);
      queryClient.invalidateQueries({ queryKey: ["labExams"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handlePaymentConfirm = (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amountPaid = isPayingInBs
      ? paymentData.addAmountPaidBs
      : paymentData.addAmountPaidUSD;
    const currency = isPayingInBs ? "Bs" : "USD";

    const finalData: LabExamFormData = {
      ...watch(),
      differentialCount,
      totalCells,
      ownerName: watch("ownerName")?.trim() || undefined,
      ownerPhone: watch("ownerPhone")?.trim() || undefined,
      paymentMethodId: paymentData.paymentMethodId,
      paymentReference: paymentData.reference,
      exchangeRate: paymentData.exchangeRate,
      paymentAmount: amountPaid,
      paymentCurrency: currency,
      isPartialPayment: paymentData.isPartial,
      creditAmountUsed: paymentData.creditAmountUsed,
    };

    mutate(finalData);
    setShowPaymentModal(false);
  };

  const handleIncrement = (
    field: keyof LabExamFormData["differentialCount"],
    sound: HTMLAudioElement
  ) => {
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

  const handleClearPatient = () => {
    setValue("patientId", undefined);
    setValue("patientName", "");
    setValue("species", "canino");
    setValue("breed", "");
    setValue("sex", "");
    setValue("age", "");
    setValue("weight", undefined);
    setValue("ownerName", "");
    setValue("treatingVet", "");
    setActiveTab("patient");
  };

  const onSubmit = (data: LabExamFormData) => {
    if (!isPatientSelected) {
      toast.error("Debes seleccionar un paciente primero");
      setActiveTab("patient");
      return;
    }

    const finalData: LabExamFormData = {
      ...data,
      differentialCount,
      totalCells,
      ownerName: data.ownerName?.trim() || undefined,
      ownerPhone: data.ownerPhone?.trim() || undefined,
    };

    if ((finalData.cost ?? 0) <= 0) {
      toast.error("El costo del examen debe ser mayor a 0");
      setActiveTab("general");
      return;
    }

    setExamCostUSD(finalData.cost || 0);

    if (finalData.patientId) {
      mutate(finalData);
    } else if (finalData.ownerName) {
      setShowPaymentModal(true);
    } else {
      toast.error("Debe ingresar los datos del dueño");
      return;
    }
  };

  const isOutOfRange = (
    value: number | string | undefined,
    rangeKey: keyof typeof normalValues.canino
  ) => {
    if (value === undefined || value === null) return false;
    const numValue = Number(value);
    const range = normalValues[species][rangeKey];
    return numValue < range[0] || numValue > range[1];
  };

  const handleTabChange = (
    tab: "patient" | "general" | "differential" | "observations"
  ) => {
    if (tab !== "patient" && !isPatientSelected) {
      toast.error("Primero selecciona un paciente");
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (totalCells === 100) {
      if (!errorAudioRef.current) {
        errorAudioRef.current = new Audio(errorSound);
      }
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current
        .play()
        .catch((e) => console.warn("Error al reproducir sonido de 100:", e));
    }
  }, [totalCells]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "patient":
        return (
          <PatientSelectionTab
            onPatientSelected={() => setActiveTab("general")}
            setValues={setValue}
            currentPatientName={watch("patientName")}
          />
        );
      case "general":
        return (
          <GeneralTab
            species={species}
            register={register}
            errors={errors}
            watch={watch}
          />
        );
      case "differential":
        return (
          <DifferentialTab
            differentialCount={differentialCount}
            totalCells={totalCells}
            totalWhiteCells={totalWhiteCells}
            species={species}
            lastAction={lastAction}
            calculatedValues={calculatedValues}
            differentialFields={differentialFields}
            onIncrement={handleIncrement}
            onUndo={handleUndo}
            onReset={handleReset}
            isOutOfRange={isOutOfRange}
          />
        );
      case "observations":
        return (
          <ObservationsTab
            register={register}
            errors={errors}
            isPending={isPending}
            onSubmit={handleSubmit(onSubmit)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-vet-light text-vet-text transition-colors duration-300">
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div
            className={`transform transition-all duration-500 ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-card hover:bg-vet-primary hover:text-white text-vet-muted transition-all duration-200 border border-border group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary text-white shadow-lg shadow-vet-primary/25">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-vet-text">
                      Nuevo Hemograma
                    </h1>
                    <p className="text-xs sm:text-sm text-vet-muted">
                      Análisis hematológico completo
                    </p>
                  </div>
                </div>
              </div>

              {isPatientSelected && (
                <button
                  type="button"
                  onClick={handleClearPatient}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cambiar paciente
                </button>
              )}
            </div>

            {isPatientSelected && (
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-card rounded-xl p-3 shadow-soft border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-vet-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-vet-muted uppercase tracking-wide font-medium">
                          Paciente
                        </p>
                        <p className="text-sm font-bold text-vet-text truncate">
                          {patientName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-3 shadow-soft border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-cyan-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-vet-muted uppercase tracking-wide font-medium">
                          Dueño
                        </p>
                        <p className="text-sm font-bold text-vet-text truncate">
                          {ownerName || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-3 shadow-soft border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-vet-muted uppercase tracking-wide font-medium">
                          Veterinario
                        </p>
                        <p className="text-sm font-bold text-vet-text truncate">
                          {treatingVet || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-3 shadow-soft border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-vet-muted uppercase tracking-wide font-medium">
                          Fecha
                        </p>
                        <p className="text-sm font-bold text-vet-text">
                          {formatDate(examDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`transform transition-all duration-700 delay-150 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="bg-card rounded-2xl shadow-xl shadow-vet-primary/5 overflow-hidden border border-border">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isPatientSelected={isPatientSelected}
              />

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="p-4 sm:p-6">{renderActiveTab()}</div>
              </form>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {["patient", "general", "differential", "observations"].map(
                    (tab, index) => {
                      const currentIndex = [
                        "patient",
                        "general",
                        "differential",
                        "observations",
                      ].indexOf(activeTab);
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const isLocked = index > 0 && !isPatientSelected;

                      return (
                        <div
                          key={tab}
                          className={`transition-all duration-300 ${
                            isLocked
                              ? "w-2 h-2 rounded-full bg-vet-muted/30"
                              : isCompleted
                              ? "w-6 h-2 rounded-full bg-emerald-500"
                              : isCurrent
                              ? "w-6 h-2 rounded-full bg-vet-primary animate-pulse"
                              : "w-2 h-2 rounded-full bg-vet-muted/50"
                          }`}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-sm text-vet-muted font-medium">
                  {isPatientSelected
                    ? `Paso ${
                        [
                          "patient",
                          "general",
                          "differential",
                          "observations",
                        ].indexOf(activeTab) + 1
                      } de 4`
                    : "Selecciona un paciente"}
                </span>
              </div>

              {totalCells > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card shadow-soft border border-border">
                  <span className="text-sm text-vet-muted">Células:</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-lg font-bold ${
                        totalCells === 100
                          ? "text-emerald-500"
                          : "text-vet-accent"
                      }`}
                    >
                      {totalCells}
                    </span>
                    <span className="text-sm text-vet-muted">/100</span>
                  </div>
                  {totalCells === 100 && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                      ✓ Completo
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          amountUSD={examCostUSD}
        />
      )}

      {showShareModal && savedExamData && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            navigate("/lab-exams");
          }}
          examData={savedExamData}
          patientData={{
            name: savedExamData.patientName || "Paciente",
            species: savedExamData.species as "canino" | "felino",
            owner: {
              name: savedExamData.ownerName || "—",
              contact: savedExamData.ownerPhone || "—",
            },
            mainVet: savedExamData.treatingVet || "—",
            refVet: "—",
          }}
        />
      )}
    </div>
  );
}