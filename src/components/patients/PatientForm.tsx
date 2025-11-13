// src/components/patients/PatientForm.tsx
import React, { useState, useEffect } from "react";
import {
  PawPrint,
  Bone,
  Scale,
  Tag,
  CalendarDays,
  Heart,
  Upload,
  X,
  User,
  ToggleLeft,
  ToggleRight,
  Palette,
  MapPin
} from "lucide-react";
import type { PatientFormData } from "../../types";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

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
  const [useCustomReferringVet, setUseCustomReferringVet] = useState(false);
  const [, setBirthDate] = useState<string>('');
  const [ageText, setAgeText] = useState<string>('');

  const { data: vetmain } = useAuth();

  useEffect(() => {
    if (vetmain?.name) {
      const formattedName = `M.V. ${vetmain.name.charAt(0).toUpperCase()}${vetmain.name.slice(1).toLowerCase()}`;
      setValue("mainVet", formattedName);
    }
  }, [vetmain, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVetSwitcherChange = (useCustom: boolean) => {
    setUseCustomReferringVet(useCustom);
    if (!useCustom) {
      const fullName = `${vetmain?.name || ""} ${vetmain?.lastName || ""}`.trim();
      setValue("referringVet", fullName);
    } else {
      setValue("referringVet", "");
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Grid usando todo el ancho disponible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Columna 1: Información Básica */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-vet-text mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <PawPrint className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                placeholder="Ej: Luna, Max, Rocky..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
                {...register("name", {
                  required: "El nombre es obligatorio",
                })}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-red-600 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Especie */}
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-vet-text mb-1">
              Especie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <Bone className="w-4 h-4" />
              </div>
              <select
                id="species"
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text appearance-none cursor-pointer text-sm"
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
            </div>
            {errors.species && (
              <p className="mt-1 text-red-600 text-xs">
                {errors.species.message}
              </p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-vet-text mb-1">
              Sexo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <Heart className="w-4 h-4" />
              </div>
              <select
                id="sex"
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text appearance-none cursor-pointer text-sm"
                {...register("sex", {
                  required: "El sexo es obligatorio",
                })}
              >
                <option value="">Seleccionar sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            {errors.sex && (
              <p className="mt-1 text-red-600 text-xs">
                {errors.sex.message}
              </p>
            )}
          </div>
        </div>

        {/* Columna 2: Información Física */}
        <div className="space-y-4">
          {/* Raza */}
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-vet-text mb-1">
              Raza
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <Tag className="w-4 h-4" />
              </div>
              <input
                id="breed"
                type="text"
                placeholder="Ej: Labrador, Siamés..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
                {...register("breed")}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-vet-text mb-1">
              Color
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <Palette className="w-4 h-4" />
              </div>
              <input
                id="color"
                type="text"
                placeholder="Ej: Negro, Blanco y marrón..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
                {...register("color")}
              />
            </div>
          </div>

          {/* Peso */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-vet-text mb-1">
              Peso actual
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <Scale className="w-4 h-4" />
              </div>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className="w-full pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
                {...register("weight", {
                  valueAsNumber: true,
                })}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-vet-muted text-xs font-medium">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Columna 3: Información Adicional */}
        <div className="space-y-4">
          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-vet-text mb-1">
              Fecha de nacimiento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <CalendarDays className="w-4 h-4" />
              </div>
              <input
                id="birthDate"
                type="date"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text text-sm"
                {...register("birthDate", {
                  required: "La fecha es obligatoria",
                  validate: (value) => {
                    if (!value) return "La fecha es obligatoria";
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return "Fecha inválida";
                    if (date > new Date()) return "No puede ser futura";
                    return true;
                  },
                  onChange: (e) => {
                    setBirthDate(e.target.value);
                    calculateAge(e.target.value);
                  },
                })}
              />
            </div>
            {ageText && (
              <p className="mt-1 text-xs text-vet-muted">
                Edad: <span className="text-vet-primary font-medium">{ageText}</span>
              </p>
            )}
            {errors.birthDate && (
              <p className="mt-1 text-red-600 text-xs">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          {/* Señas/Marcas */}
          <div>
            <label htmlFor="identification" className="block text-sm font-medium text-vet-text mb-1">
              Señas o Marcas
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="identification"
                type="text"
                placeholder="Ej: Mancha en el ojo..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
                {...register("identification")}
              />
            </div>
          </div>

          {/* Foto compacta */}
          <div>
            <label className="block text-sm font-medium text-vet-text mb-1">
              Foto
            </label>
            <div className="flex items-center gap-2">
              {previewImage ? (
                <div className="relative w-12 h-12 rounded border border-gray-300 overflow-hidden">
                  <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center transition-all"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              )}
              
              <label className="flex-1 px-3 py-2 rounded border border-gray-300 hover:border-vet-primary transition-all cursor-pointer flex items-center justify-center gap-1 text-xs text-vet-muted font-medium">
                <Upload className="w-3 h-3" />
                {previewImage ? 'Cambiar' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/*"
                  {...register("photo", { required: false })}
                  onChange={(e) => {
                    register("photo").onChange(e);
                    handleImageChange(e);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Veterinario - Ocupa todo el ancho */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-vet-text mb-2">
          Médico Veterinario
        </label>
        
        <div className="flex items-center gap-3 p-3 bg-vet-light rounded-lg">
          <button
            type="button"
            onClick={() => handleVetSwitcherChange(!useCustomReferringVet)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${
              !useCustomReferringVet
                ? 'bg-vet-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {!useCustomReferringVet ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {!useCustomReferringVet ? 'Por defecto' : 'Personalizado'}
          </button>
          
          {!useCustomReferringVet && (
            <div className="flex-1 text-sm text-vet-muted">
              <span className="text-vet-primary font-medium">→</span> M.V. <span className="capitalize font-medium">{vetmain?.name} {vetmain?.lastName}</span>
            </div>
          )}
        </div>

        {useCustomReferringVet && (
          <div className="relative mt-2">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-vet-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Ej: Dr. Carlos Ruiz, Dra. María López..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all bg-white text-vet-text placeholder-vet-muted text-sm"
              {...register("referringVet")}
            />
          </div>
        )}

        {!useCustomReferringVet && (
          <input
            type="hidden"
            {...register("referringVet")}
            value={`M.V. ${vetmain?.name} ${vetmain?.lastName}`.trim() || ""}
          />
        )}
      </div>

      {/* Campo oculto mainVet */}
      <input type="hidden" {...register("mainVet", { required: true })} />
    </div>
  );
};

export default PatientForm;