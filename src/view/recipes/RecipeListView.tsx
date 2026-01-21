// src/views/recipes/RecipeListView.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Calendar,
  Trash2,
  Eye,
  Pill,
  Building,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { getRecipesByPatient, deleteRecipe } from "../../api/recipeAPI";
import { getPatientById } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import type { Recipe } from "../../types/recipe";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import RecipePrintModal from "../../components/recipes/RecipePrintModal";

export default function RecipeListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", patientId],
    queryFn: () => getRecipesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeRecipe, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      toast.success(
        "Receta eliminada",
        "La prescripción ha sido removida del historial médico"
      );
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al eliminar",
        error.message || "No se pudo eliminar la receta"
      );
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSourceIcon = (source: string) => {
    return source === "veterinario" ? (
      <Stethoscope className="w-3 h-3" />
    ) : (
      <Building className="w-3 h-3" />
    );
  };

  const getSourceColor = (source: string) => {
    return source === "veterinario"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
  };

  const patientDataForModal = patient
    ? {
        name: patient.name,
        species: patient.species,
        breed: patient.breed || undefined,
        owner:
          typeof patient.owner === "object"
            ? { name: patient.owner.name }
            : { name: "No especificado" },
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-vet-text)]">Recetas Médicas</h2>
          <p className="text-xs sm:text-sm text-[var(--color-vet-muted)] mt-0.5">
            {recipes.length} registrada{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-105 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Receta</span>
        </Link>
      </div>

      {/* Lista */}
      {recipes.length > 0 ? (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-vet-primary)] transition-all overflow-hidden"
            >
              {/* Desktop Layout */}
              <div className="hidden md:flex items-center gap-4 p-4">
                {/* Icono */}
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--color-vet-text)]">
                      {recipe.medications.length} medicamento
                      {recipe.medications.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {recipe.medications.slice(0, 2).map((med, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getSourceColor(
                            med.source
                          )}`}
                        >
                          {getSourceIcon(med.source)}
                          {med.name.length > 15
                            ? med.name.substring(0, 15) + "..."
                            : med.name}
                        </span>
                      ))}
                      {recipe.medications.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-hover)] text-[var(--color-vet-muted)] border border-[var(--color-border)]">
                          +{recipe.medications.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-vet-muted)] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(recipe.issueDate)}
                    </span>
                    {recipe.notes && (
                      <span className="truncate max-w-[200px]">📝 {recipe.notes}</span>
                    )}
                  </div>
                </div>

                {/* Contador */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-vet-primary)]/10 rounded-lg">
                    <Pill className="w-4 h-4 text-[var(--color-vet-primary)]" />
                    <span className="font-bold text-[var(--color-vet-primary)]">
                      {recipe.medications.length}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setShowViewModal(true);
                    }}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-primary)]/10 transition-colors"
                    title="Ver e imprimir receta"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRecipeToDelete(recipe);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar receta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="md:hidden">
                {/* Header Card */}
                <div className="flex items-start gap-3 p-3 sm:p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título y cantidad */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-[var(--color-vet-text)] text-sm sm:text-base">
                          {recipe.medications.length} Medicamento
                          {recipe.medications.length !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-vet-muted)]">
                          <Calendar className="w-3 h-3" />
                          {formatDate(recipe.issueDate)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-vet-primary)]/10 rounded-lg flex-shrink-0">
                        <Pill className="w-3.5 h-3.5 text-[var(--color-vet-primary)]" />
                        <span className="font-bold text-[var(--color-vet-primary)] text-sm">
                          {recipe.medications.length}
                        </span>
                      </div>
                    </div>

                    {/* Medicamentos preview */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.medications.slice(0, 3).map((med, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getSourceColor(
                            med.source
                          )}`}
                        >
                          {getSourceIcon(med.source)}
                          <span className="truncate max-w-[100px] sm:max-w-[150px]">
                            {med.name}
                          </span>
                        </span>
                      ))}
                      {recipe.medications.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-hover)] text-[var(--color-vet-muted)] border border-[var(--color-border)]">
                          +{recipe.medications.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Notas */}
                    {recipe.notes && (
                      <p className="text-xs text-[var(--color-vet-muted)] bg-[var(--color-hover)] px-2 py-1 rounded">
                        📝 {recipe.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones móvil */}
                <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)]/50 px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setShowViewModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Receta</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button
                      onClick={() => {
                        setRecipeToDelete(recipe);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-[var(--color-card)] rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--color-vet-muted)] opacity-50 mb-3" />
          <p className="text-[var(--color-vet-muted)] mb-4 text-sm sm:text-base px-4">
            Sin recetas médicas registradas
          </p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear primera receta
          </Link>
        </div>
      )}

      {/* Modal Ver */}
      {selectedRecipe && patientDataForModal && (
        <RecipePrintModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
          patientData={patientDataForModal}
        />
      )}

      {/* Modal Eliminar con ConfirmationModal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecipeToDelete(null);
        }}
        onConfirm={() => recipeToDelete?._id && removeRecipe(recipeToDelete._id)}
        title="¿Eliminar receta médica?"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de eliminar la receta del{" "}
              <strong className="text-[var(--color-vet-primary)]">
                {recipeToDelete ? formatDate(recipeToDelete.issueDate) : ""}
              </strong>
              ?
            </p>
            {recipeToDelete && recipeToDelete.medications.length > 0 && (
              <div className="text-sm text-[var(--color-vet-muted)] bg-[var(--color-hover)] p-3 rounded-lg">
                <p className="font-medium mb-1.5">Contiene {recipeToDelete.medications.length} medicamento(s):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {recipeToDelete.medications.slice(0, 3).map((med, idx) => (
                    <li key={idx}>{med.name}</li>
                  ))}
                  {recipeToDelete.medications.length > 3 && (
                    <li>y {recipeToDelete.medications.length - 3} más...</li>
                  )}
                </ul>
              </div>
            )}
            <p className="text-sm text-[var(--color-vet-muted)]">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmText="Sí, eliminar receta"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}