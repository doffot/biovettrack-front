// src/views/veterinaryServices/VeterinaryServiceDetailView.tsx
import { useParams, useNavigate} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Stethoscope, 
  Calendar, 
  Package, 
  Trash2, 
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

import { getServiceById, deleteVeterinaryService } from "../../api/veterinaryServiceAPI";
import { getPatientById } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function VeterinaryServiceDetailView() {
  const { patientId, serviceId } = useParams<{ patientId: string; serviceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["veterinaryService", serviceId],
    queryFn: () => getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const {  data:patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteVeterinaryService(serviceId!),
    onSuccess: () => {
      toast.success("Servicio eliminado", "El servicio ha sido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["veterinaryServices", patientId] });
      navigate(`/patients/${patientId}/veterinary-services`);
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Completado":
        return {
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      case "Pendiente":
        return {
          color: "bg-amber-50 text-amber-600 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "Cancelado":
        return {
          color: "bg-red-50 text-red-600 border-red-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-600 border-gray-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  if (isLoadingService) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-8">
        <Stethoscope className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Servicio no encontrado</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(service.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 bg-vet-primary rounded-xl p-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{service.serviceName}</h1>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(service.serviceDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{service.status}</span>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg hover:bg-red-500/80 text-white transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda: Paciente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Paciente</h3>
            {patient ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  {patient.photo ? (
                    <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.species} • {patient.breed}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 border border-dashed border-gray-200 text-center">
                <User className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sin paciente asignado</p>
              </div>
            )}

            {/* Descripción */}
            {service.description && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-vet-primary" />
                  <span className="text-sm font-medium text-gray-700">Descripción</span>
                </div>
                <p className="text-sm text-gray-900">{service.description}</p>
              </div>
            )}

            {/* Notas */}
            {service.notes && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Notas</span>
                </div>
                <p className="text-sm text-gray-900">{service.notes}</p>
              </div>
            )}
          </div>

          {/* Columna central: Productos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Productos ({service.products.length})</h3>
            {service.products.length > 0 ? (
              <div className="space-y-3">
                {service.products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-vet-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                        <p className="text-xs text-gray-500">
                          {product.quantity} x ${product.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-vet-primary">
                      ${product.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 border border-dashed border-gray-200 text-center">
                <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sin productos</p>
              </div>
            )}
          </div>

          {/* Columna derecha: Resumen financiero */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Resumen</h3>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Productos:</span>
                  <span className="text-sm text-gray-900">${service.productsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Honorarios:</span>
                  <span className="text-sm text-gray-900">${service.veterinarianFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">${service.subtotal.toFixed(2)}</span>
                </div>
                {service.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento:</span>
                    <span>-${service.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-sm text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-vet-primary">
                    ${service.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutate()}
        title="Eliminar servicio"
        message={
          <p className="text-gray-600">
            ¿Eliminar <span className="font-semibold text-gray-900">{service.serviceName}</span>? Esta acción no se puede deshacer.
          </p>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}