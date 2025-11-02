// src/components/owners/OwnerForm.tsx
import React from "react";
import { User, Mail, MapPin } from "lucide-react";
import type { OwnerFormData } from "../../types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { WhatsAppPhoneInput } from "../WhatsAppPhoneInput";

type OwnerFormProps = {
  register: UseFormRegister<OwnerFormData>;
  errors: FieldErrors<OwnerFormData>;
  watch: (name: keyof OwnerFormData) => string | undefined;
  setValue: (name: keyof OwnerFormData, value: string) => void;
};

const OwnerForm: React.FC<OwnerFormProps> = ({ register, errors, watch, setValue }) => {
  return (
    <div className="space-y-6">
      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nombre completo */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Ingresa el nombre del propietario"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("name", {
                required: "El nombre del propietario es obligatorio",
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Teléfono (WhatsApp) */}
        <div>
          <WhatsAppPhoneInput
            value={watch("contact") || ""}
            onChange={(val) => setValue("contact", val)}
            error={errors.contact?.message}
            required={true}
          />
        </div>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correo electrónico */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de email inválido",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-2">
            Dirección
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="address"
              type="text"
              placeholder="Dirección completa"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("address")}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerForm;