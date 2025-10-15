// src/components/patients/PatientForm.tsx
import React, { useState } from "react";
import {
  PawPrint,
  Bone,
  Scale,
  Tag,
  CalendarDays,
  Heart,
  Upload,
  X,
  ChevronDown,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { PatientFormData } from "../../types";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { VET_ADMIN } from "../../config/vetConfig";

type PatientFormProps = {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  setValue: UseFormSetValue<PatientFormData>;
};

const PatientForm: React.FC<PatientFormProps> = ({ register, errors, setValue }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [useCustomReferringVet, setUseCustomReferringVet] = useState(false);

  // Default pet avatar (cute paw print design)


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar el cambio del switcher
  const handleVetSwitcherChange = (useCustom: boolean) => {
    setUseCustomReferringVet(useCustom);
    if (!useCustom) {
      // Si se desactiva el input personalizado, usar el vet admin por defecto
      setValue("referringVet", VET_ADMIN.name);
    } else {
      // Si se activa, limpiar el campo para que el usuario pueda escribir
      setValue("referringVet", "");
    }
  };

  // Calcular edad legible
  const [birthDate, setBirthDate] = useState<string>('');
  const [ageText, setAgeText] = useState<string>('');

  const calculateAge = (dateString: string) => {
    if (!dateString) {
      setAgeText('');
      return;
    }

    const today = new Date();
    const birthDate = new Date(dateString);
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    let text = '';

    if (years > 0) {
      text = `${years} año${years !== 1 ? 's' : ''}`;
      if (months > 0) {
        text += ` y ${months} mes${months !== 1 ? 'es' : ''}`;
      }
    } else if (months > 0) {
      text = `${months} mes${months !== 1 ? 'es' : ''}`;
      if (days > 0) {
        text += ` y ${days} día${days !== 1 ? 's' : ''}`;
      }
    } else {
      const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      text = `${totalDays} día${totalDays !== 1 ? 's' : ''}`;
    }

    setAgeText(text);
  };

  const formFields = [
    {
      name: "name" as keyof PatientFormData,
      label: "Nombre del paciente",
      placeholder: "Ej: Luna, Max, Rocky...",
      icon: PawPrint,
      type: "text",
      required: true,
      description: "Identificación del animal",
    },
    {
      name: "birthDate" as keyof PatientFormData,
      label: "Fecha de nacimiento",
      placeholder: "Selecciona una fecha",
      icon: CalendarDays,
      type: "date",
      required: true,
      description: "Para cálculo de edad y tratamientos",
    },
    {
      name: "species" as keyof PatientFormData,
      label: "Especie",
      placeholder: "Selecciona una especie",
      icon: Bone,
      type: "select",
      options: [
        "Canino",
        "Felino",
        "Conejo",
        "Ave",
        "Reptil",
        "Roedor",
        "Hurón",
        "Otro"
      ],
      required: true,
      description: "Clasificación taxonómica",
    },
    {
      name: "sex" as keyof PatientFormData,
      label: "Sexo",
      placeholder: "Selecciona sexo",
      icon: Heart,
      type: "select",
      options: ["Macho", "Hembra"],
      required: true,
      description: "Información biológica para tratamiento",
    },
    {
      name: "breed" as keyof PatientFormData,
      label: "Raza",
      placeholder: "Ej: Labrador, Siamés, Mestizo...",
      icon: Tag,
      type: "text",
      required: false,
      description: "Predisposiciones genéticas (opcional)",
    },
    {
      name: "weight" as keyof PatientFormData,
      label: "Peso actual",
      placeholder: "0.0",
      icon: Scale,
      type: "number",
      required: false,
      description: "Para dosificación de medicamentos (opcional)",
      suffix: "kg",
    },
    // ✅ NUEVO: mainVet (solo lectura)
    {
      name: "mainVet" as keyof PatientFormData,
      label: "Veterinario responsable",
      placeholder: VET_ADMIN.name,
      icon: User,
      type: "text",
      required: true,
      description: "Profesional que gestiona el caso",
      readonly: true,
    },
  ];

  // Componente para la sección de imagen
  const ImageUploadSection = ({ isCompact = false }: { isCompact?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-coral-pulse/5 via-coral-pulse/10 to-coral-pulse/5 rounded-xl border border-coral-pulse/20 ${isCompact ? 'h-full' : ''}`}>
      
      {/* Preview de imagen */}
      <div className="flex-shrink-0">
        {previewImage ? (
          <div className={`relative rounded-lg overflow-hidden border-2 border-coral-pulse/40 shadow-md ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}>
            <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className={`absolute -top-1 -right-1 bg-coral-pulse hover:bg-coral-pulse/80 text-white rounded-full flex items-center justify-center transition text-xs ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}>
              <X className={isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'} />
            </button>
          </div>
        ) : (
          <div className={`rounded-lg border border-dashed border-coral-pulse/30 flex items-center justify-center bg-coral-pulse/5 ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}>
            <Upload className={`text-coral-pulse/60 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </div>
        )}
      </div>

      {/* Botón de subida */}
      <label className={`flex-1 group relative inline-flex items-center justify-center gap-1.5 rounded-lg
                  bg-gradient-to-r from-coral-pulse/20 to-coral-pulse/30 text-misty-lilac font-medium
                  border border-coral-pulse/30 hover:border-coral-pulse/50
                  transition-all duration-300 cursor-pointer
                  hover:bg-gradient-to-r hover:from-coral-pulse/30 hover:to-coral-pulse/40 
                  ${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'}`}>

        <Upload className={isCompact ? 'w-3 h-3' : 'w-3 h-3'} />
        <span className="hidden sm:inline">{previewImage ? 'Cambiar' : 'Subir imagen'}</span>
        <span className="sm:hidden">Imagen</span>

        <input
          type="file"
          accept="image/*"
          {...register("photo", { required: false })}
          onChange={(e) => {
            register("photo").onChange(e);
            handleImageChange(e);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sección de imagen solo para mobile */}
      <div className="hidden">{birthDate}</div>
      <div className="tile-entrance lg:hidden" style={{ animationDelay: '0s' }}>
        <ImageUploadSection />
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {formFields.map((field, index) => {
          const Icon = field.icon;
          const error = errors[field.name];

          return (
            <div
              key={field.name}
              className={`tile-entrance ${field.name === 'name' ? 'lg:col-span-2' : field.name === 'species' ? 'lg:col-span-2' : ''}`}
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

              {/* Campo especial para el nombre con imagen al lado en desktop */}
              {field.name === 'name' ? (
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Input de nombre */}
                  <div className="flex-1">
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
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              {...register(field.name, {
                                required: field.required ? `${field.label} es requerido` : false,
                              })}
                              className="w-full bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm"
                            />
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
                  </div>

                  {/* Sección de imagen al lado del nombre (solo desktop) */}
                  <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                    <ImageUploadSection isCompact={true} />
                  </div>
                </div>
              ) : (
                /* Resto de campos normales */
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
                              className="w-full bg-transparent text-misty-lilac focus:outline-none text-sm appearance-none cursor-pointer pr-8
                                        custom-select"
                            >
                              <option value="" disabled>{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-coral-pulse pointer-events-none" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {field.type === "date" ? (
                              <input
                                type="date"
                                {...register(field.name, {
                                  required: `${field.label} es obligatoria`,
                                  validate: (value) => {
                                    if (!value) return "La fecha de nacimiento es obligatoria";
                                    const date = new Date(value);
                                    if (isNaN(date.getTime())) return "Fecha inválida";
                                    if (date > new Date()) return "La fecha no puede ser futura";
                                    return true;
                                  },
                                  onChange: (e) => {
                                    setBirthDate(e.target.value);
                                    calculateAge(e.target.value);
                                  },
                                })}
                                className="flex-1 bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm"
                              />
                            ) : (
                              <input
                                type={field.type}
                                placeholder={field.readonly ? field.placeholder : field.placeholder}
                                step={field.type === "number" ? "0.1" : undefined}
                                min={field.type === "number" ? "0" : undefined}
                                readOnly={field.readonly}
                                {...register(field.name, {
                                  required: field.required ? `${field.label} es requerido` : false,
                                  valueAsNumber: field.type === "number",
                                })}
                                className={`flex-1 bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm ${
                                  field.readonly ? 'cursor-not-allowed opacity-75' : ''
                                }`}
                              />
                            )}
                            {field.suffix && (
                              <span className="text-lavender-fog text-sm ml-2 font-medium">
                                {field.suffix}
                              </span>
                            )}
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
              )}

              {/* Mostrar edad calculada si es birthDate */}
              {field.name === "birthDate" && ageText && (
                <div className="mt-2 text-sm text-lavender-fog">
                  Edad: <span className="text-coral-pulse font-semibold">{ageText}</span>
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

        {/* ✅ NUEVO: Campo especial para veterinario referido con switcher */}
        <div className="lg:col-span-2 tile-entrance" style={{ animationDelay: `${formFields.length * 0.1}s` }}>
          {/* Field Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-coral-pulse" />
              <label className="text-misty-lilac font-semibold text-sm">
                Veterinario que ordena la hematología
              </label>
            </div>
            <p className="text-lavender-fog text-xs font-medium">Profesional que solicita los estudios</p>
          </div>

          {/* Switcher */}
          <div className="mb-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-coral-pulse/5 via-coral-pulse/10 to-coral-pulse/5 rounded-xl border border-coral-pulse/20">
              <button
                type="button"
                onClick={() => handleVetSwitcherChange(!useCustomReferringVet)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  !useCustomReferringVet
                    ? 'bg-coral-pulse/20 border border-coral-pulse/40 text-coral-pulse'
                    : 'bg-transparent border border-coral-pulse/20 text-lavender-fog hover:border-coral-pulse/30'
                }`}
              >
                {!useCustomReferringVet ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {!useCustomReferringVet ? 'Usar veterinario por defecto' : 'Ingresar veterinario personalizado'}
                </span>
              </button>
              
              {!useCustomReferringVet && (
                <div className="flex-1 text-sm text-misty-lilac font-medium">
                  <span className="text-coral-pulse">→</span> {VET_ADMIN.name}
                </div>
              )}
            </div>
          </div>

          {/* Input field - Solo visible si useCustomReferringVet está activo */}
          {useCustomReferringVet && (
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 rounded-2xl blur opacity-25 transition-opacity duration-300 group-hover:opacity-50 group-focus-within:opacity-75 bg-gradient-to-r from-coral-pulse/20 to-coral-pulse/30" />

              <div className="relative bg-space-navy/60 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 border-coral-pulse/20 hover:border-coral-pulse/40 focus-within:border-coral-pulse/50">
                <div className="flex items-center p-4">
                  {/* Icon */}
                  <div className="p-2 rounded-xl mr-4 transition-all duration-300 bg-coral-pulse/10 text-coral-pulse group-hover:bg-coral-pulse/15">
                    <User className="w-5 h-5" />
                  </div>

                  {/* Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Ej: Dr. Carlos Ruiz, Dra. María López..."
                      {...register("referringVet", {
                        required: false,
                      })}
                      className="w-full bg-transparent text-misty-lilac placeholder-lavender-fog focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Bottom Border Gradient */}
                <div className="h-px bg-gradient-to-r from-transparent via-coral-pulse/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Floating Indicator */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full transition-colors duration-300 bg-coral-pulse/40 group-hover:bg-coral-pulse/60 animate-pulse-soft" />
            </div>
          )}

          {/* Hidden input para cuando no se usa custom (garantiza que siempre tenga valor) */}
          {!useCustomReferringVet && (
            <input
              type="hidden"
              {...register("referringVet")}
              value={VET_ADMIN.name}
            />
          )}
        </div>
      </div>

      {/* Form Footer más compacto */}
      <div className="tile-entrance pt-4" style={{ animationDelay: `${(formFields.length + 1) * 0.1}s` }}>
        <div className="text-center p-4 bg-gradient-to-r from-coral-pulse/5 via-coral-pulse/10 to-coral-pulse/5 rounded-xl border border-coral-pulse/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-coral-pulse animate-pulse-soft" />
            <span className="text-misty-lilac font-semibold text-sm">
              Información clínica
            </span>
          </div>
          <p className="text-lavender-fog text-xs">
            Los campos marcados con <span className="text-coral-pulse font-bold">*</span> son obligatorios. 
            La información opcional mejora la precisión del diagnóstico y tratamiento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;