// src/views/grooming/GroomingDetailView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  Scissors,
  Edit3,
  Trash2,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Eye,
  CreditCard,
  Hash,
  PawPrint,
  DollarSign,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { 
  deleteGroomingService, 
  getGroomingServiceById,
  updateGroomingService 
} from "../../api/groomingAPI";
import { extractId } from "../../utils/extractId";
import { formatCurrency } from "../../utils/currencyUtils";
import ServiceHistoryModal from "../../components/grooming/ServiceHistoryModal";

// Helper para nombres
const resolveName = (field: string | { name?: string; lastName?: string } | null | undefined): string => {
  if (!field) return '—';
  if (typeof field === 'string') return field;
  if ('name' in field) {
    const name = field.name || '';
    const lastName = field.lastName || '';
    return `${name} ${lastName}`.trim() || '—';
  }
  return '—';
};

// Iconos por estado
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, any> = {
    'Completado': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    'Cancelado': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    'En progreso': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    'Programado': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' }
  };
  
  const config = configs[status] || configs['Programado'];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></span>
      <span className="text-xs font-semibold">{status}</span>
    </div>
  );
};

export default function GroomingDetailView() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId?: string }>();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
   const [showHistoryModal, setShowHistoryModal] = useState(false);

  const {  data:service, isLoading } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGroomingService(serviceId!),
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el servicio");
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Servicio eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      setShowDeleteModal(false);
      const patientId = extractId(service?.patientId);
      if (patientId) {
        navigate(`/patients/${patientId}/grooming-services`);
      } else {
        navigate("/grooming");
      }
    },
  });

  // ✅ Mutación con costo como parámetro (seguro)
  const { mutate: recordPayment, isPending: isPaying } = useMutation({
    mutationFn: ({ newAmountPaid, currentCost }: { newAmountPaid: number; currentCost: number }) => {
      let newPaymentStatus: "Pendiente" | "Parcial" | "Pagado" = "Pendiente";
      if (newAmountPaid >= currentCost) {
        newPaymentStatus = "Pagado";
      } else if (newAmountPaid > 0) {
        newPaymentStatus = "Parcial";
      }

      return updateGroomingService({
        groomingId: serviceId!,
        formData: { 
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus
        }
      });
    },
    onSuccess: (updatedService) => {
      queryClient.setQueryData(['groomingService', serviceId], updatedService);
      toast.success("Pago registrado correctamente");
      setShowPaymentModal(false);
      setPaymentAmount('');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el pago");
    }
  });

  const { mutate: markAsCompleted, isPending: isCompleting } = useMutation({
    mutationFn: () =>
      updateGroomingService({
        groomingId: serviceId!,
        formData: { status: "Completado" }
      }),
    onSuccess: (updatedService) => {
      queryClient.setQueryData(['groomingService', serviceId], updatedService);
      toast.success("Servicio marcado como completado");
    },
    onError: (error) => {
      toast.error(error.message || "Error al marcar como completado");
    }
  });

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
        <div className="max-w-md w-full text-center">
          <Scissors className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-vet-text mb-2">Servicio no encontrado</h2>
          <Link
            to="/grooming"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </div>
    );
  }

  const patientId = extractId(service.patientId);
  const patientName = typeof service.patientId === 'string' 
    ? "Mascota" 
    : service.patientId?.name || "Mascota";
  
  const currency = typeof service.paymentMethod === 'string'
    ? 'USD'
    : service.paymentMethod?.currency || 'USD';

  const balance = service.cost - service.amountPaid;

  const handleConfirmPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError("Ingresa un monto válido");
      return;
    }
    if (amount > balance) {
      setPaymentError(`El monto no puede exceder ${formatCurrency(balance, currency)}`);
      return;
    }
    setPaymentError("");
    // ✅ Pasamos el costo actual como parámetro
    recordPayment({ 
      newAmountPaid: service.amountPaid + amount, 
      currentCost: service.cost 
    });
  };

  return (
    <div className="min-h-screen bg-vet-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/patients/${patientId}/grooming-services`}
              className="p-2 rounded-lg hover:bg-white/60 text-vet-primary transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-accent rounded-xl shadow-soft">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-vet-text">{service.service}</h1>
                <p className="text-xs text-vet-muted">para {patientName}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/patients/${patientId}/grooming-services/${service._id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-all hover:shadow-md text-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actualizar</span>
            </Link>
            <button 
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 border-2 border-vet-danger text-vet-danger rounded-lg font-medium hover:bg-red-50 transition-all text-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-vet-primary">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-vet-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-vet-muted uppercase tracking-wide font-medium">Fecha programada</p>
                    <p className="font-semibold text-vet-text text-sm lg:text-base">
                      {new Date(service.date).toLocaleDateString("es-ES", {
                        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-5 shadow-card border-l-4 border-vet-accent">
              <h3 className="font-bold text-vet-text mb-4 flex items-center gap-2 text-sm lg:text-base">
                <ClipboardList className="w-4 h-4 text-vet-primary" />
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-vet-light/40 rounded-lg">
                  <Scissors className="w-4 h-4 text-vet-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-vet-muted font-medium">Tipo de servicio</p>
                    <p className="font-semibold text-vet-text text-sm">{service.service}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-vet-light/40 rounded-lg">
                  <CreditCard className="w-4 h-4 text-vet-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-vet-muted font-medium">Método de pago</p>
                    <p className="font-semibold text-vet-text text-sm">{resolveName(service.paymentMethod)}</p>
                  </div>
                </div>

                {service.paymentReference && (
                  <div className="flex items-start gap-3 p-3 bg-vet-light/40 rounded-lg">
                    <Hash className="w-4 h-4 text-vet-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-vet-muted font-medium">Referencia</p>
                      <p className="font-semibold text-vet-text text-sm font-mono">{service.paymentReference}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-vet-light/40 rounded-lg">
                  <Eye className="w-4 h-4 text-vet-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-vet-muted font-medium">Especificaciones</p>
                    <p className="font-semibold text-vet-text text-sm">{service.specifications}</p>
                  </div>
                </div>
              </div>

              {service.observations && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Observaciones</p>
                  <p className="text-sm text-blue-900">{service.observations}</p>
                </div>
              )}
            </div>

            {typeof service.patientId !== 'string' && service.patientId && (
              <div className="bg-white rounded-xl p-4 lg:p-5 shadow-card border-l-4 border-vet-secondary">
                <h3 className="font-bold text-vet-text mb-4 flex items-center gap-2 text-sm lg:text-base">
                  <PawPrint className="w-4 h-4 text-vet-primary" />
                  Información de la Mascota
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 bg-vet-light/40 rounded-lg">
                    <p className="text-xs text-vet-muted font-medium mb-0.5">Nombre</p>
                    <p className="font-bold text-vet-text text-sm">{service.patientId.name}</p>
                  </div>
                  <div className="p-2.5 bg-vet-light/40 rounded-lg">
                    <p className="text-xs text-vet-muted font-medium mb-0.5">Especie</p>
                    <p className="font-bold text-vet-text text-sm">{service.patientId.species}</p>
                  </div>
                  <div className="p-2.5 bg-vet-light/40 rounded-lg">
                    <p className="text-xs text-vet-muted font-medium mb-0.5">Raza</p>
                    <p className="font-bold text-vet-text text-sm">{service.patientId.breed || "—"}</p>
                  </div>
                  <div className="p-2.5 bg-vet-light/40 rounded-lg">
                    <p className="text-xs text-vet-muted font-medium mb-0.5">Peso</p>
                    <p className="font-bold text-vet-text text-sm">{service.patientId.weight ? `${service.patientId.weight} kg` : "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-vet-primary to-vet-accent rounded-xl p-5 shadow-lg text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                Resumen Financiero
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">Costo Total</span>
                  <span className="text-2xl font-bold">{formatCurrency(service.cost, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Pagado</span>
                  <span className="text-lg font-semibold">{formatCurrency(service.amountPaid, currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/20">
                  <span className="text-sm font-medium">Saldo Pendiente</span>
                  <span className={`text-xl font-bold ${balance > 0 ? 'text-yellow-200' : 'text-green-200'}`}>
                    {formatCurrency(balance, currency)}
                  </span>
                </div>
              </div>
              {balance > 0 && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-xs font-medium">⚠️ Pago pendiente</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-vet-primary">
              <h3 className="font-bold text-vet-text mb-3 text-sm">Acciones Rápidas</h3>
              <div className="space-y-2">
                {balance > 0 ? (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-2.5 px-3 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Registrar Pago
                  </button>
                ) : service.status !== "Completado" ? (
                  <button
                    onClick={() => markAsCompleted()}
                    disabled={isCompleting}
                    className="w-full py-2.5 px-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como Completado
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-3 bg-green-100 text-green-800 rounded-lg text-sm text-center font-medium">
                    ✅ Servicio Completado
                  </div>
                )}

                <button 
  onClick={() => setShowHistoryModal(true)} // Cambiar handleViewHistory por esto
  className="w-full py-2.5 px-3 bg-vet-light hover:bg-vet-primary hover:text-white text-vet-primary rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2"
>
  <ClipboardList className="w-4 h-4" />
  Ver Historial
</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Pago */}
        {showPaymentModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-vet-text flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-vet-primary" />
                  Registrar Pago
                </h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-vet-light/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-vet-muted">Costo Total:</span>
                  <span className="font-semibold">{formatCurrency(service.cost, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-vet-muted">Ya Pagado:</span>
                  <span className="font-semibold">{formatCurrency(service.amountPaid, currency)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-vet-primary/20">
                  <span className="font-semibold">Saldo Pendiente:</span>
                  <span className="font-bold text-vet-primary">
                    {formatCurrency(balance, currency)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-vet-text mb-2">
                  Monto a Pagar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balance}
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setPaymentError("");
                    }}
                    placeholder="0.00"
                    className="w-full pl-3 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-vet-primary focus:outline-none text-lg"
                  />
                </div>
                {paymentError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {paymentError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isPaying}
                  className="flex-1 py-2.5 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent disabled:opacity-60"
                >
                  {isPaying ? "Procesando..." : "Confirmar Pago"}
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => removeService()}
          petName={`el servicio de ${service.service.toLowerCase()}`}
          isDeleting={isDeleting}
        />
        {/* Al final, antes del último </div> */}
<ServiceHistoryModal
  isOpen={showHistoryModal}
  onClose={() => setShowHistoryModal(false)}
  patientId={patientId!}
  patientName={patientName}
  currentServiceId={service._id}
/>
      </div>
    </div>
  );
}