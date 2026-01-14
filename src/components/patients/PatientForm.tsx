// src/components/patients/PatientForm.tsx
import React, { useState } from "react";
import {
  CalendarDays,
  Upload,
  X
} from "lucide-react";
import type { PatientFormData } from "../../types";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

type PatientFormProps = {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  setValue: UseFormSetValue<PatientFormData>;
};

const PatientForm: React.FC<PatientFormProps> = ({ 
  register, 
  errors, 
  setValue
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ageText, setAgeText] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setValue("photo", undefined);
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) {
      setAgeText('');
      return;
    }

    const today = new Date();
    const birthDate = new Date(dateString);
    
    if (birthDate > today) {
      setAgeText('');
      return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    let text = '';
    if (years > 0) {
      text = `${years} año${years !== 1 ? 's' : ''}`;
      if (months > 0) {
        text += ` y ${months} mes${months !== 1 ? 'es' : ''}`;
      }
    } else if (months > 0) {
      text = `${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      text = `${Math.max(0, totalDays)} día${totalDays !== 1 ? 's' : ''}`;
    }

    setAgeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        
        {/* ===== COLUMNA 1: Información Básica ===== */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-vet-muted uppercase tracking-wider">
            Información Básica
          </h3>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-vet-text mb-2">
              Nombre del paciente <span className="text-vet-danger">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nombre de la mascota"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted/60 ${
                errors.name ? 'border-vet-danger/50 bg-red-50/30' : 'border-gray-200 hover:border-vet-primary/30'
              }`}
              {...register("name", {
                required: "El nombre es obligatorio",
              })}
            />
            {errors.name && (
              <p className="mt-2 text-vet-danger text-xs font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Especie */}
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-vet-text mb-2">
              Especie <span className="text-vet-danger">*</span>
            </label>
            <select
              id="species"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text appearance-none cursor-pointer ${
                errors.species ? 'border-vet-danger/50 bg-red-50/30' : 'border-gray-200 hover:border-vet-primary/30'
              }`}
              {...register("species", {
                required: "La especie es obligatoria",
              })}
            >
              <option value="">Seleccionar especie</option>
              <option value="Canino">Canino</option>
              <option value="Felino">Felino</option>
              <option value="Conejo">Conejo</option>
              <option value="Ave">Ave</option>
              <option value="Reptil">Reptil</option>
              <option value="Roedor">Roedor</option>
              <option value="Hurón">Hurón</option>
              <option value="Otro">Otro</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-vet-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.species && (
              <p className="mt-2 text-vet-danger text-xs font-medium">
                {errors.species.message}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-vet-text mb-2">
              Sexo <span className="text-vet-danger">*</span>
            </label>
            <select
              id="sex"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text appearance-none cursor-pointer ${
                errors.sex ? 'border-vet-danger/50 bg-red-50/30' : 'border-gray-200 hover:border-vet-primary/30'
              }`}
              {...register("sex", {
                required: "El sexo es obligatorio",
              })}
            >
              <option value="">Seleccionar sexo</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-vet-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.sex && (
              <p className="mt-2 text-vet-danger text-xs font-medium">
                {errors.sex.message}
              </p>
            )}
          </div>
        </div>

        {/* ===== COLUMNA 2: Características Físicas ===== */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-vet-muted uppercase tracking-wider">
            Características Físicas
          </h3>

          {/* Raza */}
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-vet-text mb-2">
              Raza
            </label>
            <input
              id="breed"
              type="text"
              placeholder="Raza o mestizo"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-vet-primary/30 focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted/60"
              {...register("breed")}
            />
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-vet-text mb-2">
              Color o patrón
            </label>
            <input
              id="color"
              type="text"
              placeholder="Descripción del color"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-vet-primary/30 focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted/60"
              {...register("color")}
            />
          </div>

          {/* Peso */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-vet-text mb-2">
              Peso actual
            </label>
            <div className="relative">
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl hover:border-vet-primary/30 focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted/60"
                {...register("weight", {
                  valueAsNumber: true,
                })}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-vet-muted text-sm font-medium">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* ===== COLUMNA 3: Información Adicional ===== */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-vet-muted uppercase tracking-wider">
            Información Adicional
          </h3>

          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-vet-text mb-2">
              Fecha de nacimiento <span className="text-vet-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="birthDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text ${
                  errors.birthDate ? 'border-vet-danger/50 bg-red-50/30' : 'border-gray-200 hover:border-vet-primary/30'
                }`}
                {...register("birthDate", {
                  required: "La fecha es obligatoria",
                  validate: (value) => {
                    if (!value) return "La fecha es obligatoria";
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return "Fecha inválida";
                    if (date > new Date()) return "No puede ser una fecha futura";
                    return true;
                  },
                  onChange: (e) => {
                    calculateAge(e.target.value);
                  },
                })}
              />
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vet-muted w-5 h-5" />
            </div>
            {ageText && (
              <p className="mt-2 text-sm text-vet-muted">
                Edad actual: <span className="text-vet-primary font-semibold">{ageText}</span>
              </p>
            )}
            {errors.birthDate && (
              <p className="mt-2 text-vet-danger text-xs font-medium">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          {/* Señas/Marcas */}
          <div>
            <label htmlFor="identification" className="block text-sm font-medium text-vet-text mb-2">
              Señas particulares
            </label>
            <input
              id="identification"
              type="text"
              placeholder="Marcas distintivas o características especiales"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-vet-primary/30 focus:ring-2 focus:ring-vet-accent/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted/60"
              {...register("identification")}
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-vet-text mb-2">
              Fotografía
            </label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <div className="relative group">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-xl object-cover border-2 border-vet-accent/30 shadow-soft"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-vet-danger hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-vet-primary/30 flex items-center justify-center bg-vet-light/30">
                  <div className="text-center text-vet-muted/50 text-xs">
                    Sin foto
                  </div>
                </div>
              )}
              
              <label className="flex-1 cursor-pointer">
                <div className="px-6 py-3 rounded-xl border-2 border-dashed border-vet-primary/30 hover:border-vet-primary hover:bg-vet-light/50 transition-all flex items-center justify-center gap-2 text-sm text-vet-muted hover:text-vet-primary">
                  <Upload className="w-4 h-4" />
                  <span>{previewImage ? 'Cambiar fotografía' : 'Cargar fotografía'}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("photo")}
                  onChange={(e) => {
                    register("photo").onChange(e);
                    handleImageChange(e);
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-vet-muted">
              Opcional. Se asignará una imagen predeterminada si no se proporciona.
            </p>
          </div>
        </div>
      </div>

      {/* Campos ocultos para el veterinario */}
      <input type="hidden" {...register("mainVet", { required: true })} />
      <input type="hidden" {...register("referringVet")} />
    </div>
  );
};

export default PatientForm;