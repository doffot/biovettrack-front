// src/components/grooming/EditGroomingServiceForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateGroomingService } from "../../api/groomingAPI";
import { getPaymentMethods } from "../../api/paymentAPI";
import { toast } from "../../components/Toast";
import type { GroomingServiceFormData } from "../../types";
import GroomingServiceForm from "../../components/grooming/groomingForm";

// ✅ Props que recibe el formulario - Haciendo service opcional temporalmente
interface EditGroomingServiceFormProps {
  service?: any; // Temporal hasta ajustar los tipos
  patientId?: string;
}

export default function EditGroomingServiceForm({ 
  service, 
  patientId 
}: EditGroomingServiceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Obtener métodos de pago
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<GroomingServiceFormData>();

  // ✅ Resetear el formulario con los datos del servicio cuando ambos estén listos
  React.useEffect(() => {
    if (service && paymentMethods.length > 0 && !isLoadingPaymentMethods) {
      // Determinar el ID del método de pago actual
      const currentPaymentMethodId = typeof service.paymentMethod === 'string' 
        ? service.paymentMethod 
        : service.paymentMethod?._id;

      reset({
        date: service.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        service: service.service || "",
        cost: service.cost || 0,
        paymentMethod: currentPaymentMethodId || "",
        paymentReference: service.paymentReference || "",
        status: service.status || "Programado",
        paymentStatus: service.paymentStatus || "Pendiente",
        amountPaid: service.amountPaid || 0,
        specifications: service.specifications || "",
        observations: service.observations || "",
      });
    }
  }, [service, paymentMethods, isLoadingPaymentMethods, reset]);

  // Obtener el método de pago seleccionado
  const selectedPaymentMethodId = watch("paymentMethod");
  const selectedPaymentMethod = paymentMethods.find(
    method => method._id === selectedPaymentMethodId
  );

  // Mutación para actualizar
  const { mutate: updateService, isPending: isUpdating } = useMutation({
    mutationFn: (formData: GroomingServiceFormData) =>
      updateGroomingService({
        formData,
        groomingId: service?._id || "",
      }),
    onSuccess: () => {
      toast.success("Servicio de grooming actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["groomingService", service?._id] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: GroomingServiceFormData) => {
    if (!service?._id) {
      toast.error("No se puede actualizar el servicio: ID no disponible");
      return;
    }
    updateService(data);
  };

  // Mostrar loading mientras se cargan los métodos de pago
  if (isLoadingPaymentMethods) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-vet-text">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  // Verificar que el servicio esté disponible
  if (!service) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Servicio no disponible</h3>
          <p className="text-red-600 mb-4">No se pudo cargar la información del servicio.</p>
          <button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Volver al paciente
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <GroomingServiceForm
        register={register}
        errors={errors}
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
      />
      
      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(`/patients/${patientId}`)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="flex-1 px-4 py-2.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Actualizando...
            </div>
          ) : (
            "Actualizar Servicio"
          )}
        </button>
      </div>
    </form>
  );
}