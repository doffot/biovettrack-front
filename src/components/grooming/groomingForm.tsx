// src/components/grooming/GroomingServiceForm.tsx
import React from "react";
import {
  Scissors,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  MessageSquare,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { GroomingServiceFormData } from "../../types";

type GroomingServiceFormProps = {
  register: UseFormRegister<GroomingServiceFormData>;
  errors: FieldErrors<GroomingServiceFormData>;
};

const GroomingServiceForm: React.FC<GroomingServiceFormProps> = ({ register, errors }) => {
  const formFields = [
    {
      name: "date" as keyof GroomingServiceFormData,
      label: "Fecha del Servicio",
      placeholder: "Selecciona una fecha",
      icon: Calendar,
      type: "date",
      required: true,
      description: "Fecha en que se realizó el servicio",
      colSpan: "lg:col-span-1",
    },
    {
      name: "service" as keyof GroomingServiceFormData,
      label: "Tipo de Servicio",
      placeholder: "Selecciona un servicio",
      icon: Scissors,
      type: "select",
      options: ["Corte", "Baño", "Corte y Baño"],
      required: true,
      description: "Servicio de estética realizado",
      colSpan: "lg:col-span-1",
    },
    {
      name: "specifications" as keyof GroomingServiceFormData,
      label: "Especificaciones",
      placeholder: "Ej: Baño con shampoo antipulgas, secado con aire frío...",
      icon: FileText,
      type: "textarea",
      required: true,
      description: "Detalles del servicio (máximo 300 caracteres)",
      colSpan: "lg:col-span-2",
      maxLength: 300,
      rows: 3,
    },
    {
      name: "cost" as keyof GroomingServiceFormData,
      label: "Costo",
      placeholder: "0.00",
      icon: DollarSign,
      type: "number",
      required: true,
      description: "Precio del servicio en USD",
      colSpan: "lg:col-span-1",
      prefix: "$",
      step: "0.01",
    },
    {
      name: "paymentType" as keyof GroomingServiceFormData,
      label: "Tipo de Pago",
      placeholder: "Selecciona método de pago",
      icon: CreditCard,
      type: "select",
      options: ["Efectivo", "Pago Movil", "Zelle", "Otro"],
      required: true,
      description: "Método de pago utilizado",
      colSpan: "lg:col-span-1",
    },
    {
      name: "exchangeRate" as keyof GroomingServiceFormData,
      label: "Tasa de Cambio",
      placeholder: "0.00",
      icon: TrendingUp,
      type: "number",
      required: false,
      description: "Para conversión a moneda local (opcional)",
      colSpan: "lg:col-span-1",
      step: "0.01",
    },
    {
      name: "observations" as keyof GroomingServiceFormData,
      label: "Observaciones",
      placeholder: "Comportamiento del paciente, estado del pelaje, reacciones, recomendaciones, etc.",
      icon: MessageSquare,
      type: "textarea",
      required: false,
      description: "Notas adicionales sobre el servicio (opcional)",
      colSpan: "lg:col-span-2",
      rows: 4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {formFields.map((field, index) => {
          const Icon = field.icon;
          const error = errors[field.name];

          return (
            <div
              key={field.name}
              className={`tile-entrance ${field.colSpan || ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Field Header */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-coral-pulse" />
                  <label className="text-misty-lilac font-semibold text-sm">
                    {field.label}
                    {field.required && <span className="text-coral-pulse ml-1">*</span>}
                  </label>
                </div>
                <p className="text-lavender-fog text-xs font-medium">{field.description}</p>
              </div>

              {/* Field Input */}
              <div className="relative group">
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 rounded-2xl blur opacity-25 transition-opacity duration-300 group-hover:opacity-50 group-focus-within:opacity-75 ${
                  error
                    ? "bg-gradient-to-r from-coral-pulse/40 to-coral-pulse/60"
                    : "bg-gradient-to-r from-coral-pulse/20 to-coral-pulse/30"
                }`} />

                <div className={`relative bg-space-navy/60 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 ${
                  error
                    ? "border-coral-pulse/50 shadow-[0_0_20px_rgba(255,94,91,0.3)]"
                    : "border-coral-pulse/20 hover:border-coral-pulse/40 focus-within:border-coral-pulse/50"
                }`}>

                  <div className="flex items-center p-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-xl mr-4 transition-all duration-300 ${
                      error
                        ? "bg-coral-pulse/20 text-coral-pulse"
                        : "bg-coral-pulse/10 text-coral-pulse group-hover:bg-coral-pulse/15"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <div className="flex-1">
                      {field.type === "select" ? (
                        <div className="relative">
                        <select
                            {...register(field.name, {
                              required: field.required ? `${field.label} es requerido` : false,
                            })}
                            className="w-full bg-transparent text-misty-lilac focus:outline-none text-sm appearance-none cursor-pointer pr-8"
                          >
                            <option value="" disabled className="bg-space-navy text-lavender-fog">
                              {field.placeholder}
                            </option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt} className="bg-space-navy text-misty-lilac">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-coral-pulse pointer-events-none" />
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder}
                          rows={field.rows || 3}
                          maxLength={field.maxLength}
                          {...register(field.name, {
                            required: field.required ? `${field.label} es requerido` : false,
                            maxLength: field.maxLength ? {
                              value: field.maxLength,
                              message: `Máximo ${field.maxLength} caracteres`
                            } : undefined,
                          })}
                          className="w-full bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm resize-none"
                        />
                      ) : (
                        <div className="flex items-center">
                          {field.prefix && (
                            <span className="text-coral-pulse font-bold text-lg mr-2">
                              {field.prefix}
                            </span>
                          )}
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            step={field.step}
                            min={field.type === "number" ? "0" : undefined}
                            {...register(field.name, {
                              required: field.required ? `${field.label} es requerido` : false,
                              valueAsNumber: field.type === "number",
                              min: field.type === "number" ? {
                                value: 0.01,
                                message: `${field.label} debe ser mayor a 0`
                              } : undefined,
                            })}
                            className="flex-1 bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Border Gradient */}
                  <div className={`h-px bg-gradient-to-r from-transparent via-coral-pulse/30 to-transparent ${
                    error ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                  } transition-opacity duration-300`} />
                </div>

                {/* Floating Indicator */}
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-colors duration-300 ${
                  error
                    ? "bg-coral-pulse animate-pulse"
                    : "bg-coral-pulse/40 group-hover:bg-coral-pulse/60 animate-pulse-soft"
                }`} />
              </div>

              {/* Character Counter for textarea */}
              {field.type === "textarea" && field.maxLength && !error && (
                <div className="mt-2 text-right">
                  <span className="text-xs text-lavender-fog/60">
                    Máximo {field.maxLength} caracteres
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-coral-pulse/10 border border-coral-pulse/20 rounded-xl">
                  <div className="w-2 h-2 bg-coral-pulse rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-coral-pulse text-sm font-medium">{error.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Footer */}
      <div className="tile-entrance pt-4" style={{ animationDelay: `${formFields.length * 0.1}s` }}>
        <div className="text-center p-4 bg-gradient-to-r from-coral-pulse/5 via-coral-pulse/10 to-coral-pulse/5 rounded-xl border border-coral-pulse/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Scissors className="w-4 h-4 text-coral-pulse animate-pulse-soft" />
            <span className="text-misty-lilac font-semibold text-sm">
              Registro de Servicio
            </span>
          </div>
          <p className="text-lavender-fog text-xs">
            Los campos marcados con <span className="text-coral-pulse font-bold">*</span> son obligatorios. 
            Completa toda la información para un registro preciso del servicio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroomingServiceForm;