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
} from "lucide-react";
import { getRecipesByPatient, deleteRecipe } from "../../api/recipeAPI";
import { getPatientById } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import type { Recipe } from "../../types/recipe";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import RecipePrintModal from "../../components/recipes/RecipePrintModal"; // 👈 CAMBIADO

export default function RecipeListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Query del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Query de recetas
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", patientId],
    queryFn: () => getRecipesByPatient(patientId!),
    enabled: !!patientId,
  });

  // Mutation para eliminar
  const { mutate: removeRecipe, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      toast.success("Receta eliminada");
      queryClient.invalidateQueries({ queryKey: ["recipes", patientId] });
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";
  };

  // Preparar datos del paciente para el modal
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
        <div className="w-8 h-8 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recetas</h2>
          <p className="text-sm text-gray-500">
            {recipes.length} registrada{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </Link>
      </div>

      {/* Lista */}
      {recipes.length > 0 ? (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">
                    {recipe.medications.length} medicamento
                    {recipe.medications.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-1">
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                        +{recipe.medications.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(recipe.issueDate)}
                  </span>
                  {recipe.notes && (
                    <span className="truncate max-w-[150px]">{recipe.notes}</span>
                  )}
                </div>
              </div>

              {/* Cantidad de medicamentos */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-gray-600">
                  <Pill className="w-4 h-4" />
                  <span className="font-semibold">{recipe.medications.length}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-vet-primary hover:bg-vet-primary/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setRecipeToDelete(recipe);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Sin recetas registradas</p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear primera receta
          </Link>
        </div>
      )}

      {/* Modal Ver - AHORA USA RecipePrintModal */}
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

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecipeToDelete(null);
        }}
        onConfirm={() => recipeToDelete?._id && removeRecipe(recipeToDelete._id)}
        petName={`la receta del ${recipeToDelete ? formatDate(recipeToDelete.issueDate) : ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}