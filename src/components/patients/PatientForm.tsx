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
} from "lucide-react";
import type { PatientFormData } from "../../types";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

type PatientFormProps = {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  setValue: UseFormSetValue<PatientFormData>;
};

const PatientForm: React.FC<PatientFormProps> = ({ register, errors, setValue }) => {
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
    <div className="space-y-6">
      {/* Grid adaptable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nombre del paciente - Ocupa 2 columnas en desktop */}
        <div className="lg:col-span-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">
            Nombre del paciente <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${errors.name 
              ? 'bg-red-50 border-red-300' 
              : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
            }
          `}>
            <div className={`p-2 rounded-lg ${errors.name ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
              <PawPrint className="w-4 h-4" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Ej: Luna, Max, Rocky..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
              {...register("name", {
                required: "El nombre del paciente es obligatorio",
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Foto */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Foto
          </label>
          <div className="flex items-center gap-3">
            {previewImage ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-300">
                <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-vet-light">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
            )}
            
            <label className="flex-1 px-4 py-3 rounded-xl bg-vet-light border-2 border-gray-200 hover:border-vet-primary transition-all cursor-pointer flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
              <Upload className="w-4 h-4" />
              {previewImage ? 'Cambiar imagen' : 'Subir imagen'}
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

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-900 mb-3">
            Fecha de nacimiento <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${errors.birthDate 
              ? 'bg-red-50 border-red-300' 
              : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
            }
          `}>
            <div className={`p-2 rounded-lg ${errors.birthDate ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
              <CalendarDays className="w-4 h-4" />
            </div>
            <input
              id="birthDate"
              type="date"
              className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium"
              {...register("birthDate", {
                required: "La fecha de nacimiento es obligatoria",
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
            />
          </div>
          {ageText && (
            <p className="mt-2 text-xs text-gray-600">
              Edad: <span className="text-vet-primary font-semibold">{ageText}</span>
            </p>
          )}
          {errors.birthDate && (
            <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* Especie */}
        <div>
          <label htmlFor="species" className="block text-sm font-semibold text-gray-900 mb-3">
            Especie <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${errors.species 
              ? 'bg-red-50 border-red-300' 
              : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
            }
          `}>
            <div className={`p-2 rounded-lg ${errors.species ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
              <Bone className="w-4 h-4" />
            </div>
            <select
              id="species"
              className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium appearance-none cursor-pointer"
              {...register("species", {
                required: "La especie es obligatoria",
              })}
            >
              <option value="">Selecciona una especie</option>
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
            <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {errors.species.message}
            </p>
          )}
        </div>

        {/* Sexo */}
        <div>
          <label htmlFor="sex" className="block text-sm font-semibold text-gray-900 mb-3">
            Sexo <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${errors.sex 
              ? 'bg-red-50 border-red-300' 
              : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
            }
          `}>
            <div className={`p-2 rounded-lg ${errors.sex ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
              <Heart className="w-4 h-4" />
            </div>
            <select
              id="sex"
              className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium appearance-none cursor-pointer"
              {...register("sex", {
                required: "El sexo es obligatorio",
              })}
            >
              <option value="">Selecciona sexo</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          {errors.sex && (
            <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {errors.sex.message}
            </p>
          )}
        </div>

        {/* Raza */}
        <div>
          <label htmlFor="breed" className="block text-sm font-semibold text-gray-900 mb-3">
            Raza
          </label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Tag className="w-4 h-4" />
            </div>
            <input
              id="breed"
              type="text"
              placeholder="Ej: Labrador, Siamés, Mestizo..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
              {...register("breed")}
            />
          </div>
        </div>

        {/* Peso */}
        <div>
          <label htmlFor="weight" className="block text-sm font-semibold text-gray-900 mb-3">
            Peso actual
          </label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
            <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
              <Scale className="w-4 h-4" />
            </div>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
              {...register("weight", {
                valueAsNumber: true,
              })}
            />
            <span className="text-gray-500 text-sm font-medium">kg</span>
          </div>
        </div>
      </div>

      {/* Campo oculto mainVet */}
      <input type="hidden" {...register("mainVet", { required: true })} />

      {/* Veterinario referido */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Médico Veterinario
        </label>
        
        <div className="mb-4 p-4 bg-vet-light rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleVetSwitcherChange(!useCustomReferringVet)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
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
              <div className="flex-1 text-sm text-gray-700">
                <span className="text-vet-primary font-medium">→</span> M.V. <span className="capitalize font-medium">{vetmain?.name} {vetmain?.lastName}</span>
              </div>
            )}
          </div>
        </div>

        {useCustomReferringVet && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Ej: Dr. Carlos Ruiz, Dra. María López..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
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

      {/* Nota informativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-900 font-semibold mb-1">Información clínica</p>
            <p className="text-xs text-gray-600">
              Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios. 
              La información opcional mejora la precisión del diagnóstico y tratamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;