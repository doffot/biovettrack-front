import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Award,
  Save,
  X,
  Edit3,
  Mail,
  IdCard,
} from "lucide-react";
import { estadosVenezuela, type UpdateProfileForm, type UserProfile } from "../../types";
import { updateProfile } from "../../api/AuthAPI";
import { toast } from "../Toast";

interface PersonalInfoFormProps {
  profile: UserProfile;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileForm>({
    defaultValues: {
      name: profile.name,
      lastName: profile.lastName,
      whatsapp: profile.whatsapp,
      estado: profile.estado,
      runsai: profile.runsai || "",
      msds: profile.msds || "",
      somevepa: profile.somevepa || "",
    },
  });

  // Reset form cuando cambia el perfil
  useEffect(() => {
    reset({
      name: profile.name,
      lastName: profile.lastName,
      whatsapp: profile.whatsapp,
      estado: profile.estado,
      runsai: profile.runsai || "",
      msds: profile.msds || "",
      somevepa: profile.somevepa || "",
    });
  }, [profile, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UpdateProfileForm) => {
    mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header con botón de editar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Datos Personales</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-vet-primary bg-vet-primary/10 rounded-lg hover:bg-vet-primary/20 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isDirty || isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-vet-primary rounded-lg hover:bg-vet-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      {/* Campos NO editables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
            <Mail className="w-3.5 h-3.5" />
            Correo Electrónico
          </label>
          <p className="text-sm font-medium text-gray-900">{profile.email}</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
            <IdCard className="w-3.5 h-3.5" />
            Cédula de Identidad
          </label>
          <p className="text-sm font-medium text-gray-900">{profile.ci}</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
            <Award className="w-3.5 h-3.5" />
            CMV
          </label>
          <p className="text-sm font-medium text-gray-900">{profile.cmv}</p>
        </div>
      </div>

      {/* Campos editables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            Nombre
          </label>
          <input
            type="text"
            disabled={!isEditing}
            {...register("name", {
              required: "El nombre es obligatorio",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 50, message: "Máximo 50 caracteres" },
            })}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-all
              ${
                isEditing
                  ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                  : "border-transparent bg-gray-50 text-gray-700"
              }
              ${errors.name ? "border-red-300 focus:border-red-500" : ""}
            `}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            Apellido
          </label>
          <input
            type="text"
            disabled={!isEditing}
            {...register("lastName", {
              required: "El apellido es obligatorio",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              maxLength: { value: 50, message: "Máximo 50 caracteres" },
            })}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-all
              ${
                isEditing
                  ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                  : "border-transparent bg-gray-50 text-gray-700"
              }
              ${errors.lastName ? "border-red-300 focus:border-red-500" : ""}
            `}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 text-gray-400" />
            WhatsApp
          </label>
          <input
            type="text"
            disabled={!isEditing}
            {...register("whatsapp", {
              required: "El WhatsApp es obligatorio",
              pattern: {
                value: /^\+?[1-9]\d{6,14}$/,
                message: "Formato inválido (ej: +584141234567)",
              },
            })}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-all
              ${
                isEditing
                  ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                  : "border-transparent bg-gray-50 text-gray-700"
              }
              ${errors.whatsapp ? "border-red-300 focus:border-red-500" : ""}
            `}
          />
          {errors.whatsapp && (
            <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            Estado
          </label>
          <select
            disabled={!isEditing}
            {...register("estado", {
              required: "El estado es obligatorio",
            })}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-all
              ${
                isEditing
                  ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                  : "border-transparent bg-gray-50 text-gray-700"
              }
              ${errors.estado ? "border-red-300 focus:border-red-500" : ""}
            `}
          >
            <option value="">Seleccionar estado</option>
            {estadosVenezuela.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          {errors.estado && (
            <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>
          )}
        </div>
      </div>

      {/* Credenciales opcionales */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Credenciales Adicionales (Opcionales)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* RUNSAI */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              RUNSAI
            </label>
            <input
              type="text"
              disabled={!isEditing}
              {...register("runsai", {
                maxLength: { value: 30, message: "Máximo 30 caracteres" },
              })}
              placeholder={isEditing ? "Ej: 12345" : "-"}
              className={`
                w-full px-4 py-2.5 rounded-xl border transition-all text-sm
                ${
                  isEditing
                    ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                    : "border-transparent bg-gray-50 text-gray-700"
                }
              `}
            />
          </div>

          {/* MSDS */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              MSDS
            </label>
            <input
              type="text"
              disabled={!isEditing}
              {...register("msds", {
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              })}
              placeholder={isEditing ? "Ej: MSDS-12345" : "-"}
              className={`
                w-full px-4 py-2.5 rounded-xl border transition-all text-sm
                ${
                  isEditing
                    ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                    : "border-transparent bg-gray-50 text-gray-700"
                }
              `}
            />
          </div>

          {/* SOMEVEPA */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              SOMEVEPA
            </label>
            <input
              type="text"
              disabled={!isEditing}
              {...register("somevepa", {
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              })}
              placeholder={isEditing ? "Ej: SV-12345" : "-"}
              className={`
                w-full px-4 py-2.5 rounded-xl border transition-all text-sm
                ${
                  isEditing
                    ? "border-gray-300 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20"
                    : "border-transparent bg-gray-50 text-gray-700"
                }
              `}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default PersonalInfoForm;