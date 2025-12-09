// src/components/settings/StaffForm.tsx
import React from "react";
import {
  User,
  Phone,
  BadgeCheck,
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { StaffFormData } from "../../types/staff";

type StaffFormProps = {
  register: UseFormRegister<StaffFormData>;
  errors: FieldErrors<StaffFormData>;
};

const StaffForm: React.FC<StaffFormProps> = ({ register, errors }) => {
  const formFields = [
    {
      name: "name" as keyof StaffFormData,
      label: "Nombre",
      placeholder: "Nombre",
      icon: User,
      type: "text",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "lastName" as keyof StaffFormData,
      label: "Apellido",
      placeholder: "Apellido",
      icon: User,
      type: "text",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "role" as keyof StaffFormData,
      label: "Rol",
      placeholder: "Selecciona un rol",
      icon: BadgeCheck,
      type: "select",
      options: [
        { value: "veterinario", label: "Veterinario" },
        { value: "groomer", label: "Peluquero" },
        { value: "asistente", label: "Asistente" },
        { value: "recepcionista", label: "Recepcionista" },
      ],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      name: "phone" as keyof StaffFormData,
      label: "Teléfono",
      placeholder: "Número de WhatsApp",
      icon: Phone,
      type: "text",
      required: false,
      colSpan: "md:col-span-1",
    },
    {
      name: "active" as keyof StaffFormData,
      label: "Estado",
      placeholder: "Activo/Inactivo",
      type: "switch",
      required: false,
      colSpan: "md:col-span-1",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {formFields.map((field) => {
          const Icon = field.icon;
          const error = errors[field.name];

          if (field.type === "switch") {
            return (
              <div key={field.name} className={field.colSpan}>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("active")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vet-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vet-primary"></div>
                    </label>
                    <span className="text-sm text-gray-600">
                      {errors.active ? "Inactivo" : "Activo"}
                    </span>
                  </div>
                  {error && (
                    <p className="text-red-600 text-xs font-medium">
                      {error.message}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={field.name} className={field.colSpan}>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  {/* <Icon className="w-3.5 h-3.5 text-vet-primary" /> */}
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
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
                    } focus:outline-none focus:ring-1 focus:ring-vet-primary appearance-none`}
                  >
                    <option value="">{field.placeholder}</option>
                    {(field.options as { value: string; label: string }[]).map(
                      (opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} es requerido`
                        : false,
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
    </div>
  );
};

export default StaffForm;