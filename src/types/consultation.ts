// src/types/consultation.ts
import { z } from "zod";

// Schema para validación
export const consultationSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  veterinarianId: z.string(),
  consultationDate: z.string(),
  
  // Anamnesis
  reasonForVisit: z.string(),
  symptomOnset: z.string(),
  symptomEvolution: z.enum(["empeorado", "mejorado", "estable"]),
  isNeutered: z.boolean(),
  cohabitantAnimals: z.string().optional(),
  contactWithStrays: z.string().optional(),
  feeding: z.string().optional(),
  appetite: z.enum(["Normal", "Mucho", "Poco", "Nada"]),
  vomiting: z.string().optional(),
  bowelMovementFrequency: z.string().optional(),
  stoolConsistency: z.enum(["normal", "dura", "pastosa", "líquida"]).optional(), // ✅ Agregado 'normal'
  bloodOrParasitesInStool: z.string().optional(),
  normalUrination: z.string().optional(),
  urineFrequencyAndAmount: z.string().optional(),
  urineColor: z.string().optional(),
  painOrDifficultyUrinating: z.string().optional(),
  cough: z.string().optional(),
  sneezing: z.string().optional(),
  breathingDifficulty: z.boolean(),
  itchingOrExcessiveLicking: z.boolean(),
  hairLossOrSkinLesions: z.string().optional(),
  eyeDischarge: z.string().optional(),
  earIssues: z.string().optional(),
  feverSigns: z.boolean(),
  lethargyOrWeakness: z.boolean(),
  currentTreatment: z.string().optional(),
  medications: z.string().optional(),
  
  // Vacunas perro
  parvovirusVaccine: z.string().optional(),
  parvovirusVaccineDate: z.string().optional(),
  quintupleSextupleVaccine: z.string().optional(),
  quintupleSextupleVaccineDate: z.string().optional(),
  rabiesVaccineDogs: z.string().optional(),
  rabiesVaccineDateDogs: z.string().optional(),
  dewormingDogs: z.string().optional(),
  
  // Vacunas gato
  tripleQuintupleFelineVaccine: z.string().optional(),
  tripleQuintupleFelineVaccineDate: z.string().optional(),
  rabiesVaccineCats: z.string().optional(),
  rabiesVaccineDateCats: z.string().optional(),
  dewormingCats: z.string().optional(),
  
  // Historial
  previousIllnesses: z.string().optional(),
  previousSurgeries: z.string().optional(),
  adverseReactions: z.string().optional(),
  lastHeatOrBirth: z.string().optional(),
  mounts: z.string().optional(),
  
  // Examen físico
  temperature: z.number(),
  lymphNodes: z.string().optional(),
  heartRate: z.number(),
  respiratoryRate: z.number(),
  capillaryRefillTime: z.string().optional(),
  weight: z.number(),
  
  // Sistemas
  integumentarySystem: z.string().optional(),
  cardiovascularSystem: z.string().optional(),
  ocularSystem: z.string().optional(),
  respiratorySystem: z.string().optional(),
  nervousSystem: z.string().optional(),
  musculoskeletalSystem: z.string().optional(),
  gastrointestinalSystem: z.string().optional(),
  
  // Diagnóstico y tratamiento
  presumptiveDiagnosis: z.string(),
  definitiveDiagnosis: z.string(),
  requestedTests: z.string().optional(),
  treatmentPlan: z.string(),
  
  // Costo
  cost: z.number(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const consultationsListSchema = z.array(consultationSchema);

export type Consultation = z.infer<typeof consultationSchema>;

export type ConsultationFormData = {
  consultationDate: string;
  
  // Anamnesis
  reasonForVisit: string;
  symptomOnset: string;
  symptomEvolution: "empeorado" | "mejorado" | "estable" | "";
  isNeutered: boolean | null;
  cohabitantAnimals?: string;
  contactWithStrays?: string;
  feeding?: string;
  appetite: "Normal" | "Mucho" | "Poco" | "Nada" | "";
  vomiting?: string;
  bowelMovementFrequency?: string;
  stoolConsistency?: "normal" | "dura" | "pastosa" | "líquida" | ""; 
  bloodOrParasitesInStool?: string;
  normalUrination?: string;
  urineFrequencyAndAmount?: string;
  urineColor?: string;
  painOrDifficultyUrinating?: string;
  cough?: string;
  sneezing?: string;
  breathingDifficulty: boolean | null;
  itchingOrExcessiveLicking: boolean | null;
  hairLossOrSkinLesions?: string;
  eyeDischarge?: string;
  earIssues?: string;
  feverSigns: boolean | null;
  lethargyOrWeakness: boolean | null;
  currentTreatment?: string;
  medications?: string;
  
  // Vacunas perro
  parvovirusVaccine?: string;
  parvovirusVaccineDate?: string;
  quintupleSextupleVaccine?: string;
  quintupleSextupleVaccineDate?: string;
  rabiesVaccineDogs?: string;
  rabiesVaccineDateDogs?: string;
  dewormingDogs?: string;
  
  // Vacunas gato
  tripleQuintupleFelineVaccine?: string;
  tripleQuintupleFelineVaccineDate?: string;
  rabiesVaccineCats?: string;
  rabiesVaccineDateCats?: string;
  dewormingCats?: string;
  
  // Historial
  previousIllnesses?: string;
  previousSurgeries?: string;
  adverseReactions?: string;
  lastHeatOrBirth?: string;
  mounts?: string;
  
  // Examen físico
  temperature: number | "";
  lymphNodes?: string;
  heartRate: number | "";
  respiratoryRate: number | "";
  capillaryRefillTime?: string;
  weight: number | "";
  
  // Sistemas
  integumentarySystem?: string;
  cardiovascularSystem?: string;
  ocularSystem?: string;
  respiratorySystem?: string;
  nervousSystem?: string;
  musculoskeletalSystem?: string;
  gastrointestinalSystem?: string;
  
  // Diagnóstico y tratamiento
  presumptiveDiagnosis: string;
  definitiveDiagnosis: string;
  requestedTests?: string;
  treatmentPlan: string;
  
  // Costo
  cost: number | "";
};