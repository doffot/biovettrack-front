// src/views/veterinaryServices/CreateVeterinaryServiceView.tsx
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Package, Search, X, Stethoscope } from "lucide-react";
import { useState } from "react";

import { createVeterinaryService } from "../../api/veterinaryServiceAPI";
import { getProductsWithInventory } from "../../api/productAPI";
import type { VeterinaryServiceFormData } from "../../types/veterinaryService";
import type { ProductWithInventory } from "../../types/inventory";
import { toast } from "../../components/Toast";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CreateVeterinaryServiceView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { data: productsWithInventory = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productsWithInventory"],
    queryFn: getProductsWithInventory,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<VeterinaryServiceFormData>({
    defaultValues: {
      serviceName: "",
      description: "",
      serviceDate: getLocalDateString(),
      products: [],
      veterinarianFee: 0,
      discount: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const watchProducts = watch("products") || [];
  const watchVeterinarianFee = watch("veterinarianFee") || 0;
  const watchDiscount = watch("discount") || 0;

  // Calcular totales
  const productsTotal = watchProducts.reduce((sum, p) => sum + (p.quantity * p.unitPrice || 0), 0);
  const subtotal = productsTotal + Number(watchVeterinarianFee);
  const total = Math.max(0, subtotal - Number(watchDiscount));

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: VeterinaryServiceFormData) => {
      if (!patientId) throw new Error("ID del paciente no encontrado");

      const formattedData = {
        ...data,
        products: (data.products || []).map((p) => ({
          productId: p.productId,
          productName: p.productName,
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice),
          subtotal: Number(p.quantity) * Number(p.unitPrice),
          isFullUnit: p.isFullUnit ?? true,
        })),
        veterinarianFee: Number(data.veterinarianFee) || 0,
        discount: Number(data.discount) || 0,
      };

      return await createVeterinaryService(patientId, formattedData);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
    onSuccess: () => {
      toast.success("Servicio registrado", "El servicio se ha guardado correctamente");
      queryClient.invalidateQueries({ queryKey: ["veterinaryServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["productsWithInventory"] });
      navigate(-1);
    },
  });

  const onSubmit = (data: VeterinaryServiceFormData) => {
    mutate(data);
  };

  const addProductFromInventory = (product: ProductWithInventory) => {
    // Verificar si ya está agregado
    const alreadyAdded = fields.some((f) => f.productId === product._id);
    if (alreadyAdded) {
      toast.warning("Producto duplicado", "Este producto ya está en la lista");
      return;
    }

    append({
      productId: product._id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.salePrice,
      isFullUnit: true,
    });
    setShowProductSearch(false);
    setSearchTerm("");
  };

  // Filtrar productos con stock disponible
  const filteredProducts = productsWithInventory.filter((p) => {
    const hasStock = (p.inventory?.stockUnits || 0) > 0 || (p.inventory?.stockDoses || 0) > 0;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return hasStock && matchesSearch;
  });

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-vet-muted)] text-sm mt-3 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-xl">
          <Stethoscope className="w-6 h-6 text-[var(--color-vet-primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-vet-text)]">Nuevo Servicio Veterinario</h1>
          <p className="text-sm text-[var(--color-vet-muted)]">Registra un procedimiento con productos e insumos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Información básica */}
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-vet-text)] uppercase tracking-wider">
            Información del Servicio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                placeholder="Ej: Colocación de suero, Limpieza dental, Cura de herida..."
                {...register("serviceName", { required: "Este campo es obligatorio" })}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
              />
              {errors.serviceName && (
                <p className="text-red-500 text-xs mt-1">{errors.serviceName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Fecha del Servicio
              </label>
              <input
                type="date"
                {...register("serviceDate")}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Honorarios ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("veterinarianFee", {
                  required: "Este campo es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "No puede ser negativo" },
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
              />
              {errors.veterinarianFee && (
                <p className="text-red-500 text-xs mt-1">{errors.veterinarianFee.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Descripción (opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Detalles adicionales del servicio..."
                {...register("description")}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Productos utilizados */}
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-vet-text)] uppercase tracking-wider">
              Productos / Insumos
            </h2>
            <button
              type="button"
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-vet-primary)] text-white hover:bg-[var(--color-vet-secondary)] transition-colors"
            >
              {showProductSearch ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showProductSearch ? "Cerrar" : "Agregar Producto"}
            </button>
          </div>

          {/* Buscador de productos */}
          {showProductSearch && (
            <div className="p-4 rounded-xl border border-[var(--color-vet-primary)]/30 bg-[var(--color-vet-primary)]/5">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar producto en inventario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => addProductFromInventory(product)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-hover)] border border-[var(--color-border)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-vet-primary)]/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-[var(--color-vet-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-vet-text)]">{product.name}</p>
                          <p className="text-xs text-[var(--color-vet-muted)]">
                            Stock: {product.inventory?.stockUnits || 0} {product.unit}
                            {product.divisible && product.inventory?.stockDoses ? ` + ${product.inventory.stockDoses} ${product.doseUnit}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-vet-primary)]">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Package className="w-8 h-8 text-[var(--color-vet-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--color-vet-muted)]">
                      {searchTerm ? "No se encontraron productos" : "No hay productos con stock disponible"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de productos agregados */}
          {fields.length > 0 ? (
            <div className="space-y-2">
              {fields.map((field, index) => {
                const product = productsWithInventory.find((p) => p._id === field.productId);
                const currentQty = watchProducts[index]?.quantity || 1;
                const currentPrice = watchProducts[index]?.unitPrice || 0;
                const lineTotal = currentQty * currentPrice;

                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-hover)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-[var(--color-vet-primary)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-vet-text)] truncate">
                        {field.productName}
                      </p>
                      <p className="text-xs text-[var(--color-vet-muted)]">
                        Stock disponible: {product?.inventory?.stockUnits || 0} {product?.unit || "unidad(es)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max={product?.inventory?.stockUnits || 999}
                          {...register(`products.${index}.quantity` as const, {
                            required: true,
                            valueAsNumber: true,
                            min: 1,
                          })}
                          className="w-full px-2 py-1.5 text-sm text-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent"
                        />
                      </div>

                      <div className="w-24 text-right">
                        <p className="text-sm font-bold text-[var(--color-vet-primary)]">
                          ${lineTotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-vet-muted)]">
                          ${currentPrice.toFixed(2)} c/u
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hidden inputs */}
                    <input type="hidden" {...register(`products.${index}.productId` as const)} />
                    <input type="hidden" {...register(`products.${index}.productName` as const)} />
                    <input type="hidden" {...register(`products.${index}.unitPrice` as const, { valueAsNumber: true })} />
                    <input type="hidden" {...register(`products.${index}.isFullUnit` as const)} value="true" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-[var(--color-hover)] rounded-xl border border-dashed border-[var(--color-border)]">
              <Package className="w-10 h-10 text-[var(--color-vet-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--color-vet-muted)]">
                No hay productos agregados
              </p>
              <p className="text-xs text-[var(--color-vet-muted)] mt-1">
                Solo se cobrarán los honorarios profesionales
              </p>
            </div>
          )}
        </div>

        {/* Descuento y notas */}
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Descuento ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("discount", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-1">
                Notas internas (opcional)
              </label>
              <input
                type="text"
                placeholder="Notas para uso interno..."
                {...register("notes")}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] focus:ring-2 focus:ring-[var(--color-vet-primary)] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Resumen de costos */}
        <div className="bg-gradient-to-br from-[var(--color-vet-primary)]/10 to-[var(--color-vet-secondary)]/10 rounded-xl border border-[var(--color-vet-primary)]/20 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-4">Resumen del Servicio</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-vet-muted)]">Productos ({fields.length}):</span>
              <span className="text-[var(--color-vet-text)] font-medium">${productsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-vet-muted)]">Honorarios:</span>
              <span className="text-[var(--color-vet-text)] font-medium">${Number(watchVeterinarianFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-vet-muted)]">Subtotal:</span>
              <span className="text-[var(--color-vet-text)] font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {Number(watchDiscount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Descuento:</span>
                <span>-${Number(watchDiscount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-vet-text)]">Total a Cobrar:</span>
              <span className="font-bold text-xl text-[var(--color-vet-primary)]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Servicio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}