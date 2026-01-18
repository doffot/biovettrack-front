// src/views/products/CreateProductView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createProduct } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { ProductFormData } from "../../types/product";

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  category: "medicamento",
  salePrice: 0,
  salePricePerDose: undefined,
  costPrice: undefined,
  unit: "",
  doseUnit: "dosis",
  dosesPerUnit: 1,
  divisible: false,
  active: true,
};

const categoryOptions = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitante", label: "Desparasitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "alimento", label: "Alimento" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otro", label: "Otro" },
];

export default function CreateProductView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Producto creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "divisible" && !checked ? { salePricePerDose: undefined } : {}),
      }));
    } else if (["salePrice", "salePricePerDose", "costPrice", "dosesPerUnit"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("El nombre es obligatorio");
    if (!formData.unit.trim()) return toast.error("La unidad es obligatoria");
    if (!formData.salePrice || formData.salePrice <= 0)
      return toast.error("El precio de venta es obligatorio");
    if (formData.divisible && !formData.salePricePerDose)
      return toast.error("El precio por dosis es obligatorio");

    mutate(formData);
  };

  const isValid =
    formData.name.trim() !== "" &&
    formData.unit.trim() !== "" &&
    formData.salePrice !== undefined &&
    formData.salePrice > 0 &&
    (!formData.divisible || formData.salePricePerDose !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-700 text-vet-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-vet-text">Nuevo Producto</h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-card">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* ====== COLUMNA IZQUIERDA ====== */}
              <div className="space-y-5">
                {/* Información */}
                <div>
                  <h3 className="text-xs font-semibold text-vet-muted uppercase tracking-wider mb-3">
                    Información
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Bravecto Oral"
                        maxLength={100}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-1">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                      >
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-1">
                        Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        placeholder="Notas internas, presentación, etc."
                        maxLength={200}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Unidades */}
                <div>
                  <h3 className="text-xs font-semibold text-vet-muted uppercase tracking-wider mb-3">
                    Unidades
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-1">
                        Unidad física <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="tableta, frasco"
                        maxLength={30}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-vet-text mb-1">
                        Dosis por unidad
                      </label>
                      <input
                        type="number"
                        name="dosesPerUnit"
                        value={formData.dosesPerUnit ?? ""}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        placeholder="1"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ====== COLUMNA DERECHA ====== */}
              <div className="space-y-5">
                {/* Precios */}
                <div>
                  <h3 className="text-xs font-semibold text-vet-muted uppercase tracking-wider mb-3">
                    Precios
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-vet-text mb-1">
                          Costo <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vet-muted text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            name="costPrice"
                            value={formData.costPrice ?? ""}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-vet-text mb-1">
                          Precio de Venta<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vet-muted text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            name="salePrice"
                            value={formData.salePrice ?? ""}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vender por dosis */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="divisible"
                          checked={formData.divisible}
                          onChange={handleChange}
                          className="mt-0.5 w-4 h-4 text-vet-primary border-slate-600 rounded focus:ring-vet-primary focus:ring-offset-0 bg-slate-800"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-vet-text">
                            Se puede vender por dosis
                          </span>
                          <p className="text-xs text-vet-muted mt-0.5">
                            Permite vender fracciones de este producto
                          </p>
                        </div>
                      </label>

                      {formData.divisible && (
                        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-vet-text mb-1">
                              Unidad de dosis
                            </label>
                            <input
                              type="text"
                              name="doseUnit"
                              value={formData.doseUnit}
                              onChange={handleChange}
                              placeholder="dosis, ml"
                              maxLength={10}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-vet-text mb-1">
                              Precio por dosis <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vet-muted text-sm">
                                $
                              </span>
                              <input
                                type="number"
                                name="salePricePerDose"
                                value={formData.salePricePerDose ?? ""}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Activo */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-4 h-4 text-vet-primary border-slate-600 rounded focus:ring-vet-primary focus:ring-offset-0 bg-slate-800"
                      />
                      <span className="text-sm text-vet-text">Producto activo</span>
                    </label>
                  </div>
                </div>

                {/* Resumen */}
                {formData.salePrice !== undefined && formData.salePrice > 0 && (
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <h4 className="text-xs font-semibold text-vet-muted uppercase tracking-wider mb-2">
                      Resumen
                    </h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-vet-text">
                        <span className="text-vet-muted">1 {formData.unit || "unidad"}:</span>{" "}
                        <strong>${formData.salePrice.toFixed(2)}</strong>
                      </span>
                      {formData.divisible && formData.salePricePerDose && (
                        <span className="text-vet-text">
                          <span className="text-vet-muted">1 {formData.doseUnit || "dosis"}:</span>{" "}
                          <strong>${formData.salePricePerDose.toFixed(2)}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm text-vet-text font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className={`px-5 py-2 text-sm rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isValid && !isPending
                  ? "bg-vet-primary hover:bg-vet-secondary text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
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
      </form>
    </div>
  );
}