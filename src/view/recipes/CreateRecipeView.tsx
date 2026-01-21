// src/views/recipes/CreateRecipeView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Pill } from "lucide-react";
import { createRecipe } from "../../api/recipeAPI";
import { getPatientById } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import type { Recipe, RecipeFormData, MedicationFormData } from "../../types/recipe";
import RecipePrintModal from "../../components/recipes/RecipePrintModal";

const PRESENTATIONS = [
  "Tabletas",
  "Cápsulas",
  "Comprimidos",
  "Jarabe",
  "Suspensión",
  "Inyectable",
  "Ampolla",
  "Gotas",
  "Crema",
  "Ungüento",
  "Gel",
  "Polvo",
  "Solución",
  "Champú",
  "Jabón",
  "Solución jabonosa",
];

const emptyMedication: MedicationFormData = {
  name: "",
  presentation: "",
  source: "farmacia",
  instructions: "",
  quantity: "",
};

export default function CreateRecipeView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);

  const [formData, setFormData] = useState<RecipeFormData>({
    issueDate: new Date().toISOString().split("T")[0],
    medications: [{ ...emptyMedication }],
    notes: "",
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RecipeFormData) => createRecipe(patientId!, data),
    onSuccess: (recipe) => {
      toast.success(
        "Receta médica creada",
        "La prescripción está lista para imprimir y entregar"
      );
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      setCreatedRecipe(recipe);
      setShowPrintModal(true);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al crear receta",
        error.message || "No se pudo guardar la prescripción médica"
      );
    },
  });

  const handleMedicationChange = (
    index: number,
    field: keyof MedicationFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value,
      };
      return { ...prev, medications: newMedications };
    });
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...emptyMedication }],
    }));
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length === 1) {
      toast.warning(
        "Medicamento requerido",
        "Debe haber al menos un medicamento en la receta"
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invalidMed = formData.medications.find(
      (med) => !med.name || !med.presentation || !med.instructions
    );

    if (invalidMed) {
      toast.warning(
        "Campos incompletos",
        "Completa todos los campos obligatorios de cada medicamento"
      );
      return;
    }

    mutate(formData);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setCreatedRecipe(null);
    navigate(-1);
  };

  const isValid = formData.medications.every(
    (med) => med.name && med.presentation && med.instructions
  );

  const patientDataForPrint = patient ? {
    name: patient.name,
    species: patient.species,
    breed: patient.breed || undefined,
    owner: typeof patient.owner === 'object' 
      ? { name: patient.owner.name, contact: (patient.owner as any).contact }
      : { name: "No especificado" },
  } : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header ultra compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-[var(--color-vet-text)]">Nueva Receta</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Fecha y Notas + Botones en UNA sola línea */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
              }
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Notas
            </label>
            <input
              type="text"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Indicaciones adicionales..."
              maxLength={500}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sección de Medicamentos ultra compacta */}
        <div className="bg-[var(--color-vet-primary)]/5 border border-[var(--color-vet-primary)]/20 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--color-vet-text)] flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[var(--color-vet-primary)]" />
              Medicamentos ({formData.medications.length})
            </label>
            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
              Agregar
            </button>
          </div>

          <div className="space-y-2">
            {formData.medications.map((medication, index) => (
              <div
                key={index}
                className="p-2.5 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] relative"
              >
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="absolute top-1.5 right-1.5 p-0.5 rounded text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                <p className="text-[9px] font-semibold text-[var(--color-vet-muted)] uppercase mb-1.5">
                  Med. {index + 1}
                </p>

                {/* Todo en GRID compacto */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                  {/* Nombre */}
                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-medium text-[var(--color-vet-text)] mb-0.5">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      placeholder="Amoxicilina"
                      maxLength={100}
                      className="w-full px-2 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
                    />
                  </div>

                  {/* Presentación */}
                  <div>
                    <label className="block text-[10px] font-medium text-[var(--color-vet-text)] mb-0.5">
                      Presentación <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={medication.presentation}
                      onChange={(e) =>
                        handleMedicationChange(index, "presentation", e.target.value)
                      }
                      className="w-full px-2 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
                    >
                      <option value="">Seleccionar</option>
                      {PRESENTATIONS.map((pres) => (
                        <option key={pres} value={pres}>
                          {pres}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Origen */}
                  <div>
                    <label className="block text-[10px] font-medium text-[var(--color-vet-text)] mb-0.5">
                      Origen <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleMedicationChange(index, "source", "farmacia")
                        }
                        className={`flex-1 px-2 py-1 text-[10px] rounded border transition-all ${
                          medication.source === "farmacia"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-medium"
                            : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-vet-muted)] hover:bg-[var(--color-hover)]"
                        }`}
                      >
                        Farm.
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMedicationChange(index, "source", "veterinario")
                        }
                        className={`flex-1 px-2 py-1 text-[10px] rounded border transition-all ${
                          medication.source === "veterinario"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium"
                            : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-vet-muted)] hover:bg-[var(--color-hover)]"
                        }`}
                      >
                        Vet.
                      </button>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-[10px] font-medium text-[var(--color-vet-text)] mb-0.5">
                      Cantidad
                    </label>
                    <input
                      type="text"
                      value={medication.quantity || ""}
                      onChange={(e) =>
                        handleMedicationChange(index, "quantity", e.target.value)
                      }
                      placeholder="14 tabletas"
                      maxLength={50}
                      className="w-full px-2 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
                    />
                  </div>

                  {/* Indicaciones */}
                  <div>
                    <label className="block text-[10px] font-medium text-[var(--color-vet-text)] mb-0.5">
                      Indicaciones <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={medication.instructions}
                      onChange={(e) =>
                        handleMedicationChange(index, "instructions", e.target.value)
                      }
                      placeholder="1 cada 12h por 7 días"
                      maxLength={300}
                      className="w-full px-2 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Modal de impresión */}
      {showPrintModal && createdRecipe && patientDataForPrint && (
        <RecipePrintModal
          isOpen={showPrintModal}
          onClose={handleClosePrintModal}
          recipe={createdRecipe}
          patientData={patientDataForPrint}
        />
      )}
    </div>
  );
}