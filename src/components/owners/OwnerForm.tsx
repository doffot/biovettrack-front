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
    // 
    // CAMBIO CLAVE: El contenedor principal ahora usa el fondo del sidebar.
    // Se le añade padding, borde y redondeo para que parezca una tarjeta.
    //
    <div 
      className="space-y-6 p-6 rounded-xl border border-border transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-vet-sidebar)' }}
    >
      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nombre completo */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-vet-text mb-2">
            Nombre completo <span className="text-vet-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-vet-muted" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Ingresa el nombre del propietario"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-transparent transition-all"
              {...register("name", {
                required: "El nombre del propietario es obligatorio",
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-vet-danger">{errors.name.message}</p>
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
          <label htmlFor="email" className="block text-sm font-medium text-vet-text mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-vet-muted" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-transparent transition-all"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de email inválido",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-vet-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-vet-text mb-2">
            Dirección
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-vet-muted" />
            </div>
            <input
              id="address"
              type="text"
              placeholder="Dirección completa"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-transparent transition-all"
              {...register("address")}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-vet-danger">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerForm;