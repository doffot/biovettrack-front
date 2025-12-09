// src/views/dewormings/CreateDewormingView.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createDeworming } from "../../api/dewormingAPI";
import { toast } from "../../components/Toast";
import type { DewormingFormData } from "../../types/deworming";

const DEWORMING_TYPES = ["Interna", "Externa", "Ambas"] as const;

export default function CreateDewormingView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<DewormingFormData>({
    applicationDate: new Date().toISOString().split("T")[0],
    dewormingType: "Interna",
    productName: "",
    dose: "",
    cost: 0,
    nextApplicationDate: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DewormingFormData) => createDeworming(patientId!, data),
    onSuccess: () => {
      toast.success("Desparasitación registrada");
      queryClient.invalidateQueries({ queryKey: ["dewormings", patientId] });
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
    
    if (!formData.productName || !formData.dose || formData.cost <= 0) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    mutate(formData);
  };

  const isValid = formData.productName && formData.dose && formData.cost > 0;

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
          <h1 className="text-lg font-bold text-gray-900">Registrar Desparasitación</h1>
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
        {/* Fila 1: Tipo + Fecha + Costo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
            <select
              name="dewormingType"
              value={formData.dewormingType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
            >
              {DEWORMING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Costo ($) *</label>
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

        {/* Fila 2: Producto + Dosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Producto *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Nombre del producto"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dosis *</label>
            <input
              type="text"
              name="dose"
              value={formData.dose}
              onChange={handleChange}
              placeholder="Ej: 1 tableta, 0.5ml"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 3: Próxima aplicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Próxima aplicación</label>
            <input
              type="date"
              name="nextApplicationDate"
              value={formData.nextApplicationDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>
      </form>
    </div>
  );
}