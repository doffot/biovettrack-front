import React from "react";
import {
  Scissors,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  MessageSquare,
  ChevronDown,
  ClipboardCheck,
  BadgeCheck,
  Hash,
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { GroomingServiceFormData } from "../../types";
import type { PaymentMethod } from "../../types/payment";

type GroomingServiceFormProps = {
  register: UseFormRegister<GroomingServiceFormData>;
  errors: FieldErrors<GroomingServiceFormData>;
  paymentMethods?: PaymentMethod[];
  selectedPaymentMethod?: PaymentMethod;
};

const GroomingServiceForm: React.FC<GroomingServiceFormProps> = ({
  register,
  errors,
  paymentMethods = [],
  selectedPaymentMethod,
}) => {
  const formFields = [
    {
      name: "date" as keyof GroomingServiceFormData,
      label: "Fecha",
      placeholder: "Selecciona fecha",
      icon: Calendar,
      type: "date",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "service" as keyof GroomingServiceFormData,
      label: "Servicio",
      placeholder: "Tipo de servicio",
      icon: Scissors,
      type: "select",
      options: ["Corte", "Baño", "Corte y Baño"],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "cost" as keyof GroomingServiceFormData,
      label: "Costo Total",
      placeholder: "0.00",
      icon: DollarSign,
      type: "number",
      required: true,
      step: "0.01",
      colSpan: "md:col-span-1",
    },
    {
      name: "paymentMethod" as keyof GroomingServiceFormData,
      label: "Método de Pago",
      placeholder: "Selecciona método",
      icon: CreditCard,
      type: "select",
      options: paymentMethods,
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "paymentReference" as keyof GroomingServiceFormData,
      label: "Referencia de Pago",
      placeholder: "Número de referencia...",
      icon: Hash,
      type: "text",
      required: selectedPaymentMethod?.requiresReference || false,
      colSpan: "md:col-span-1",
      hidden: !selectedPaymentMethod?.requiresReference,
    },
    {
      name: "status" as keyof GroomingServiceFormData,
      label: "Estado del Servicio",
      placeholder: "Estado",
      icon: ClipboardCheck,
      type: "select",
      options: ["Programado", "En progreso", "Completado", "Cancelado"],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "paymentStatus" as keyof GroomingServiceFormData,
      label: "Estado del Pago",
      placeholder: "Estado del pago",
      icon: BadgeCheck,
      type: "select",
      options: ["Pendiente", "Pagado", "Parcial", "Cancelado"],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "amountPaid" as keyof GroomingServiceFormData,
      label: "Monto Pagado",
      placeholder: "0.00",
      icon: DollarSign,
      type: "number",
      required: true,
      step: "0.01",
      colSpan: "md:col-span-1",
    },
    {
      name: "specifications" as keyof GroomingServiceFormData,
      label: "Especificaciones",
      placeholder: "Detalles del servicio realizado...",
      icon: FileText,
      type: "textarea",
      required: true,
      colSpan: "col-span-full",
      rows: 2,
      maxLength: 300,
    },
    {
      name: "observations" as keyof GroomingServiceFormData,
      label: "Observaciones",
      placeholder: "Notas adicionales (opcional)...",
      icon: MessageSquare,
      type: "textarea",
      required: false,
      colSpan: "col-span-full",
      rows: 2,
      maxLength: 200,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Grid más compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {formFields.map((field) => {
          const Icon = field.icon;
          const error = errors[field.name];

          if (field.hidden) return null;

          const getFieldLabel = () => {
            if (field.name === "cost") {
              return `Costo Total ${selectedPaymentMethod ? `(${selectedPaymentMethod.currency})` : ''}`;
            }
            if (field.name === "amountPaid") {
              return `Monto Pagado ${selectedPaymentMethod ? `(${selectedPaymentMethod.currency})` : ''}`;
            }
            return field.label;
          };

          const fieldLabel = getFieldLabel();

          return (
            <div key={field.name} className={field.colSpan}>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Icon className="w-3.5 h-3.5 text-vet-primary" />
                  {fieldLabel}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      {...register(field.name, {
                        required: field.required
                          ? `${field.label} es requerido`
                          : false,
                      })}
                      className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                        error
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-gray-300 bg-white text-gray-700 hover:border-vet-primary focus:border-vet-primary"
                      } focus:outline-none focus:ring-1 focus:ring-vet-primary appearance-none cursor-pointer`}
                    >
                      <option value="" className="text-gray-400">
                        {field.placeholder}
                      </option>
                      {field.name === "paymentMethod"
                        ? (field.options as PaymentMethod[]).map((method) => (
                            <option key={method._id} value={method._id}>
                              {method.name} ({method.currency})
                            </option>
                          ))
                        : (field.options as string[]).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    rows={field.rows}
                    maxLength={field.maxLength}
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} es requerido`
                        : false,
                    })}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors resize-none ${
                      error
                        ? "border-red-300 bg-red-50 text-red-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-vet-primary focus:border-vet-primary"
                    } focus:outline-none focus:ring-1 focus:ring-vet-primary`}
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    step={field.step}
                    min="0"
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} es requerido`
                        : false,
                      valueAsNumber: field.type === "number",
                    })}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                      error
                        ? "border-red-300 bg-red-50 text-red-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-vet-primary focus:border-vet-primary"
                    } focus:outline-none focus:ring-1 focus:ring-vet-primary`}
                  />
                )}

                {error && (
                  <p className="text-red-600 text-xs font-medium">
                    {error.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información del método de pago seleccionado - más compacta */}
      {selectedPaymentMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
          <div className="flex items-center gap-1.5 text-xs text-blue-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="font-medium">Método:</span>
            <span>{selectedPaymentMethod.name}</span>
            <span className="text-blue-600">•</span>
            <span>{selectedPaymentMethod.currency}</span>
            <span className="text-blue-600">•</span>
            <span>{selectedPaymentMethod.paymentMode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroomingServiceForm;