// src/components/grooming/groomingForm.tsx
import React from "react";
import {
  Scissors,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { GroomingServiceFormData, GroomerOption } from "../../types/grooming";

type GroomingServiceFormProps = {
  register: UseFormRegister<GroomingServiceFormData>;
  errors: FieldErrors<GroomingServiceFormData>;
  groomers?: GroomerOption[];
};

const GroomingServiceForm: React.FC<GroomingServiceFormProps> = ({
  register,
  errors,
  groomers = [],
}) => {
  const serviceFields = [
    {
      name: "date" as const,
      label: "Fecha",
      placeholder: "Selecciona fecha",
      icon: Calendar,
      type: "date",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "service" as const,
      label: "Servicio",
      placeholder: "Tipo de servicio",
      icon: Scissors,
      type: "select",
      options: ["Corte", "Baño", "Corte y Baño"],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "groomer" as const,
      label: "Peluquero",
      placeholder: "Selecciona peluquero",
      icon: User,
      type: "groomer-select",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "cost" as const,
      label: "Costo ($)",
      placeholder: "0.00",
      icon: DollarSign,
      type: "number",
      required: true,
      step: "0.01",
      colSpan: "md:col-span-1",
    },
  ];

  const textFields = [
    {
      name: "specifications" as const,
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
      name: "observations" as const,
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

  type FieldConfig = {
    name: keyof GroomingServiceFormData;
    label: string;
    placeholder: string;
    icon: React.FC<{ className?: string }>;
    type: string;
    required: boolean;
    colSpan: string;
    options?: string[];
    step?: string;
    rows?: number;
    maxLength?: number;
  };

  const renderField = (field: FieldConfig) => {
    const Icon = field.icon;
    const error = errors[field.name];

    if (field.type === "groomer-select") {
      return (
        <div key={field.name} className={field.colSpan}>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-muted">
              <Icon className="w-3.5 h-3.5 text-vet-accent" />
              {field.label}
              {field.required && <span className="text-red-400">*</span>}
            </label>
            <select
              {...register(field.name, {
                required: field.required ? `${field.label} es requerido` : false,
              })}
              className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                error
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-slate-700 bg-sky-soft text-vet-text hover:border-vet-primary focus:border-vet-primary"
              } focus:outline-none focus:ring-2 focus:ring-vet-primary/30 appearance-none`}
            >
              <option value="">{field.placeholder}</option>
              {groomers.map((groomer) => (
                <option key={groomer._id} value={groomer._id}>
                  {groomer.name} {groomer.lastName}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-red-400 text-xs font-medium">{error.message}</p>
            )}
          </div>
        </div>
      );
    }

    if (field.type === "select" && field.options && field.options.length > 0) {
      return (
        <div key={field.name} className={field.colSpan}>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-muted">
              <Icon className="w-3.5 h-3.5 text-vet-accent" />
              {field.label}
              {field.required && <span className="text-red-400">*</span>}
            </label>
            <select
              {...register(field.name, {
                required: field.required ? `${field.label} es requerido` : false,
              })}
              className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                error
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-slate-700 bg-sky-soft text-vet-text hover:border-vet-primary focus:border-vet-primary"
              } focus:outline-none focus:ring-2 focus:ring-vet-primary/30 appearance-none`}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-red-400 text-xs font-medium">{error.message}</p>
            )}
          </div>
        </div>
      );
    }

    if (field.type === "textarea" && field.rows) {
      return (
        <div key={field.name} className={field.colSpan}>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-muted">
              <Icon className="w-3.5 h-3.5 text-vet-accent" />
              {field.label}
              {field.required && <span className="text-red-400">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              rows={field.rows}
              maxLength={field.maxLength}
              {...register(field.name, {
                required: field.required ? `${field.label} es requerido` : false,
              })}
              className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors resize-none ${
                error
                  ? "border-red-500/50 bg-red-500/10 text-red-400 placeholder:text-red-400/50"
                  : "border-slate-700 bg-sky-soft text-vet-text placeholder:text-slate-500 hover:border-vet-primary focus:border-vet-primary"
              } focus:outline-none focus:ring-2 focus:ring-vet-primary/30`}
            />
            {error && (
              <p className="text-red-400 text-xs font-medium">{error.message}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={field.name} className={field.colSpan}>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-muted">
            <Icon className="w-3.5 h-3.5 text-vet-accent" />
            {field.label}
            {field.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            step={field.step}
            min={field.type === "number" ? "0" : undefined}
            {...register(field.name, {
              required: field.required ? `${field.label} es requerido` : false,
              valueAsNumber: field.type === "number",
            })}
            className={`w-full px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
              error
                ? "border-red-500/50 bg-red-500/10 text-red-400 placeholder:text-red-400/50"
                : "border-slate-700 bg-sky-soft text-vet-text placeholder:text-slate-500 hover:border-vet-primary focus:border-vet-primary"
            } focus:outline-none focus:ring-2 focus:ring-vet-primary/30`}
          />
          {error && (
            <p className="text-red-400 text-xs font-medium">{error.message}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-vet-text mb-3 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-vet-accent" />
          Información del Servicio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {serviceFields.map(renderField)}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-vet-text mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-vet-accent" />
          Detalles Adicionales
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {textFields.map(renderField)}
        </div>
      </div>
    </div>
  );
};

export default GroomingServiceForm;