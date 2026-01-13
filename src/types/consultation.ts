// src/types/consultation.ts
import { z } from "zod";

export const consultationSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  veterinarianId: z.string(),
  consultationDate: z.string(),
  isDraft: z.boolean().optional(),
  
  // Anamnesis - Opcionales
  reasonForVisit: z.string().optional(),
  symptomOnset: z.string().optional(),
  symptomEvolution: z.enum(["empeorado", "mejorado", "estable"]).optional(),
  isNeutered: z.boolean().nullable().optional(),
  cohabitantAnimals: z.string().optional(),
  contactWithStrays: z.string().optional(),
  feeding: z.string().optional(),
  
  // ✅ appetite - Acepta enum O string vacío O null
  appetite: z.union([
    z.enum(["Normal", "Mucho", "Poco", "Nada"]),
    z.literal(""),
    z.null()
  ]).optional(),
  
  vomiting: z.string().optional(),
  bowelMovementFrequency: z.string().optional(),
  
  // ✅ stoolConsistency - Acepta enum O string vacío O null
  stoolConsistency: z.union([
    z.enum(["normal", "dura", "pastosa", "líquida"]),
    z.literal(""),
    z.null()
  ]).optional(),
  
  bloodOrParasitesInStool: z.string().optional(),
  normalUrination: z.string().optional(),
  urineFrequencyAndAmount: z.string().optional(),
  urineColor: z.string().optional(),
  painOrDifficultyUrinating: z.string().optional(),
  cough: z.string().optional(),
  sneezing: z.string().optional(),
  
  // ✅ Campos boolean - Aceptar null también
  breathingDifficulty: z.boolean().nullable().optional(),
  itchingOrExcessiveLicking: z.boolean().nullable().optional(),
  
  hairLossOrSkinLesions: z.string().optional(),
  eyeDischarge: z.string().optional(),
  earIssues: z.string().optional(),
  
  feverSigns: z.boolean().nullable().optional(),
  lethargyOrWeakness: z.boolean().nullable().optional(),
  
  currentTreatment: z.string().optional(),
  medications: z.string().optional(),
  
  // Vacunas perro - Aceptar null
  parvovirusVaccine: z.string().optional(),
  parvovirusVaccineDate: z.string().nullable().optional(),
  quintupleSextupleVaccine: z.string().optional(),
  quintupleSextupleVaccineDate: z.string().nullable().optional(),
  rabiesVaccineDogs: z.string().optional(),
  rabiesVaccineDateDogs: z.string().nullable().optional(),
  dewormingDogs: z.string().optional(),
  
  // Vacunas gato - Aceptar null
  tripleQuintupleFelineVaccine: z.string().optional(),
  tripleQuintupleFelineVaccineDate: z.string().nullable().optional(),
  rabiesVaccineCats: z.string().optional(),
  rabiesVaccineDateCats: z.string().nullable().optional(),
  dewormingCats: z.string().optional(),
  
  // Historial
  previousIllnesses: z.string().optional(),
  previousSurgeries: z.string().optional(),
  adverseReactions: z.string().optional(),
  lastHeatOrBirth: z.string().optional(),
  mounts: z.string().optional(),
  
  // Examen físico - Aceptar null
  temperature: z.number().nullable().optional(),
  lymphNodes: z.string().optional(),
  heartRate: z.number().nullable().optional(),
  respiratoryRate: z.number().nullable().optional(),
  capillaryRefillTime: z.string().optional(),
  weight: z.number().nullable().optional(),
  
  // Sistemas
  integumentarySystem: z.string().optional(),
  cardiovascularSystem: z.string().optional(),
  ocularSystem: z.string().optional(),
  respiratorySystem: z.string().optional(),
  nervousSystem: z.string().optional(),
  musculoskeletalSystem: z.string().optional(),
  gastrointestinalSystem: z.string().optional(),
  
  // Diagnóstico - Opcionales
  presumptiveDiagnosis: z.string().optional(),
  definitiveDiagnosis: z.string().optional(),
  requestedTests: z.string().optional(),
  treatmentPlan: z.string().optional(),
  
  // Costo - Aceptar null
  cost: z.number().nullable().optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const consultationsListSchema = z.array(consultationSchema);

export type Consultation = z.infer<typeof consultationSchema>;

export type ConsultationFormData = {
  consultationDate: string;
  
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
  
  parvovirusVaccine?: string;
  parvovirusVaccineDate?: string;
  quintupleSextupleVaccine?: string;
  quintupleSextupleVaccineDate?: string;
  rabiesVaccineDogs?: string;
  rabiesVaccineDateDogs?: string;
  dewormingDogs?: string;
  
  tripleQuintupleFelineVaccine?: string;
  tripleQuintupleFelineVaccineDate?: string;
  rabiesVaccineCats?: string;
  rabiesVaccineDateCats?: string;
  dewormingCats?: string;
  
  previousIllnesses?: string;
  previousSurgeries?: string;
  adverseReactions?: string;
  lastHeatOrBirth?: string;
  mounts?: string;
  
  temperature: number | "";
  lymphNodes?: string;
  heartRate: number | "";
  respiratoryRate: number | "";
  capillaryRefillTime?: string;
  weight: number | "";
  
  integumentarySystem?: string;
  cardiovascularSystem?: string;
  ocularSystem?: string;
  respiratorySystem?: string;
  nervousSystem?: string;
  musculoskeletalSystem?: string;
  gastrointestinalSystem?: string;
  
  presumptiveDiagnosis: string;
  definitiveDiagnosis: string;
  requestedTests?: string;
  treatmentPlan: string;
  
  cost: number | "";
};