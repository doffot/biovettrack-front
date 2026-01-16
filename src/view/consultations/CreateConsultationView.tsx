import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, ClipboardList, Stethoscope, FileText, Check } from "lucide-react";
import { getPatientById } from "../../api/patientAPI";
import { createConsultation, saveDraft, getDraft } from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { ConsultationFormData, Consultation } from "../../types/consultation";
import AnamnesisTab from "../../components/consultations/AnamnesisTab";
import PhysicalExamTab from "../../components/consultations/PhysicalExamTab";
import DiagnosisTab from "../../components/consultations/DiagnosisTab";

const TABS = [
  { id: "anamnesis", label: "Anamnesis", icon: ClipboardList },
  { id: "examen", label: "Examen Físico", icon: Stethoscope },
  { id: "diagnostico", label: "Diagnóstico", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];
type SaveStatus = "idle" | "saving" | "saved" | "error";

const initialFormData: ConsultationFormData = {
  consultationDate: new Date().toISOString().split("T")[0],
  reasonForVisit: "",
  symptomOnset: "",
  symptomEvolution: "",
  isNeutered: null,
  cohabitantAnimals: "",
  contactWithStrays: "",
  feeding: "",
  appetite: "",
  vomiting: "",
  bowelMovementFrequency: "",
  stoolConsistency: "",
  bloodOrParasitesInStool: "",
  normalUrination: "",
  urineFrequencyAndAmount: "",
  urineColor: "",
  painOrDifficultyUrinating: "",
  cough: "",
  sneezing: "",
  breathingDifficulty: null,
  itchingOrExcessiveLicking: null,
  hairLossOrSkinLesions: "",
  eyeDischarge: "",
  earIssues: "",
  feverSigns: null,
  lethargyOrWeakness: null,
  currentTreatment: "",
  medications: "",
  parvovirusVaccine: "",
  parvovirusVaccineDate: "",
  quintupleSextupleVaccine: "",
  quintupleSextupleVaccineDate: "",
  rabiesVaccineDogs: "",
  rabiesVaccineDateDogs: "",
  dewormingDogs: "",
  tripleQuintupleFelineVaccine: "",
  tripleQuintupleFelineVaccineDate: "",
  rabiesVaccineCats: "",
  rabiesVaccineDateCats: "",
  dewormingCats: "",
  previousIllnesses: "",
  previousSurgeries: "",
  adverseReactions: "",
  lastHeatOrBirth: "",
  mounts: "",
  temperature: "",
  lymphNodes: "",
  heartRate: "",
  respiratoryRate: "",
  capillaryRefillTime: "",
  weight: "",
  integumentarySystem: "",
  cardiovascularSystem: "",
  ocularSystem: "",
  respiratorySystem: "",
  nervousSystem: "",
  musculoskeletalSystem: "",
  gastrointestinalSystem: "",
  presumptiveDiagnosis: "",
  definitiveDiagnosis: "",
  requestedTests: "",
  treatmentPlan: "",
  cost: "",
};

// ✅ Función helper para convertir Draft a FormData
function draftToFormData(draft: Consultation): ConsultationFormData {
  return {
    consultationDate: draft.consultationDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    
    reasonForVisit: draft.reasonForVisit || "",
    symptomOnset: draft.symptomOnset || "",
    symptomEvolution: draft.symptomEvolution || "",
    isNeutered: draft.isNeutered ?? null,
    cohabitantAnimals: draft.cohabitantAnimals || "",
    contactWithStrays: draft.contactWithStrays || "",
    feeding: draft.feeding || "",
    appetite: draft.appetite || "",
    vomiting: draft.vomiting || "",
    bowelMovementFrequency: draft.bowelMovementFrequency || "",
    stoolConsistency: draft.stoolConsistency || "",
    bloodOrParasitesInStool: draft.bloodOrParasitesInStool || "",
    normalUrination: draft.normalUrination || "",
    urineFrequencyAndAmount: draft.urineFrequencyAndAmount || "",
    urineColor: draft.urineColor || "",
    painOrDifficultyUrinating: draft.painOrDifficultyUrinating || "",
    cough: draft.cough || "",
    sneezing: draft.sneezing || "",
    breathingDifficulty: draft.breathingDifficulty ?? null,
    itchingOrExcessiveLicking: draft.itchingOrExcessiveLicking ?? null,
    hairLossOrSkinLesions: draft.hairLossOrSkinLesions || "",
    eyeDischarge: draft.eyeDischarge || "",
    earIssues: draft.earIssues || "",
    feverSigns: draft.feverSigns ?? null,
    lethargyOrWeakness: draft.lethargyOrWeakness ?? null,
    currentTreatment: draft.currentTreatment || "",
    medications: draft.medications || "",
    
    parvovirusVaccine: draft.parvovirusVaccine || "",
    parvovirusVaccineDate: draft.parvovirusVaccineDate?.split("T")[0] || "",
    quintupleSextupleVaccine: draft.quintupleSextupleVaccine || "",
    quintupleSextupleVaccineDate: draft.quintupleSextupleVaccineDate?.split("T")[0] || "",
    rabiesVaccineDogs: draft.rabiesVaccineDogs || "",
    rabiesVaccineDateDogs: draft.rabiesVaccineDateDogs?.split("T")[0] || "",
    dewormingDogs: draft.dewormingDogs || "",
    
    tripleQuintupleFelineVaccine: draft.tripleQuintupleFelineVaccine || "",
    tripleQuintupleFelineVaccineDate: draft.tripleQuintupleFelineVaccineDate?.split("T")[0] || "",
    rabiesVaccineCats: draft.rabiesVaccineCats || "",
    rabiesVaccineDateCats: draft.rabiesVaccineDateCats?.split("T")[0] || "",
    dewormingCats: draft.dewormingCats || "",
    
    previousIllnesses: draft.previousIllnesses || "",
    previousSurgeries: draft.previousSurgeries || "",
    adverseReactions: draft.adverseReactions || "",
    lastHeatOrBirth: draft.lastHeatOrBirth || "",
    mounts: draft.mounts || "",
    
    temperature: draft.temperature !== undefined && draft.temperature !== null ? draft.temperature : "",
    lymphNodes: draft.lymphNodes || "",
    heartRate: draft.heartRate !== undefined && draft.heartRate !== null ? draft.heartRate : "",
    respiratoryRate: draft.respiratoryRate !== undefined && draft.respiratoryRate !== null ? draft.respiratoryRate : "",
    capillaryRefillTime: draft.capillaryRefillTime || "",
    weight: draft.weight !== undefined && draft.weight !== null ? draft.weight : "",
    
    integumentarySystem: draft.integumentarySystem || "",
    cardiovascularSystem: draft.cardiovascularSystem || "",
    ocularSystem: draft.ocularSystem || "",
    respiratorySystem: draft.respiratorySystem || "",
    nervousSystem: draft.nervousSystem || "",
    musculoskeletalSystem: draft.musculoskeletalSystem || "",
    gastrointestinalSystem: draft.gastrointestinalSystem || "",
    
    presumptiveDiagnosis: draft.presumptiveDiagnosis || "",
    definitiveDiagnosis: draft.definitiveDiagnosis || "",
    requestedTests: draft.requestedTests || "",
    treatmentPlan: draft.treatmentPlan || "",
    cost: draft.cost !== undefined && draft.cost !== null ? draft.cost : "",
  };
}

export default function CreateConsultationView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("anamnesis");
  const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [draftId, setDraftId] = useState<string | null>(null);

  // Obtener datos del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // ✅ Cargar borrador al montar
  useEffect(() => {
    if (!patientId) return;

    getDraft(patientId).then((draft) => {
      if (draft) {
        console.log("📄 Borrador encontrado, cargando...");
        setDraftId(draft._id);
        setFormData(draftToFormData(draft));
        toast.success("Borrador cargado");
      }
    });
  }, [patientId]);

  // ✅ Guardar borrador automático
  const { mutate: saveDraftMutation } = useMutation({
    mutationFn: (data: Partial<ConsultationFormData>) => saveDraft(patientId!, data),
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: (data) => {
      setSaveStatus("saved");
      if (!draftId) {
        setDraftId(data._id);
      }
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });

  // ✅ Auto-guardar cuando cambia de tab
  const handleTabChange = (newTab: TabId) => {
    saveDraftMutation(formData);
    setActiveTab(newTab);
  };

  // ✅ Finalizar consulta
  const { mutate, isPending } = useMutation({
    mutationFn: (data: ConsultationFormData) => createConsultation(patientId!, data),
    onSuccess: () => {
      toast.success("Consulta registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["consultations", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments"] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Validación por tab
  const isAnamnesisValid = () => {
    return (
      formData.reasonForVisit.trim() !== "" &&
      formData.symptomOnset.trim() !== "" &&
      formData.symptomEvolution !== "" &&
      formData.isNeutered !== null &&
      formData.appetite !== "" &&
      formData.breathingDifficulty !== null &&
      formData.itchingOrExcessiveLicking !== null &&
      formData.feverSigns !== null &&
      formData.lethargyOrWeakness !== null
    );
  };

  const isPhysicalExamValid = () => {
    const temp = Number(formData.temperature);
    const hr = Number(formData.heartRate);
    const rr = Number(formData.respiratoryRate);
    const w = Number(formData.weight);

    return (
      formData.temperature !== "" &&
      temp >= 35 &&
      temp <= 42 &&
      formData.heartRate !== "" &&
      hr >= 0 &&
      hr <= 300 &&
      formData.respiratoryRate !== "" &&
      rr >= 0 &&
      rr <= 100 &&
      formData.weight !== "" &&
      w > 0
    );
  };

  const isDiagnosisValid = () => {
    return (
      formData.presumptiveDiagnosis.trim() !== "" &&
      formData.definitiveDiagnosis.trim() !== "" &&
      formData.treatmentPlan.trim() !== "" &&
      formData.cost !== "" &&
      Number(formData.cost) > 0
    );
  };

  const isFormValid = isAnamnesisValid() && isPhysicalExamValid() && isDiagnosisValid();

  const cleanValue = <T,>(value: T): T | undefined => {
    if (value === "" || value === null) return undefined;
    return value;
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      if (!isAnamnesisValid()) {
        toast.error("Complete los campos obligatorios en Anamnesis");
        setActiveTab("anamnesis");
        return;
      }
      if (!isPhysicalExamValid()) {
        toast.error("Verifique los valores del Examen Físico");
        setActiveTab("examen");
        return;
      }
      if (!isDiagnosisValid()) {
        toast.error("Complete los campos obligatorios en Diagnóstico");
        setActiveTab("diagnostico");
        return;
      }
      return;
    }

    const dataToSend: ConsultationFormData = {
      consultationDate: formData.consultationDate,
      reasonForVisit: formData.reasonForVisit,
      symptomOnset: formData.symptomOnset,
      symptomEvolution: formData.symptomEvolution as "empeorado" | "mejorado" | "estable",
      isNeutered: formData.isNeutered as boolean,
      appetite: formData.appetite as "Normal" | "Mucho" | "Poco" | "Nada",
      breathingDifficulty: formData.breathingDifficulty as boolean,
      itchingOrExcessiveLicking: formData.itchingOrExcessiveLicking as boolean,
      feverSigns: formData.feverSigns as boolean,
      lethargyOrWeakness: formData.lethargyOrWeakness as boolean,
      cohabitantAnimals: cleanValue(formData.cohabitantAnimals),
      contactWithStrays: cleanValue(formData.contactWithStrays),
      feeding: cleanValue(formData.feeding),
      vomiting: cleanValue(formData.vomiting),
      bowelMovementFrequency: cleanValue(formData.bowelMovementFrequency),
      stoolConsistency: cleanValue(formData.stoolConsistency) as
        | "normal"
        | "dura"
        | "pastosa"
        | "líquida"
        | undefined,
      bloodOrParasitesInStool: cleanValue(formData.bloodOrParasitesInStool),
      normalUrination: cleanValue(formData.normalUrination),
      urineFrequencyAndAmount: cleanValue(formData.urineFrequencyAndAmount),
      urineColor: cleanValue(formData.urineColor),
      painOrDifficultyUrinating: cleanValue(formData.painOrDifficultyUrinating),
      cough: cleanValue(formData.cough),
      sneezing: cleanValue(formData.sneezing),
      hairLossOrSkinLesions: cleanValue(formData.hairLossOrSkinLesions),
      eyeDischarge: cleanValue(formData.eyeDischarge),
      earIssues: cleanValue(formData.earIssues),
      currentTreatment: cleanValue(formData.currentTreatment),
      medications: cleanValue(formData.medications),
      parvovirusVaccine: cleanValue(formData.parvovirusVaccine),
      parvovirusVaccineDate: cleanValue(formData.parvovirusVaccineDate),
      quintupleSextupleVaccine: cleanValue(formData.quintupleSextupleVaccine),
      quintupleSextupleVaccineDate: cleanValue(formData.quintupleSextupleVaccineDate),
      rabiesVaccineDogs: cleanValue(formData.rabiesVaccineDogs),
      rabiesVaccineDateDogs: cleanValue(formData.rabiesVaccineDateDogs),
      dewormingDogs: cleanValue(formData.dewormingDogs),
      tripleQuintupleFelineVaccine: cleanValue(formData.tripleQuintupleFelineVaccine),
      tripleQuintupleFelineVaccineDate: cleanValue(formData.tripleQuintupleFelineVaccineDate),
      rabiesVaccineCats: cleanValue(formData.rabiesVaccineCats),
      rabiesVaccineDateCats: cleanValue(formData.rabiesVaccineDateCats),
      dewormingCats: cleanValue(formData.dewormingCats),
      previousIllnesses: cleanValue(formData.previousIllnesses),
      previousSurgeries: cleanValue(formData.previousSurgeries),
      adverseReactions: cleanValue(formData.adverseReactions),
      lastHeatOrBirth: cleanValue(formData.lastHeatOrBirth),
      mounts: cleanValue(formData.mounts),
      temperature: Number(formData.temperature),
      heartRate: Number(formData.heartRate),
      respiratoryRate: Number(formData.respiratoryRate),
      weight: Number(formData.weight),
      lymphNodes: cleanValue(formData.lymphNodes),
      capillaryRefillTime: cleanValue(formData.capillaryRefillTime),
      integumentarySystem: cleanValue(formData.integumentarySystem),
      cardiovascularSystem: cleanValue(formData.cardiovascularSystem),
      ocularSystem: cleanValue(formData.ocularSystem),
      respiratorySystem: cleanValue(formData.respiratorySystem),
      nervousSystem: cleanValue(formData.nervousSystem),
      musculoskeletalSystem: cleanValue(formData.musculoskeletalSystem),
      gastrointestinalSystem: cleanValue(formData.gastrointestinalSystem),
      presumptiveDiagnosis: formData.presumptiveDiagnosis,
      definitiveDiagnosis: formData.definitiveDiagnosis,
      treatmentPlan: formData.treatmentPlan,
      cost: Number(formData.cost),
      requestedTests: cleanValue(formData.requestedTests),
    };

    mutate(dataToSend);
  };

  const getTabStatus = (tabId: TabId) => {
    switch (tabId) {
      case "anamnesis":
        return isAnamnesisValid();
      case "examen":
        return isPhysicalExamValid();
      case "diagnostico":
        return isDiagnosisValid();
      default:
        return false;
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(TABS[currentIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      handleTabChange(TABS[currentIndex + 1].id);
    }
  };

  const isLastTab = activeTab === "diagnostico";
  const isFirstTab = activeTab === "anamnesis";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--color-vet-text)]">Nueva Consulta</h1>
              {/* ✅ Indicador de guardado */}
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-vet-muted)]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Guardando...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check className="w-3 h-3" />
                  Guardado
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  Error al guardar
                </span>
              )}
            </div>
            {patient && (
              <p className="text-sm text-[var(--color-vet-muted)]">
                {patient.name} • {patient.species}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-[var(--color-vet-muted)] font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--color-hover)] p-1 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isComplete = getTabStatus(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-card)] text-[var(--color-vet-accent)] shadow-sm"
                  : "text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isComplete && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--color-hover)] rounded-xl p-4 sm:p-6 max-h-[55vh] overflow-y-auto border border-[var(--color-border)]">
        {activeTab === "anamnesis" && (
          <AnamnesisTab
            formData={formData}
            setFormData={setFormData}
            patientSpecies={patient?.species || ""}
            patientSex={patient?.sex || ""}
          />
        )}

        {activeTab === "examen" && (
          <PhysicalExamTab formData={formData} setFormData={setFormData} />
        )}

        {activeTab === "diagnostico" && (
          <DiagnosisTab formData={formData} setFormData={setFormData} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={goToPreviousTab}
          disabled={isFirstTab}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isFirstTab
              ? "text-[var(--color-vet-muted)] opacity-40 cursor-not-allowed"
              : "text-[var(--color-vet-text)] hover:bg-[var(--color-hover)]"
          }`}
        >
          ← Anterior
        </button>

        {isLastTab ? (
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isPending}
            className={`px-6 py-2.5 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isFormValid && !isPending
                ? "bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white shadow-sm"
                : "bg-[var(--color-hover)] text-[var(--color-vet-muted)] opacity-40 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Finalizar Consulta
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goToNextTab}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-accent)]/10 transition-colors"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}