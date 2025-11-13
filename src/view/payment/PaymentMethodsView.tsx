// src/views/payment/PaymentMethodsView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  
  Edit,
  Trash2,
  CreditCard,
  Plus,
  Search,
  MoreVertical,
  Wallet,
  Building,
  Smartphone,
  Landmark,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { PaymentMethod } from "../../types/payment";
import { getPaymentMethods, deletePaymentMethod } from "../../api/paymentAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function PaymentMethodsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<{ id: string; name: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const { mutate: removeMethod, isPending: isDeleting } = useMutation({
    mutationFn: (methodId: string) => deletePaymentMethod(methodId),
    onError: (error: Error) => {
      toast.error(error.message);
      setMethodToDelete(null);
    },
    onSuccess: () => {
      toast.success("Método de pago eliminado con éxito");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setMethodToDelete(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = (methodId: string, methodName: string) => {
    setMethodToDelete({ id: methodId, name: methodName });
    setActiveDropdown(null);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      removeMethod(methodToDelete.id);
    }
  };

  const toggleDropdown = (methodId: string) => {
    setActiveDropdown(activeDropdown === methodId ? null : methodId);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash': return Wallet;
      case 'card': return CreditCard;
      case 'bank': return Building;
      case 'mobile': return Smartphone;
      case 'digital': return Landmark;
      default: return CreditCard;
    }
  };

  const getPaymentModeLabel = (mode: string) => {
    switch (mode) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'bank': return 'Transferencia';
      case 'mobile': return 'Pago Móvil';
      case 'digital': return 'Billetera Digital';
      default: return mode;
    }
  };

  const filteredMethods =
    paymentMethods?.filter((method: PaymentMethod) =>
      method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.paymentMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando métodos de pago...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Fijo - Mismo estilo que PatientListView */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          {/* Línea principal: Título + Botón */}
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Métodos de Pago
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Gestiona todos los métodos de pago disponibles
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-vet-text">{paymentMethods?.length || 0}</p>
                <p className="text-vet-muted text-sm">Total registrados</p>
              </div>
            </div>

            {/* Botón "Nuevo Método" */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/payment-methods/create"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Método</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-vet-muted" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, moneda, modalidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-vet-light border border-vet-muted/30 rounded-xl text-vet-text placeholder-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/50 focus:border-vet-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-55 md:h-50 lg:h-45"></div>

      {/* Botón flotante móvil */}
      <Link
        to="/payment-methods/create"
        className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-vet-primary hover:bg-vet-secondary text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Content con Cards Pro */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        {filteredMethods.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredMethods.map((method, index) => {
              const ModeIcon = getPaymentModeIcon(method.paymentMode);
              
              return (
                <div
                  key={method._id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-vet-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Card Content */}
                  <div className="p-6">
                    {/* Header de la card */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center shadow-md">
                            <ModeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                            <DollarSign className="w-2.5 h-2.5 text-vet-primary" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-vet-primary transition-colors truncate">
                            {method.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {getPaymentModeLabel(method.paymentMode)} • {method.currency}
                          </p>
                        </div>
                      </div>
                      
                      {/* Dropdown para desktop */}
                      <div className="relative hidden sm:block">
                        <button
                          onClick={() => toggleDropdown(method._id)}
                          className="p-2 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-muted transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdown === method._id && (
                          <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                            <Link
                              to={`/payment-methods/edit/${method._id}`}
                              className="flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-blue-600 transition-colors first:rounded-t-xl text-sm"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteClick(method._id, method.name)}
                              className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-600 transition-colors w-full text-left last:rounded-b-xl text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del método */}
                    <div className="space-y-3 mb-6">
                      {/* Descripción */}
                      {method.description && (
                        <div className="p-3 bg-vet-light rounded-lg">
                          <p className="text-sm text-gray-700">{method.description}</p>
                        </div>
                      )}

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <DollarSign className="w-4 h-4 text-gray-500 mb-1" />
                          <p className="text-sm font-medium text-gray-900">{method.currency}</p>
                          <p className="text-xs text-gray-500">Moneda</p>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          {method.requiresReference ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mb-1" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mb-1" />
                          )}
                          <p className="text-sm font-medium text-gray-900">
                            {method.requiresReference ? 'Sí' : 'No'}
                          </p>
                          <p className="text-xs text-gray-500">Requiere referencia</p>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-center justify-center p-2 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-700">Activo</span>
                      </div>
                    </div>

                    {/* Acciones para móvil */}
                    <div className="sm:hidden flex gap-2 pt-4 border-t border-gray-100">
                      <Link
                        to={`/payment-methods/edit/${method._id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-medium text-sm transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(method._id, method.name)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium text-sm transition-all duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-vet-muted/20 p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vet-light flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-vet-muted" />
            </div>

            <h3 className="text-2xl font-bold text-vet-text mb-3">
              {searchTerm ? "No se encontraron resultados" : "No hay métodos de pago"}
            </h3>

            <p className="text-vet-muted mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No encontramos coincidencias para "${searchTerm}". Intenta con otros términos.`
                : "Comienza creando tu primer método de pago para usarlo en servicios y ventas."}
            </p>

            {!searchTerm && (
              <Link
                to="/payment-methods/create"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Método
              </Link>
            )}
          </div>
        )}
      </div>

     <DeleteConfirmationModal
  isOpen={!!methodToDelete}
  onClose={() => setMethodToDelete(null)}
  onConfirm={confirmDelete}
  petName={methodToDelete?.name || ''}
  isDeleting={isDeleting}
/>

      {/* Overlay para dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-30 sm:hidden"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}