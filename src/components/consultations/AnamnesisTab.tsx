// src/components/consultations/AnamnesisTab.tsx
import type { ConsultationFormData } from "../../types/consultation";
import {
  TextInput,
  TextArea,
  SelectInput,
  RadioGroup,
  Section,
} from "./form-fields";

interface AnamnesisTabProps {
  formData: ConsultationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ConsultationFormData>>;
  patientSpecies: string;
  patientSex: string;
}

export default function AnamnesisTab({
  formData,
  setFormData,
  patientSpecies,
}: AnamnesisTabProps) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPerro =
    patientSpecies?.toLowerCase().includes("perro") ||
    patientSpecies?.toLowerCase().includes("canino");
  const isGato =
    patientSpecies?.toLowerCase().includes("gato") ||
    patientSpecies?.toLowerCase().includes("felino");

  return (
    <div className="space-y-6">
      {/* MOTIVO DE CONSULTA */}
      <Section title="Motivo de consulta">
        <div className="space-y-3">
          <TextArea
            label="¿Qué lo trae hoy a la clínica? *"
            name="reasonForVisit"
            value={formData.reasonForVisit}
            onChange={handleChange}
            placeholder="Describa el motivo de la visita..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="¿Cuándo comenzaron los síntomas? *"
              name="symptomOnset"
              value={formData.symptomOnset}
              onChange={handleChange}
              placeholder="Ej: Hace 3 días"
              maxLength={100}
            />
            <SelectInput
              label="¿Ha empeorado, mejorado o se mantiene estable? *"
              name="symptomEvolution"
              value={formData.symptomEvolution}
              onChange={handleChange}
              options={[
                { value: "empeorado", label: "Empeorado" },
                { value: "mejorado", label: "Mejorado" },
                { value: "estable", label: "Estable" },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* DATOS GENERALES */}
      <Section title="Datos generales">
        <div className="space-y-3">
          <RadioGroup
            label="¿Está esterilizado/castrado? *"
            name="isNeutered"
            value={formData.isNeutered}
            onChange={(v) => handleBooleanChange("isNeutered", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="¿Con cuántos animales convive?"
              name="cohabitantAnimals"
              value={formData.cohabitantAnimals || ""}
              onChange={handleChange}
              placeholder="Ej: 2 perros, 1 gato"
              maxLength={100}
            />
            <TextInput
              label="¿Tiene contacto con animales callejeros?"
              name="contactWithStrays"
              value={formData.contactWithStrays || ""}
              onChange={handleChange}
              placeholder="Sí/No, frecuencia..."
              maxLength={100}
            />
            <TextInput
              label="¿Tipo de alimentación?"
              name="feeding"
              value={formData.feeding || ""}
              onChange={handleChange}
              placeholder="Marca, tipo, frecuencia..."
            />
          </div>
        </div>
      </Section>

      {/* SISTEMA DIGESTIVO */}
      <Section title="Sistema digestivo">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="¿Cómo está de apetito? *"
              name="appetite"
              value={formData.appetite}
              onChange={handleChange}
              options={[
                { value: "Normal", label: "Normal" },
                { value: "Mucho", label: "Mucho" },
                { value: "Poco", label: "Poco" },
                { value: "Nada", label: "Nada" },
              ]}
            />
            <TextInput
              label="¿Vómitos? ¿Frecuencia? ¿Contenido?"
              name="vomiting"
              value={formData.vomiting || ""}
              onChange={handleChange}
              placeholder="Alimento, bilis, sangre..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Heces:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextInput
                label="Frecuencia"
                name="bowelMovementFrequency"
                value={formData.bowelMovementFrequency || ""}
                onChange={handleChange}
                placeholder="Ej: 2 veces al día"
                maxLength={100}
                sublabel
              />
              <SelectInput
                label="Consistencia"
                name="stoolConsistency"
                value={formData.stoolConsistency || ""}
                onChange={handleChange}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "dura", label: "Dura" },
                  { value: "pastosa", label: "Pastosa" },
                  { value: "líquida", label: "Líquida" },
                ]}
                sublabel
              />
              <TextInput
                label="¿Sangre, Moco o parásitos?"
                name="bloodOrParasitesInStool"
                value={formData.bloodOrParasitesInStool || ""}
                onChange={handleChange}
                placeholder="Sí/No, descripción..."
                maxLength={100}
                sublabel
              />
            </div>
          </div>
        </div>
      </Section>

      {/* SISTEMA URINARIO */}
      <Section title="Sistema urinario">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="¿Orina con normalidad?"
            name="normalUrination"
            value={formData.normalUrination || ""}
            onChange={handleChange}
            placeholder="Sí/No, observaciones..."
            maxLength={100}
          />
          <TextInput
            label="¿Frecuencia y cantidad?"
            name="urineFrequencyAndAmount"
            value={formData.urineFrequencyAndAmount || ""}
            onChange={handleChange}
            placeholder="Ej: 3-4 veces, cantidad normal"
            maxLength={100}
          />
          <TextInput
            label="¿Color de la orina?"
            name="urineColor"
            value={formData.urineColor || ""}
            onChange={handleChange}
            placeholder="Normal, rojiza, oscura..."
            maxLength={50}
          />
          <TextInput
            label="¿Dolor o dificultad al orinar?"
            name="painOrDifficultyUrinating"
            value={formData.painOrDifficultyUrinating || ""}
            onChange={handleChange}
            placeholder="Sí/No, descripción..."
            maxLength={100}
          />
        </div>
      </Section>

      {/* SISTEMA RESPIRATORIO */}
      <Section title="Sistema respiratorio">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="¿Tos? ¿Severidad y frecuencia? ¿Seca o húmeda?"
              name="cough"
              value={formData.cough || ""}
              onChange={handleChange}
              placeholder="Descripción..."
            />
            <TextInput
              label="¿Estornudos? ¿Con secreción?"
              name="sneezing"
              value={formData.sneezing || ""}
              onChange={handleChange}
              placeholder="Clara, purulenta, sanguinolenta..."
            />
          </div>
          <RadioGroup
            label="¿Dificultad para respirar? *"
            name="breathingDifficulty"
            value={formData.breathingDifficulty}
            onChange={(v) => handleBooleanChange("breathingDifficulty", v)}
          />
        </div>
      </Section>

      {/* PIEL Y PELAJE */}
      <Section title="Piel y pelaje">
        <div className="space-y-3">
          <RadioGroup
            label="¿Picazón, rascado excesivo o lamido? *"
            name="itchingOrExcessiveLicking"
            value={formData.itchingOrExcessiveLicking}
            onChange={(v) =>
              handleBooleanChange("itchingOrExcessiveLicking", v)
            }
          />
          <TextInput
            label="¿Caída de pelo, caspa o lesiones en la piel?"
            name="hairLossOrSkinLesions"
            value={formData.hairLossOrSkinLesions || ""}
            onChange={handleChange}
            placeholder="Descripción..."
          />
        </div>
      </Section>

      {/* OJOS Y OÍDOS */}
      <Section title="Ojos y oídos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="¿Secreción ocular?"
            name="eyeDischarge"
            value={formData.eyeDischarge || ""}
            onChange={handleChange}
            placeholder="Clara, purulenta..."
            maxLength={100}
          />
          <TextInput
            label="Oídos: ¿Sacudidas, olor, secreción, rascado?"
            name="earIssues"
            value={formData.earIssues || ""}
            onChange={handleChange}
            placeholder="Descripción..."
          />
        </div>
      </Section>

      {/* ESTADO GENERAL */}
      <Section title="Estado general">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RadioGroup
            label="¿Ha notado fiebre (nariz seca, orejas calientes)? *"
            name="feverSigns"
            value={formData.feverSigns}
            onChange={(v) => handleBooleanChange("feverSigns", v)}
          />
          <RadioGroup
            label="¿Letargo, debilidad o falta de energía? *"
            name="lethargyOrWeakness"
            value={formData.lethargyOrWeakness}
            onChange={(v) => handleBooleanChange("lethargyOrWeakness", v)}
          />
        </div>
      </Section>

      {/* TRATAMIENTO ACTUAL */}
      <Section title="Tratamiento actual">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="¿Está bajo algún tratamiento?"
            name="currentTreatment"
            value={formData.currentTreatment || ""}
            onChange={handleChange}
            placeholder="Descripción del tratamiento..."
            maxLength={300}
          />
          <TextInput
            label="¿Toma medicamentos? (nombre, dosis, frecuencia)"
            name="medications"
            value={formData.medications || ""}
            onChange={handleChange}
            placeholder="Medicamentos actuales..."
            maxLength={300}
          />
        </div>
      </Section>

      {/* VACUNAS PERRO */}
      {isPerro && (
        <Section title="🐕 Vacunas (Perro)">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="¿Vacuna contra parvovirus?"
                name="parvovirusVaccine"
                value={formData.parvovirusVaccine || ""}
                onChange={handleChange}
                placeholder="Sí/No, observaciones..."
                maxLength={100}
              />
              <TextInput
                label="Fecha"
                name="parvovirusVaccineDate"
                value={formData.parvovirusVaccineDate || ""}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="¿Quíntuple o séxtuple?"
                name="quintupleSextupleVaccine"
                value={formData.quintupleSextupleVaccine || ""}
                onChange={handleChange}
                placeholder="Sí/No, observaciones..."
                maxLength={100}
              />
              <TextInput
                label="Fecha"
                name="quintupleSextupleVaccineDate"
                value={formData.quintupleSextupleVaccineDate || ""}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="¿Antirrábica?"
                name="rabiesVaccineDogs"
                value={formData.rabiesVaccineDogs || ""}
                onChange={handleChange}
                placeholder="Sí/No, observaciones..."
                maxLength={100}
              />
              <TextInput
                label="Fecha"
                name="rabiesVaccineDateDogs"
                value={formData.rabiesVaccineDateDogs || ""}
                onChange={handleChange}
                type="date"
              />
            </div>
            <TextInput
              label="¿Desparasitación interna y externa? ¿Frecuencia y producto?"
              name="dewormingDogs"
              value={formData.dewormingDogs || ""}
              onChange={handleChange}
              placeholder="Producto, frecuencia..."
            />
          </div>
        </Section>
      )}

      {/* VACUNAS GATO */}
      {isGato && (
        <Section title="🐱 Vacunas (Gato)">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="¿Triple felina o quíntuple felina?"
                name="tripleQuintupleFelineVaccine"
                value={formData.tripleQuintupleFelineVaccine || ""}
                onChange={handleChange}
                placeholder="Sí/No, observaciones..."
                maxLength={100}
              />
              <TextInput
                label="Fecha"
                name="tripleQuintupleFelineVaccineDate"
                value={formData.tripleQuintupleFelineVaccineDate || ""}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextInput
                label="¿Antirrábica?"
                name="rabiesVaccineCats"
                value={formData.rabiesVaccineCats || ""}
                onChange={handleChange}
                placeholder="Sí/No, observaciones..."
                maxLength={100}
              />
              <TextInput
                label="Fecha"
                name="rabiesVaccineDateCats"
                value={formData.rabiesVaccineDateCats || ""}
                onChange={handleChange}
                type="date"
              />
            </div>
            <TextInput
              label="¿Desparasitación? ¿Frecuencia y producto?"
              name="dewormingCats"
              value={formData.dewormingCats || ""}
              onChange={handleChange}
              placeholder="Producto, frecuencia..."
            />
          </div>
        </Section>
      )}

      {/* HISTORIAL MÉDICO */}
      <Section title="Historial médico">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="¿Enfermedades previas?"
            name="previousIllnesses"
            value={formData.previousIllnesses || ""}
            onChange={handleChange}
            placeholder="Alergias, diabetes, epilepsia..."
            maxLength={300}
          />
          <TextInput
            label="¿Cirugías anteriores?"
            name="previousSurgeries"
            value={formData.previousSurgeries || ""}
            onChange={handleChange}
            placeholder="Descripción..."
            maxLength={300}
          />
        </div>
      </Section>

      {/* ✅ OBSERVACIONES GENERALES - Usando adverseReactions */}
      <Section title="Observaciones generales">
        <TextArea
          label="Alergias, reacciones adversas y observaciones adicionales"
          name="adverseReactions"
          value={formData.adverseReactions || ""}
          onChange={handleChange}
          placeholder="Reacciones a medicamentos/vacunas, alergias conocidas, comportamiento reproductivo, antecedentes relevantes..."
          rows={3}
          maxLength={300}
        />
      </Section>
    </div>
  );
}