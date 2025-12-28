// src/views/vaccinations/CreateVaccinationView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createVaccination } from "../../api/vaccinationAPI";
import { toast } from "../../components/Toast";
import type { VaccinationFormData } from "../../types/vaccination";

const VACCINE_TYPES = [
  "Antirrábica",
  "Parvovirus",
  "Parvovirus y Moquillo",
  "Triple Canina",
  "Tos de Perrera",
  "Quintuple",
  "Sextuple",
  "Quintuple Felina",
  "Triple Felina",
  "Otra",
];

export default function CreateVaccinationView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<VaccinationFormData>({
    vaccinationDate: new Date().toISOString().split("T")[0],
    vaccineType: "",
    cost: 0,
    laboratory: "",
    batchNumber: "",
    expirationDate: "",
    nextVaccinationDate: "",
    observations: "",
  });

  const [customVaccine, setCustomVaccine] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VaccinationFormData) => createVaccination(patientId!, data),
    onSuccess: () => {
      toast.success("Vacuna registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments"] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vaccineType = formData.vaccineType === "Otra" ? customVaccine : formData.vaccineType;

    if (!vaccineType) {
      toast.error("Selecciona el tipo de vacuna");
      return;
    }

    mutate({
      ...formData,
      vaccineType,
    });
  };

  const isValid =
    formData.vaccineType &&
    (formData.vaccineType !== "Otra" || customVaccine) &&
    formData.cost > 0;

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
          <h1 className="text-lg font-bold text-gray-900">Registrar Vacuna</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={`px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
        {/* Fila 1: Vacuna + Fecha + Costo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vacuna *
            </label>
            <select
              name="vaccineType"
              value={formData.vaccineType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
            >
              <option value="">Seleccionar</option>
              {VACCINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="vaccinationDate"
              value={formData.vaccinationDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Costo ($) *
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {formData.vaccineType === "Otra" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Especificar vacuna *
            </label>
            <input
              type="text"
              value={customVaccine}
              onChange={(e) => setCustomVaccine(e.target.value)}
              placeholder="Nombre de la vacuna"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        )}

        {/* Fila 2: Laboratorio + Lote + Vencimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Laboratorio
            </label>
            <input
              type="text"
              name="laboratory"
              value={formData.laboratory}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nº Lote
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vencimiento
            </label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 3: Próxima vacuna + Observaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Próxima vacunación
            </label>
            <input
              type="date"
              name="nextVaccinationDate"
              value={formData.nextVaccinationDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Observaciones
            </label>
            <input
              type="text"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>
      </form>
    </div>
  );
}