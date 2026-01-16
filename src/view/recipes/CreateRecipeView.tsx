// src/views/recipes/CreateRecipeView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2, Pill } from "lucide-react";
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
  "Champu",
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

  // Estados para el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);

  const [formData, setFormData] = useState<RecipeFormData>({
    issueDate: new Date().toISOString().split("T")[0],
    medications: [{ ...emptyMedication }],
    notes: "",
  });

  // Query para obtener datos del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RecipeFormData) => createRecipe(patientId!, data),
    onSuccess: (recipe) => {
      toast.success("Receta creada");
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      setCreatedRecipe(recipe);
      setShowPrintModal(true);
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      toast.error("Debe haber al menos un medicamento");
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
      toast.error("Completa todos los campos obligatorios de cada medicamento");
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

  // Preparar datos del paciente para el modal
  const patientDataForPrint = patient ? {
    name: patient.name,
    species: patient.species,
    breed: patient.breed || undefined,
    owner: typeof patient.owner === 'object' 
      ? { name: patient.owner.name, contact: (patient.owner as any).contact }
      : { name: "No especificado" },
  } : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-vet-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-vet-text">Nueva Receta</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-vet-muted font-medium rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={`px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha de emisión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-vet-muted mb-1">
              Fecha de emisión *
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
              }
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-vet-muted mb-1">
              Notas generales
            </label>
            <input
              type="text"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Indicaciones adicionales..."
              maxLength={500}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text"
            />
          </div>
        </div>

        {/* Medicamentos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-vet-text flex items-center gap-2">
              <Pill className="w-4 h-4 text-vet-primary" />
              Medicamentos ({formData.medications.length})
            </label>
            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-vet-primary bg-vet-primary/10 hover:bg-vet-primary/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>

          <div className="space-y-4">
            {formData.medications.map((medication, index) => (
              <div
                key={index}
                className="p-4 bg-slate-800 rounded-xl border border-slate-700 relative"
              >
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <p className="text-xs font-semibold text-vet-muted mb-3">
                  Medicamento {index + 1}
                </p>

                {/* Fila 1: Nombre + Presentación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-vet-muted mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      placeholder="Ej: Amoxicilina"
                      maxLength={100}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-vet-muted mb-1">
                      Presentación *
                    </label>
                    <select
                      value={medication.presentation}
                      onChange={(e) =>
                        handleMedicationChange(index, "presentation", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text"
                    >
                      <option value="">Seleccionar</option>
                      {PRESENTATIONS.map((pres) => (
                        <option key={pres} value={pres}>
                          {pres}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fila 2: Uso + Cantidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-vet-muted mb-1">
                      Adquirir en *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleMedicationChange(index, "source", "farmacia")
                        }
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                          medication.source === "farmacia"
                            ? "bg-blue-900/30 border-blue-700 text-blue-400 font-medium"
                            : "bg-slate-800 border-slate-700 text-vet-muted hover:bg-slate-700"
                        }`}
                      >
                        Farmacia
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMedicationChange(index, "source", "veterinario")
                        }
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                          medication.source === "veterinario"
                            ? "bg-emerald-900/30 border-emerald-700 text-emerald-400 font-medium"
                            : "bg-slate-800 border-slate-700 text-vet-muted hover:bg-slate-700"
                        }`}
                      >
                        Veterinario
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-vet-muted mb-1">
                      Cantidad
                    </label>
                    <input
                      type="text"
                      value={medication.quantity || ""}
                      onChange={(e) =>
                        handleMedicationChange(index, "quantity", e.target.value)
                      }
                      placeholder="Ej: 14 tabletas, 1 frasco"
                      maxLength={50}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text"
                    />
                  </div>
                </div>

                {/* Fila 3: Instrucciones */}
                <div>
                  <label className="block text-xs font-medium text-vet-muted mb-1">
                    Modo de uso *
                  </label>
                  <textarea
                    value={medication.instructions}
                    onChange={(e) =>
                      handleMedicationChange(index, "instructions", e.target.value)
                    }
                    placeholder="Ej: 1 tableta cada 12 horas por 7 días"
                    maxLength={300}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary text-vet-text resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Modal de impresión después de crear */}
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