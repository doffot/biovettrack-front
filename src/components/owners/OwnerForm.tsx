import React from "react";

import { User, Phone, Mail, MapPin } from "lucide-react";
import type { OwnerFormData } from "../../types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

type OwnerFormProps = {
  register: UseFormRegister<OwnerFormData>;
  errors: FieldErrors<OwnerFormData>;
};

const OwnerForm: React.FC<OwnerFormProps> = ({ register, errors }) => {
  const formFields = [
    {
      name: "name" as keyof OwnerFormData,
      label: "Nombre completo",
      placeholder: "Ingresa el nombre del propietario",
      icon: User,
      type: "text",
      required: true,
    },
    {
      name: "contact" as keyof OwnerFormData,
      label: "Teléfono",
      placeholder: "Número de contacto",
      icon: Phone,
      type: "tel",
      required: true,
    },
    {
      name: "email" as keyof OwnerFormData,
      label: "Correo electrónico",
      placeholder: "ejemplo@correo.com",
      icon: Mail,
      type: "email",
      required: false,
    },
    {
      name: "address" as keyof OwnerFormData,
      label: "Dirección",
      placeholder: "Dirección completa",
      icon: MapPin,
      type: "text",
      required: false,
    },
  ];

  return (
    <div className="space-y-6">
      {formFields.map((field, index) => {
        const Icon = field.icon;
        const error = errors[field.name];
        
        return (
          <div 
            key={field.name}
            className="tile-entrance"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <label className="block text-text font-semibold mb-3 text-sm">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            
            <div className="relative group">
              <div className={`
                relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm transition-all duration-300
                ${error 
                  ? 'bg-danger/10 border-danger/30 shadow-[0_0_20px_rgba(255,94,91,0.2)]' 
                  : 'bg-background/40 border-muted/20 hover:border-primary/30 focus-within:border-primary/50'
                }
              `}>
                {/* Efecto shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center p-4">
                  <div className={`p-2 rounded-xl bg-black/20 mr-3 transition-colors duration-300 ${
                    error ? 'text-danger' : 'text-primary group-hover:text-primary'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(field.name, {
                      required: field.required ? `${field.label} es requerido` : false,
                      pattern: field.type === "email" ? {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Formato de email inválido"
                      } : undefined
                    })}
                    className="flex-1 bg-transparent text-text placeholder-muted focus:outline-none text-sm"
                  />
                </div>

                {/* Líneas decorativas */}
                <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent opacity-60 transition-colors duration-300 ${
                  error ? 'via-danger/50' : 'via-primary/50'
                }`} />
                <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent transition-colors duration-300 ${
                  error ? 'via-danger/30' : 'via-primary/30'
                }`} />
              </div>

              {/* Decoración de esquina */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-neon-pulse opacity-60 transition-colors duration-300 ${
                error ? 'bg-danger' : 'bg-primary'
              }`} />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-2 flex items-center gap-2 text-danger text-xs">
                <div className="w-1 h-1 bg-danger rounded-full animate-neon-pulse" />
                {error.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OwnerForm;