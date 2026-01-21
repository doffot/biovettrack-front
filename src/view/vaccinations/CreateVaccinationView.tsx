// src/views/vaccinations/CreateVaccinationView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Package } from "lucide-react";
import { createVaccination } from "../../api/vaccinationAPI";
import { getActiveProducts } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { VaccinationFormData } from "../../types/vaccination";

const VACCINE_TYPES = [
  "Antirrábica",
  "Parvovirus",
  "Parvovirus y Moquillo",
  "Triple Canina",
  "Tos de Perrera",
  "Quíntuple",
  "Séxtuple",
  "Quíntuple Felina",
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
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VaccinationFormData & { productId?: string }) => {
      const payload = { ...data };
      if (selectedProduct && selectedProduct !== "manual") {
        payload.productId = selectedProduct;
      }
      return createVaccination(patientId!, payload as VaccinationFormData);
    },
    onSuccess: () => {
      toast.success(
        "Vacuna registrada", 
        "El registro ha sido agregado al esquema de vacunación"
      );
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al registrar", 
        error.message || "No se pudo guardar la vacuna"
      );
    },
  });

  useEffect(() => {
    if (selectedProduct && selectedProduct !== "manual") {
      const product = products.find(p => p._id === selectedProduct);
      if (product) {
        setFormData(prev => ({
          ...prev,
          vaccineType: product.name,
          cost: product.salePrice,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        vaccineType: "",
        cost: 0,
      }));
    }
  }, [selectedProduct, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let vaccineType = formData.vaccineType;
    if (!selectedProduct || selectedProduct === "manual") {
      vaccineType = formData.vaccineType === "Otra" ? customVaccine : formData.vaccineType;
      if (!vaccineType) {
        toast.warning("Campo requerido", "Selecciona el tipo de vacuna");
        return;
      }
    }

    if (formData.cost <= 0) {
      toast.warning("Costo inválido", "El costo debe ser mayor a 0");
      return;
    }

    const payload = {
      ...formData,
      vaccineType,
      ...(selectedProduct && selectedProduct !== "manual" ? { productId: selectedProduct } : {}),
    };

    mutate(payload as VaccinationFormData & { productId?: string });
  };

  const isProductSelected = !!selectedProduct && selectedProduct !== "manual";
  const isValid = 
    (isProductSelected || 
     (formData.vaccineType && 
      (formData.vaccineType !== "Otra" || customVaccine))) &&
    formData.cost > 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-[var(--color-vet-text)]">Registrar Vacuna</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Selector de producto destacado */}
        <div className="bg-[var(--color-vet-primary)]/5 border border-[var(--color-vet-primary)]/20 rounded-lg p-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-vet-text)] mb-2">
            <Package className="w-3.5 h-3.5 text-[var(--color-vet-primary)]" />
            Producto del catálogo
          </label>
          <select
            value={selectedProduct}
            onChange={handleProductChange}
            className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
          >
            <option value="">-- Seleccionar o ingresar manualmente --</option>
            <option value="manual">📝 Ingresar manualmente</option>
            {products
              .filter(p => p.category === "vacuna")
              .map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} — ${product.salePrice} ({product.unit})
                </option>
              ))}
          </select>
        </div>

        {/* Campos principales en una sola fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {!isProductSelected && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
                Vacuna <span className="text-red-500">*</span>
              </label>
              <select
                name="vaccineType"
                value={formData.vaccineType}
                onChange={handleChange}
                disabled={isProductSelected}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] disabled:opacity-60 transition-all"
              >
                <option value="">Seleccionar</option>
                {VACCINE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="vaccinationDate"
              value={formData.vaccinationDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Costo ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isProductSelected}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] disabled:opacity-60 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Próxima dosis
            </label>
            <input
              type="date"
              name="nextVaccinationDate"
              value={formData.nextVaccinationDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>
        </div>

        {/* Campo especificar "Otra" */}
        {formData.vaccineType === "Otra" && !isProductSelected && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Especificar vacuna <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customVaccine}
              onChange={(e) => setCustomVaccine(e.target.value)}
              placeholder="Nombre de la vacuna"
              maxLength={50}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>
        )}

        {/* Detalles adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Laboratorio
            </label>
            <input
              type="text"
              name="laboratory"
              value={formData.laboratory}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={100}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Nº Lote
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="Opcional"
              maxLength={50}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Vencimiento
            </label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Observaciones
          </label>
          <input
            type="text"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Notas adicionales (opcional)"
            maxLength={300}
            className="w-full px-2.5 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
          />
        </div>

        {/* Botones compactos */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Vacuna</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}