// src/views/consultations/CreateConsultationView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, ClipboardList, Stethoscope, FileText, Check } from "lucide-react";
import { getPatientById } from "../../api/patientAPI";
import { createConsultation } from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { ConsultationFormData } from "../../types/consultation";
import AnamnesisTab from "../../components/consultations/AnamnesisTab";
import PhysicalExamTab from "../../components/consultations/PhysicalExamTab";
import DiagnosisTab from "../../components/consultations/DiagnosisTab";

const TABS = [
  { id: "anamnesis", label: "Anamnesis", icon: ClipboardList },
  { id: "examen", label: "Examen Físico", icon: Stethoscope },
  { id: "diagnostico", label: "Diagnóstico", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const initialFormData: ConsultationFormData = {
  consultationDate: new Date().toISOString().split("T")[0],

  // Anamnesis
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

  // Vacunas perro
  parvovirusVaccine: "",
  parvovirusVaccineDate: "",
  quintupleSextupleVaccine: "",
  quintupleSextupleVaccineDate: "",
  rabiesVaccineDogs: "",
  rabiesVaccineDateDogs: "",
  dewormingDogs: "",

  // Vacunas gato
  tripleQuintupleFelineVaccine: "",
  tripleQuintupleFelineVaccineDate: "",
  rabiesVaccineCats: "",
  rabiesVaccineDateCats: "",
  dewormingCats: "",

  // Historial
  previousIllnesses: "",
  previousSurgeries: "",
  adverseReactions: "",
  lastHeatOrBirth: "",
  mounts: "",

  // Examen físico
  temperature: "",
  lymphNodes: "",
  heartRate: "",
  respiratoryRate: "",
  capillaryRefillTime: "",
  weight: "",

  // Sistemas
  integumentarySystem: "",
  cardiovascularSystem: "",
  ocularSystem: "",
  respiratorySystem: "",
  nervousSystem: "",
  musculoskeletalSystem: "",
  gastrointestinalSystem: "",

  // Diagnóstico
  presumptiveDiagnosis: "",
  definitiveDiagnosis: "",
  requestedTests: "",
  treatmentPlan: "",

  // Costo
  cost: "",
};

export default function CreateConsultationView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("anamnesis");
  const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);

  // Obtener datos del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ConsultationFormData) => createConsultation(patientId!, data),
    onSuccess: () => {
      toast.success("Consulta registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["consultations", patientId] });
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

  // Función helper para limpiar valores vacíos
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

      // Anamnesis - obligatorios
      reasonForVisit: formData.reasonForVisit,
      symptomOnset: formData.symptomOnset,
      symptomEvolution: formData.symptomEvolution as "empeorado" | "mejorado" | "estable",
      isNeutered: formData.isNeutered as boolean,
      appetite: formData.appetite as "Normal" | "Mucho" | "Poco" | "Nada",
      breathingDifficulty: formData.breathingDifficulty as boolean,
      itchingOrExcessiveLicking: formData.itchingOrExcessiveLicking as boolean,
      feverSigns: formData.feverSigns as boolean,
      lethargyOrWeakness: formData.lethargyOrWeakness as boolean,

      // Anamnesis - opcionales
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

      // Vacunas perro
      parvovirusVaccine: cleanValue(formData.parvovirusVaccine),
      parvovirusVaccineDate: cleanValue(formData.parvovirusVaccineDate),
      quintupleSextupleVaccine: cleanValue(formData.quintupleSextupleVaccine),
      quintupleSextupleVaccineDate: cleanValue(formData.quintupleSextupleVaccineDate),
      rabiesVaccineDogs: cleanValue(formData.rabiesVaccineDogs),
      rabiesVaccineDateDogs: cleanValue(formData.rabiesVaccineDateDogs),
      dewormingDogs: cleanValue(formData.dewormingDogs),

      // Vacunas gato
      tripleQuintupleFelineVaccine: cleanValue(formData.tripleQuintupleFelineVaccine),
      tripleQuintupleFelineVaccineDate: cleanValue(formData.tripleQuintupleFelineVaccineDate),
      rabiesVaccineCats: cleanValue(formData.rabiesVaccineCats),
      rabiesVaccineDateCats: cleanValue(formData.rabiesVaccineDateCats),
      dewormingCats: cleanValue(formData.dewormingCats),

      // Historial
      previousIllnesses: cleanValue(formData.previousIllnesses),
      previousSurgeries: cleanValue(formData.previousSurgeries),
      adverseReactions: cleanValue(formData.adverseReactions),
      lastHeatOrBirth: cleanValue(formData.lastHeatOrBirth),
      mounts: cleanValue(formData.mounts),

      // Examen físico - obligatorios
      temperature: Number(formData.temperature),
      heartRate: Number(formData.heartRate),
      respiratoryRate: Number(formData.respiratoryRate),
      weight: Number(formData.weight),

      // Examen físico - opcionales
      lymphNodes: cleanValue(formData.lymphNodes),
      capillaryRefillTime: cleanValue(formData.capillaryRefillTime),

      // Sistemas
      integumentarySystem: cleanValue(formData.integumentarySystem),
      cardiovascularSystem: cleanValue(formData.cardiovascularSystem),
      ocularSystem: cleanValue(formData.ocularSystem),
      respiratorySystem: cleanValue(formData.respiratorySystem),
      nervousSystem: cleanValue(formData.nervousSystem),
      musculoskeletalSystem: cleanValue(formData.musculoskeletalSystem),
      gastrointestinalSystem: cleanValue(formData.gastrointestinalSystem),

      // Diagnóstico - obligatorios
      presumptiveDiagnosis: formData.presumptiveDiagnosis,
      definitiveDiagnosis: formData.definitiveDiagnosis,
      treatmentPlan: formData.treatmentPlan,
      cost: Number(formData.cost),

      // Diagnóstico - opcional
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
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
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
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nueva Consulta</h1>
            {patient && (
              <p className="text-sm text-gray-500">
                {patient.name} • {patient.species}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isComplete = getTabStatus(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-vet-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 max-h-[55vh] overflow-y-auto">
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
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
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
                ? "bg-vet-primary hover:bg-vet-secondary text-white shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Guardar Consulta
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goToNextTab}
            className="px-4 py-2 text-sm font-medium rounded-lg text-vet-primary hover:bg-vet-primary/10 transition-colors"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}