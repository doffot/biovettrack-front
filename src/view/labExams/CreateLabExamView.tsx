// views/CreateLabExamView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { createLabExam } from "../../api/labExamAPI";
import { getPatientById } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";
import { extractId } from "../../utils/extractId";

import ShareResultsModal from "../../components/ShareResultsModal";

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
import type { DifferentialField, LabExamFormData } from "../../types";
import { GeneralTab } from "../../components/labexam/GeneralTab";
import { DifferentialTab } from "../../components/labexam/DifferentialTab";
import { ObservationsTab } from "../../components/labexam/ObservationsTab";
import { LabExamHeader } from "../../components/labexam/LabExamHeader";
import { TabNavigation } from "../../components/labexam/TabNavigation";

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
  const [savedExamData, setSavedExamData] = useState<LabExamFormData | null>(null);
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

  const differentialFields: DifferentialField[] = useMemo(() => [
    { 
      key: "segmentedNeutrophils" as const, 
      sound: new Audio(segmentedSound), 
      label: "Neutrófilos Segmentados", 
      image: "/img/segmentedNeutrophils.png" 
    },
    { 
      key: "bandNeutrophils" as const, 
      sound: new Audio(bandSound), 
      label: "Neutrófilos en Banda", 
      image: "/img/band.png" 
    },
    { 
      key: "lymphocytes" as const, 
      sound: new Audio(lymphocytesSound), 
      label: "Linfocitos", 
      image: "/img/lymphocytes.png" 
    },
    { 
      key: "monocytes" as const, 
      sound: new Audio(monocytesSound), 
      label: "Monocitos", 
      image: "/img/monocytes.png" 
    },
    { 
      key: "basophils" as const, 
      sound: new Audio(basophilsSound), 
      label: "Basófilos", 
      image: "/img/basophils.png" 
    },
    { 
      key: "reticulocytes" as const, 
      sound: new Audio(reticulocytesSound), 
      label: "Reticulocitos", 
      image: "/img/reticulocytes.png" 
    },
    { 
      key: "eosinophils" as const, 
      sound: new Audio(eosinophilsSound), 
      label: "Eosinófilos", 
      image: "/img/eosinophils.png" 
    },
    { 
      key: "nrbc" as const, 
      sound: new Audio(nrbcSound), 
      label: "NRBC", 
      image: "/img/nrbc.png" 
    },
  ], []);

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: owner } = useQuery({
    queryKey: ["owner", patient?.owner],
    queryFn: () => {
      const ownerId = extractId(patient?.owner);
      return ownerId ? getOwnersById(ownerId) : null;
    },
    enabled: !!patient?.owner,
  });

  const hasActiveAppointments = false;

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
      } as LabExamFormData);
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
    const finalData = {
      ...data,
      differentialCount,
      totalCells,
    } as LabExamFormData;
    mutate(finalData);
  };

  const isOutOfRange = (value: number | string | undefined, rangeKey: keyof typeof normalValues.perro) => {
    if (value === undefined || value === null) return false;
    const numValue = Number(value);
    const range = normalValues[species][rangeKey];
    return numValue < range[0] || numValue > range[1];
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            species={species}
            onSpeciesChange={setSpecies}
            register={register}
            errors={errors}
            watch={watch}
            isOutOfRange={isOutOfRange}
          />
        );
      case 'differential':
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
      case 'observations':
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
    <div className="min-h-screen bg-vet-light pb-20">
      <LabExamHeader
        patientId={patientId!}
        patient={patient}
        patientLoading={patientLoading}
        hasActiveAppointments={hasActiveAppointments}
      />

      <div className="pt-32 lg:pt-36 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`transform transition-all duration-1200 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
            <div className="bg-white rounded-xl shadow-card border-l-4 border-vet-primary overflow-hidden">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-4">
                <div className="space-y-4">
                  {renderActiveTab()}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

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
            mainVet: patient.mainVet || 'No especificado',
            refVet: patient.referringVet || 'No especificado'
          }}
        />
      )}
    </div>
  );
}