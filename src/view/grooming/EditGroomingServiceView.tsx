// src/views/grooming/EditGroomingServiceView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import {
  updateGroomingService,
  getGroomingServiceById,
} from "../../api/groomingAPI";
import { getPaymentMethods } from "../../api/paymentAPI";
import { extractId } from "../../utils/extractId";

import {
  Scissors,
  Calendar,
  DollarSign,
  ClipboardList,
  Edit3,
  Save,
  ArrowLeft,
  CreditCard,
  Hash,
  PawPrint,
} from "lucide-react";
import type { PaymentStatus, ServiceStatus, ServiceType } from "../../types";

export default function EditGroomingServiceView() {
  const { patientId, serviceId } = useParams<{ patientId: string; serviceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service: "Corte" as ServiceType,
    specifications: "",
    observations: "",
    cost: 0,
    paymentMethod: "",
    paymentReference: "",
    status: "Programado" as ServiceStatus,
    paymentStatus: "Pendiente" as PaymentStatus,
    amountPaid: 0,
    date: "",
  });

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId),
    enabled: !!serviceId,
  });

  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  useEffect(() => {
    if (service) {
      const normalizedDate = service.date.split("T")[0];
      setFormData({
        service: service.service,
        specifications: service.specifications,
        observations: service.observations || "",
        cost: service.cost,
        paymentMethod: extractId(service.paymentMethod) || "",
        paymentReference: service.paymentReference || "",
        status: service.status,
        paymentStatus: service.paymentStatus,
        amountPaid: service.amountPaid,
        date: normalizedDate,
      });
    }
  }, [service]);

  const { mutate: updateService, isPending } = useMutation({
    mutationFn: (updates: Partial<typeof formData>) =>
      updateGroomingService({ formData: updates, groomingId: serviceId }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el servicio");
    },
    onSuccess: () => {
      toast.success("Servicio actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["groomingService", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      navigate(`/patients/${patientId}/grooming-services/${serviceId}`);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates: Partial<typeof formData> = {};

    if (formData.service !== service?.service) updates.service = formData.service;
    if (formData.specifications !== service?.specifications)
      updates.specifications = formData.specifications;
    if (formData.observations !== (service?.observations || ""))
      updates.observations = formData.observations;
    if (formData.cost !== service?.cost) updates.cost = formData.cost;

    const currentPaymentMethodId = extractId(service?.paymentMethod);
    if (formData.paymentMethod !== currentPaymentMethodId)
      updates.paymentMethod = formData.paymentMethod;

    if (formData.paymentReference !== (service?.paymentReference || ""))
      updates.paymentReference = formData.paymentReference;
    if (formData.status !== service?.status) updates.status = formData.status;
    if (formData.paymentStatus !== service?.paymentStatus)
      updates.paymentStatus = formData.paymentStatus;
    if (formData.amountPaid !== service?.amountPaid)
      updates.amountPaid = formData.amountPaid;
    if (formData.date !== service?.date.split("T")[0])
      updates.date = formData.date;

    if (Object.keys(updates).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updateService(updates);
  };

  const isLoading = isLoadingService || isLoadingPaymentMethods;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-gradient px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-vet-gradient px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <Scissors className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-vet-text mb-2">Servicio no encontrado</h2>
          <Link
            to={`/patients/${patientId}/grooming-services/${serviceId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a servicios
          </Link>
        </div>
      </div>
    );
  }

  const patientName = typeof service.patientId === 'string'
    ? "Mascota"
    : service.patientId?.name || "Mascota";

  const balance = formData.cost - formData.amountPaid;

  return (
    <div className="h-screen bg-vet-gradient overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
        
        {/* Header Compacto */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patientId}/grooming-services/${serviceId}`}
              className="p-2 rounded-lg hover:bg-white/60 text-vet-primary transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-vet-primary to-vet-accent rounded-lg">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-vet-text">Editar: {formData.service}</h1>
                <p className="text-xs text-vet-muted">{patientName}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-all disabled:opacity-50 text-sm"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Grid Principal - Altura ajustada */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          
          {/* Columna Izquierda - Formulario (altura ajustada) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-4 shadow-card border-l-4 border-vet-primary overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Fecha */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Fecha</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                  />
                </div>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Servicio</label>
                <div className="relative">
                  <Scissors className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <select
                    value={formData.service}
                    onChange={(e) => handleInputChange("service", e.target.value as ServiceType)}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary appearance-none"
                  >
                    <option value="Corte">Corte</option>
                    <option value="Baño">Baño</option>
                    <option value="Corte y Baño">Corte y Baño</option>
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value as ServiceStatus)}
                  className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary appearance-none"
                >
                  <option value="Programado">Programado</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Costo */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Costo Total</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost || ""}
                    onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                  />
                </div>
              </div>

              {/* Monto Pagado */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Pagado</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amountPaid || ""}
                    onChange={(e) => handleInputChange("amountPaid", parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                  />
                </div>
              </div>

              {/* Estado de Pago */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Estado Pago</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleInputChange("paymentStatus", e.target.value as PaymentStatus)}
                  className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary appearance-none"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Parcial">Parcial</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Método de Pago */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-vet-text mb-1">Método de Pago</label>
                <div className="relative">
                  <CreditCard className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    disabled={isLoadingPaymentMethods}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary appearance-none disabled:opacity-50"
                  >
                    <option value="">Seleccionar...</option>
                    {paymentMethods.map((method) => (
                      <option key={method._id} value={method._id}>
                        {method.name} • {method.currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-xs font-medium text-vet-text mb-1">Referencia</label>
                <div className="relative">
                  <Hash className="absolute left-2 top-1/2 -translate-y-1/2 text-vet-muted w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={formData.paymentReference}
                    onChange={(e) => handleInputChange("paymentReference", e.target.value)}
                    placeholder="Núm. transferencia"
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                  />
                </div>
              </div>

              {/* Especificaciones */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-vet-text mb-1">
                  Especificaciones ({formData.specifications.length}/300)
                </label>
                <div className="relative">
                  <ClipboardList className="absolute left-2 top-2 text-vet-muted w-3.5 h-3.5" />
                  <textarea
                    value={formData.specifications}
                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                    placeholder="Detalles del servicio..."
                    rows={2}
                    maxLength={300}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary resize-none"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-vet-text mb-1">Observaciones</label>
                <div className="relative">
                  <Edit3 className="absolute left-2 top-2 text-vet-muted w-3.5 h-3.5" />
                  <textarea
                    value={formData.observations}
                    onChange={(e) => handleInputChange("observations", e.target.value)}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-vet-primary focus:border-vet-primary resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen (misma altura) */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            
            {/* Resumen Financiero */}
            <div className="bg-gradient-to-br from-vet-primary to-vet-accent rounded-xl p-4 shadow-lg text-white">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Resumen
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pb-2 border-b border-white/20">
                  <span className="opacity-90">Total</span>
                  <span className="font-bold text-lg">${formData.cost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="opacity-90">Pagado</span>
                  <span className="font-semibold">${formData.amountPaid.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="font-medium">Saldo</span>
                  <span className={`font-bold text-xl ${balance > 0 ? 'text-yellow-200' : 'text-green-200'}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>

              {balance > 0 && (
                <div className="mt-3 p-2 bg-white/10 rounded-lg text-xs text-center">
                  ⚠️ Pago pendiente
                </div>
              )}
            </div>

            {/* Info Mascota */}
            <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-vet-accent">
              <div className="flex items-center gap-2 mb-2">
                <PawPrint className="w-4 h-4 text-vet-primary" />
                <h3 className="text-sm font-bold text-vet-text">Mascota</h3>
              </div>
              <p className="text-sm font-semibold text-vet-primary">{patientName}</p>
              {typeof service.patientId !== 'string' && service.patientId?.species && (
                <p className="text-xs text-vet-muted mt-1">{service.patientId.species}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}