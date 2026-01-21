// src/views/payment/CreatePaymentMethodView.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, CreditCard, ArrowLeft, Plus } from "lucide-react";

// API
import { createPaymentMethod } from "../../api/paymentAPI";

// Types
import { toast } from "../../components/Toast";
import type { PaymentMethodFormData } from "../../types/payment";
import PaymentMethodForm from "../../components/payment/PaymentMethodForm";

export default function CreatePaymentMethodView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodFormData>({
    defaultValues: {
      name: "",
      description: "",
      currency: "",
      paymentMode: "",
      requiresReference: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPaymentMethod,
    onError: (error: any) => {
      toast.error(error.message || "Error al crear método de pago");
    },
    onSuccess: () => {
      toast.success("Método de pago creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      navigate("/payment-methods"); // Ajustado para volver a la lista correcta
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: PaymentMethodFormData) => {
    if (!data.name.trim()) {
      toast.error("El nombre del método es obligatorio");
      return;
    }
    if (!data.currency) {
      toast.error("La moneda es obligatoria");
      return;
    }
    if (!data.paymentMode) {
      toast.error("La modalidad de pago es obligatoria");
      return;
    }

    mutate(data);
  };

  return (
    <>
      {/* Header Fijo */}
      <div className="fixed top-14 lg:top-16 left-0 right-0 lg:left-64 z-30 bg-[var(--color-card)]/95 backdrop-blur-lg border-b border-[var(--color-border)] shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton */}
              <Link
                to="/payment-methods" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] transition-colors flex-shrink-0"
                title="Volver a métodos de pago"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-[var(--color-vet-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-vet-text)] truncate">
                      Nuevo Método de Pago
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Plus className="w-4 h-4 text-[var(--color-vet-muted)] flex-shrink-0" />
                      <span className="text-[var(--color-vet-primary)] font-semibold text-sm truncate">
                        Configurar nuevo método de pago
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[var(--color-vet-muted)] text-sm truncate">
                  Agrega un nuevo método de pago para usar en servicios y ventas
                </p>
              </div>
            </div>

            <div className="hidden sm:block flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center border-2 border-[var(--color-vet-primary)]/20">
                <CreditCard className="w-8 h-8 text-[var(--color-vet-primary)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-44 sm:h-48 lg:h-48"></div>

      {/* Formulario */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8 pb-10`}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--color-card)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Componente de Formulario */}
              <PaymentMethodForm 
                register={register} 
                errors={errors}
              />

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => navigate("/payment-methods")}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPending ? "Creando..." : "Crear Método"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}