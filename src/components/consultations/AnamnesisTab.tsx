// src/components/consultations/AnamnesisTab.tsx
import type { ConsultationFormData } from "../../types/consultation";

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
  patientSex,
}: AnamnesisTabProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleBooleanChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPerro = patientSpecies?.toLowerCase().includes("perro") || patientSpecies?.toLowerCase().includes("canino");
  const isGato = patientSpecies?.toLowerCase().includes("gato") || patientSpecies?.toLowerCase().includes("felino");
  const isHembra = patientSex === "Hembra";
  const isMacho = patientSex === "Macho";

  return (
    <div className="space-y-6">
      {/* MOTIVO DE CONSULTA */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Motivo de consulta
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Qué lo trae hoy a la clínica? *
            </label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
              placeholder="Describa el motivo de la visita..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Cuándo comenzaron los síntomas? *
              </label>
              <input
                type="text"
                name="symptomOnset"
                value={formData.symptomOnset}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Ej: Hace 3 días"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Ha empeorado, mejorado o se mantiene estable? *
              </label>
              <select
                name="symptomEvolution"
                value={formData.symptomEvolution}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
              >
                <option value="">Seleccionar</option>
                <option value="empeorado">Empeorado</option>
                <option value="mejorado">Mejorado</option>
                <option value="estable">Estable</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* DATOS GENERALES */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Datos generales
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Está esterilizado/castrado? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isNeutered"
                  checked={formData.isNeutered === true}
                  onChange={() => handleBooleanChange("isNeutered", true)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isNeutered"
                  checked={formData.isNeutered === false}
                  onChange={() => handleBooleanChange("isNeutered", false)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Con cuántos animales convive?
              </label>
              <input
                type="text"
                name="cohabitantAnimals"
                value={formData.cohabitantAnimals || ""}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Ej: 2 perros, 1 gato"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Tiene contacto con animales callejeros?
              </label>
              <input
                type="text"
                name="contactWithStrays"
                value={formData.contactWithStrays || ""}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Sí/No, frecuencia..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Tipo de alimentación?
              </label>
              <input
                type="text"
                name="feeding"
                value={formData.feeding || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Marca, tipo, frecuencia..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* SISTEMA DIGESTIVO */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Sistema digestivo
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Cómo está de apetito? *
              </label>
              <select
                name="appetite"
                value={formData.appetite}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
              >
                <option value="">Seleccionar</option>
                <option value="Normal">Normal</option>
                <option value="Mucho">Mucho</option>
                <option value="Poco">Poco</option>
                <option value="Nada">Nada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Vómitos? ¿Frecuencia? ¿Contenido?
              </label>
              <input
                type="text"
                name="vomiting"
                value={formData.vomiting || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Alimento, bilis, sangre..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Heces:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Frecuencia</label>
                <input
                  type="text"
                  name="bowelMovementFrequency"
                  value={formData.bowelMovementFrequency || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Ej: 2 veces al día"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Consistencia</label>
                <select
                  name="stoolConsistency"
                  value={formData.stoolConsistency || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="normal">Normal</option>
                  <option value="dura">Dura</option>
                  <option value="pastosa">Pastosa</option>
                  <option value="líquida">Líquida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">¿Sangre, Moco o parásitos?</label>
                <input
                  type="text"
                  name="bloodOrParasitesInStool"
                  value={formData.bloodOrParasitesInStool || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, descripción..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* SISTEMA URINARIO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Sistema urinario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Orina con normalidad?
            </label>
            <input
              type="text"
              name="normalUrination"
              value={formData.normalUrination || ""}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Sí/No, observaciones..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Frecuencia y cantidad?
            </label>
            <input
              type="text"
              name="urineFrequencyAndAmount"
              value={formData.urineFrequencyAndAmount || ""}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Ej: 3-4 veces, cantidad normal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Color de la orina?
            </label>
            <input
              type="text"
              name="urineColor"
              value={formData.urineColor || ""}
              onChange={handleChange}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Normal, rojiza, oscura..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Dolor o dificultad al orinar?
            </label>
            <input
              type="text"
              name="painOrDifficultyUrinating"
              value={formData.painOrDifficultyUrinating || ""}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Sí/No, descripción..."
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* SISTEMA RESPIRATORIO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Sistema respiratorio
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Tos? ¿Severidad y frecuencia? ¿Seca o húmeda?
              </label>
              <input
                type="text"
                name="cough"
                value={formData.cough || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Descripción..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Estornudos? ¿Con secreción?
              </label>
              <input
                type="text"
                name="sneezing"
                value={formData.sneezing || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Clara, purulenta, sanguinolenta..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Dificultad para respirar? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="breathingDifficulty"
                  checked={formData.breathingDifficulty === true}
                  onChange={() => handleBooleanChange("breathingDifficulty", true)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="breathingDifficulty"
                  checked={formData.breathingDifficulty === false}
                  onChange={() => handleBooleanChange("breathingDifficulty", false)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* PIEL Y PELAJE */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Piel y pelaje
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Picazón, rascado excesivo o lamido? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itchingOrExcessiveLicking"
                  checked={formData.itchingOrExcessiveLicking === true}
                  onChange={() => handleBooleanChange("itchingOrExcessiveLicking", true)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itchingOrExcessiveLicking"
                  checked={formData.itchingOrExcessiveLicking === false}
                  onChange={() => handleBooleanChange("itchingOrExcessiveLicking", false)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Caída de pelo, caspa o lesiones en la piel?
            </label>
            <input
              type="text"
              name="hairLossOrSkinLesions"
              value={formData.hairLossOrSkinLesions || ""}
              onChange={handleChange}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Descripción..."
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* OJOS Y OÍDOS */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Ojos y oídos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Secreción ocular?
            </label>
            <input
              type="text"
              name="eyeDischarge"
              value={formData.eyeDischarge || ""}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Clara, purulenta..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Oídos: ¿Sacudidas, olor, secreción, rascado?
            </label>
            <input
              type="text"
              name="earIssues"
              value={formData.earIssues || ""}
              onChange={handleChange}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Descripción..."
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* ESTADO GENERAL */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Estado general
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Ha notado fiebre (nariz seca, orejas calientes)? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feverSigns"
                  checked={formData.feverSigns === true}
                  onChange={() => handleBooleanChange("feverSigns", true)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feverSigns"
                  checked={formData.feverSigns === false}
                  onChange={() => handleBooleanChange("feverSigns", false)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Letargo, debilidad o falta de energía? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lethargyOrWeakness"
                  checked={formData.lethargyOrWeakness === true}
                  onChange={() => handleBooleanChange("lethargyOrWeakness", true)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lethargyOrWeakness"
                  checked={formData.lethargyOrWeakness === false}
                  onChange={() => handleBooleanChange("lethargyOrWeakness", false)}
                  className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* TRATAMIENTO ACTUAL */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Tratamiento actual
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Está bajo algún tratamiento?
            </label>
            <input
              type="text"
              name="currentTreatment"
              value={formData.currentTreatment || ""}
              onChange={handleChange}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Descripción del tratamiento..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Toma medicamentos? (nombre, dosis, frecuencia)
            </label>
            <input
              type="text"
              name="medications"
              value={formData.medications || ""}
              onChange={handleChange}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Medicamentos actuales..."
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* VACUNAS PERRO */}
      {/* ===================== */}
      {isPerro && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            🐕 Vacunas (Perro)
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ¿Vacuna contra parvovirus?
                </label>
                <input
                  type="text"
                  name="parvovirusVaccine"
                  value={formData.parvovirusVaccine || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, observaciones..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="parvovirusVaccineDate"
                  value={formData.parvovirusVaccineDate || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ¿Quíntuple o séxtuple?
                </label>
                <input
                  type="text"
                  name="quintupleSextupleVaccine"
                  value={formData.quintupleSextupleVaccine || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, observaciones..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="quintupleSextupleVaccineDate"
                  value={formData.quintupleSextupleVaccineDate || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ¿Antirrábica?
                </label>
                <input
                  type="text"
                  name="rabiesVaccineDogs"
                  value={formData.rabiesVaccineDogs || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, observaciones..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="rabiesVaccineDateDogs"
                  value={formData.rabiesVaccineDateDogs || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Desparasitación interna y externa? ¿Frecuencia y producto?
              </label>
              <input
                type="text"
                name="dewormingDogs"
                value={formData.dewormingDogs || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Producto, frecuencia..."
              />
            </div>
          </div>
        </section>
      )}

      {/* ===================== */}
      {/* VACUNAS GATO */}
      {/* ===================== */}
      {isGato && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            🐱 Vacunas (Gato)
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ¿Triple felina o quíntuple felina?
                </label>
                <input
                  type="text"
                  name="tripleQuintupleFelineVaccine"
                  value={formData.tripleQuintupleFelineVaccine || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, observaciones..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="tripleQuintupleFelineVaccineDate"
                  value={formData.tripleQuintupleFelineVaccineDate || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ¿Antirrábica?
                </label>
                <input
                  type="text"
                  name="rabiesVaccineCats"
                  value={formData.rabiesVaccineCats || ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  placeholder="Sí/No, observaciones..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="rabiesVaccineDateCats"
                  value={formData.rabiesVaccineDateCats || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Desparasitación? ¿Frecuencia y producto?
              </label>
              <input
                type="text"
                name="dewormingCats"
                value={formData.dewormingCats || ""}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Producto, frecuencia..."
              />
            </div>
          </div>
        </section>
      )}

      {/* ===================== */}
      {/* HISTORIAL MÉDICO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Historial médico
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Enfermedades previas?
              </label>
              <input
                type="text"
                name="previousIllnesses"
                value={formData.previousIllnesses || ""}
                onChange={handleChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Alergias, diabetes, epilepsia..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Cirugías anteriores?
              </label>
              <input
                type="text"
                name="previousSurgeries"
                value={formData.previousSurgeries || ""}
                onChange={handleChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Descripción..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ¿Reacciones adversas a medicamentos o vacunas?
            </label>
            <input
              type="text"
              name="adverseReactions"
              value={formData.adverseReactions || ""}
              onChange={handleChange}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              placeholder="Descripción..."
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* REPRODUCTIVO */}
      {/* ===================== */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Historial reproductivo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isHembra && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Último celo? ¿Último parto?
              </label>
              <input
                type="text"
                name="lastHeatOrBirth"
                value={formData.lastHeatOrBirth || ""}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Fechas aproximadas..."
              />
            </div>
          )}

          {isMacho && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ¿Monta?
              </label>
              <input
                type="text"
                name="mounts"
                value={formData.mounts || ""}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                placeholder="Sí/No, frecuencia..."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}