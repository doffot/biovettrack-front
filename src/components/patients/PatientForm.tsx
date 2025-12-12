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
  Palette,
  MapPin
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
    <div className="space-y-6">
      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        
        {/* ===== COLUMNA 1: Información Básica ===== */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
            Información Básica
          </h3>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <PawPrint className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                placeholder="Ej: Luna, Max, Rocky..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...register("name", {
                  required: "El nombre es obligatorio",
                })}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-red-600 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          {/* Especie */}
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1.5">
              Especie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Bone className="w-4 h-4" />
              </div>
              <select
                id="species"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 appearance-none cursor-pointer ${
                  errors.species ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...register("species", {
                  required: "La especie es obligatoria",
                })}
              >
                <option value="">Seleccionar especie</option>
                <option value="Canino">🐕 Canino</option>
                <option value="Felino">🐈 Felino</option>
                <option value="Conejo">🐰 Conejo</option>
                <option value="Ave">🦜 Ave</option>
                <option value="Reptil">🦎 Reptil</option>
                <option value="Roedor">🐹 Roedor</option>
                <option value="Hurón">🦡 Hurón</option>
                <option value="Otro">📦 Otro</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.species && (
              <p className="mt-1.5 text-red-600 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.species.message}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1.5">
              Sexo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Heart className="w-4 h-4" />
              </div>
              <select
                id="sex"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 appearance-none cursor-pointer ${
                  errors.sex ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...register("sex", {
                  required: "El sexo es obligatorio",
                })}
              >
                <option value="">Seleccionar sexo</option>
                <option value="Macho">♂ Macho</option>
                <option value="Hembra">♀ Hembra</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.sex && (
              <p className="mt-1.5 text-red-600 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.sex.message}
              </p>
            )}
          </div>
        </div>

        {/* ===== COLUMNA 2: Características Físicas ===== */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
            Características Físicas
          </h3>

          {/* Raza */}
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1.5">
              Raza
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                id="breed"
                type="text"
                placeholder="Ej: Labrador, Siamés, Mestizo..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                {...register("breed")}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1.5">
              Color
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Palette className="w-4 h-4" />
              </div>
              <input
                id="color"
                type="text"
                placeholder="Ej: Negro, Blanco y marrón..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                {...register("color")}
              />
            </div>
          </div>

          {/* Peso */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1.5">
              Peso actual
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Scale className="w-4 h-4" />
              </div>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                {...register("weight", {
                  valueAsNumber: true,
                })}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* ===== COLUMNA 3: Información Adicional ===== */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
            Información Adicional
          </h3>

          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de nacimiento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <CalendarDays className="w-4 h-4" />
              </div>
              <input
                id="birthDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 ${
                  errors.birthDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
            </div>
            {ageText && (
              <p className="mt-1.5 text-xs text-gray-500">
                Edad actual: <span className="text-green-600 font-semibold">{ageText}</span>
              </p>
            )}
            {errors.birthDate && (
              <p className="mt-1.5 text-red-600 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.birthDate.message}
              </p>
            )}
          </div>

          {/* Señas/Marcas */}
          <div>
            <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-1.5">
              Señas o Marcas distintivas
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="identification"
                type="text"
                placeholder="Ej: Mancha en ojo izquierdo..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                {...register("identification")}
              />
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Foto de la mascota
            </label>
            <div className="flex items-center gap-3">
              {previewImage ? (
                <div className="relative group">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-xl object-cover border-2 border-green-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <PawPrint className="w-6 h-6 text-gray-300" />
                </div>
              )}
              
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-green-600">
                  <Upload className="w-4 h-4" />
                  <span>{previewImage ? 'Cambiar foto' : 'Subir foto'}</span>
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
            <p className="mt-1.5 text-xs text-gray-400">
              Opcional. Se usará una imagen por defecto si no se sube foto.
            </p>
          </div>
        </div>
      </div>

      {/* Campos ocultos para el veterinario (se guardan pero no se muestran) */}
      <input type="hidden" {...register("mainVet", { required: true })} />
      <input type="hidden" {...register("referringVet")} />
    </div>
  );
};

export default PatientForm;