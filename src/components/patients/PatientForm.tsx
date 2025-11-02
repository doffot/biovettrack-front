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
      {/* Sección de imagen - visible solo en móvil */}
      <div className="lg:hidden">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Foto de la mascota
        </label>
        <div className="flex items-center gap-3">
          {previewImage ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-600">
              <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-700/30">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
          )}
          
          <label className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm text-gray-200">
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

      {/* Grid adaptable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nombre del paciente - Ocupa 2 columnas en desktop */}
        <div className="lg:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Nombre del paciente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PawPrint className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Ej: Luna, Max, Rocky..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("name", {
                required: "El nombre del paciente es obligatorio",
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Imagen en desktop - ocupa 1 columna */}
        <div className="hidden lg:block">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Foto
          </label>
          {previewImage ? (
            <div className="relative h-[50px] rounded-lg overflow-hidden border-2 border-gray-600">
              <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="h-[50px] rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-700/30 hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Subir</span>
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
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200 mb-2">
            Fecha de nacimiento <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarDays className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="birthDate"
              type="date"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <p className="mt-1 text-xs text-gray-400">
              Edad: <span className="text-blue-400 font-semibold">{ageText}</span>
            </p>
          )}
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-400">{errors.birthDate.message}</p>
          )}
        </div>

        {/* Especie */}
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-200 mb-2">
            Especie <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Bone className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="species"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
            <p className="mt-1 text-sm text-red-400">{errors.species.message}</p>
          )}
        </div>

        {/* Sexo */}
        <div>
          <label htmlFor="sex" className="block text-sm font-medium text-gray-200 mb-2">
            Sexo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Heart className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="sex"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
            <p className="mt-1 text-sm text-red-400">{errors.sex.message}</p>
          )}
        </div>

        {/* Raza */}
        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-200 mb-2">
            Raza
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="breed"
              type="text"
              placeholder="Ej: Labrador, Siamés, Mestizo..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("breed")}
            />
          </div>
        </div>

        {/* Peso */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-200 mb-2">
            Peso actual
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Scale className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("weight", {
                valueAsNumber: true,
              })}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campo oculto mainVet */}
      <input type="hidden" {...register("mainVet", { required: true })} />

      {/* Veterinario referido */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Médico Veterinario
        </label>
        
        <div className="mb-3 flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
          <button
            type="button"
            onClick={() => handleVetSwitcherChange(!useCustomReferringVet)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
              !useCustomReferringVet
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
            <div className="flex-1 text-sm text-gray-300">
              <span className="text-blue-400">→</span> M.V. <span className="capitalize">{vetmain?.name} {vetmain?.lastName}</span>
            </div>
          )}
        </div>

        {useCustomReferringVet && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Ej: Dr. Carlos Ruiz, Dra. María López..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              {...register("referringVet")}
            />
          </div>
        )}

        {!useCustomReferringVet && (
          <input
            type="hidden"
            {...register("referringVet")}
            value={`M.V. ${vetmain?.name}` || ""}
          />
        )}
      </div>

      {/* Nota informativa */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Heart className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-200 font-medium mb-1">Información clínica</p>
            <p className="text-xs text-gray-400">
              Los campos marcados con <span className="text-red-400 font-bold">*</span> son obligatorios. 
              La información opcional mejora la precisión del diagnóstico y tratamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;