import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ChangePasswordForm } from "../../types";
import { changePassword } from "../../api/AuthAPI";
import { toast } from "../Toast";

const SecurityForm: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password", "");

  // Validaciones de fortaleza de contraseña
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Débil";
    if (passwordStrength === 2) return "Regular";
    if (passwordStrength === 3) return "Buena";
    return "Fuerte";
  };

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-vet-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-vet-primary" />
          Cambiar Contraseña
        </h2>
        <p className="text-sm text-vet-muted mt-1">
          Asegúrate de usar una contraseña segura que no uses en otros sitios
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Contraseña actual */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-vet-text mb-2">
            <Lock className="w-4 h-4 text-vet-muted" />
            Contraseña Actual
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              {...register("currentPassword", {
                required: "La contraseña actual es obligatoria",
              })}
              className={`
                w-full px-4 py-3 pr-12 rounded-xl border transition-all
                border-slate-700 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 bg-slate-800 text-vet-text
                ${errors.currentPassword ? "border-red-700/50 focus:border-red-500" : ""}
              `}
              placeholder="Ingresa tu contraseña actual"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-vet-text"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-vet-text mb-2">
            <Lock className="w-4 h-4 text-vet-muted" />
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("password", {
                required: "La nueva contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
              })}
              className={`
                w-full px-4 py-3 pr-12 rounded-xl border transition-all
                border-slate-700 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 bg-slate-800 text-vet-text
                ${errors.password ? "border-red-700/50 focus:border-red-500" : ""}
              `}
              placeholder="Ingresa tu nueva contraseña"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-vet-text"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}

          {/* Indicador de fortaleza */}
          {password && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${getStrengthColor().replace("bg-", "text-")}`}>
                  {getStrengthText()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-1 ${
                    passwordChecks.minLength ? "text-green-400" : "text-vet-muted"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  8+ caracteres
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordChecks.hasUppercase ? "text-green-400" : "text-vet-muted"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Mayúscula
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordChecks.hasLowercase ? "text-green-400" : "text-vet-muted"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Minúscula
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordChecks.hasNumber ? "text-green-400" : "text-vet-muted"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Número
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar nueva contraseña */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-vet-text mb-2">
            <Lock className="w-4 h-4 text-vet-muted" />
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Debes confirmar la contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
              className={`
                w-full px-4 py-3 pr-12 rounded-xl border transition-all
                border-slate-700 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 bg-slate-800 text-vet-text
                ${errors.confirmPassword ? "border-red-700/50 focus:border-red-500" : ""}
              `}
              placeholder="Confirma tu nueva contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-vet-text"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Botón submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-vet-primary text-white font-medium rounded-xl hover:bg-vet-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Cambiar Contraseña
            </>
          )}
        </button>
      </form>

      {/* Link a recuperar contraseña */}
      <div className="pt-4 border-t border-slate-700 text-center">
        <p className="text-sm text-vet-muted">
          ¿Olvidaste tu contraseña actual?{" "}
          <Link
            to="/auth/forgot-password"
            className="text-vet-primary hover:text-vet-secondary font-medium"
          >
            Recuperar por email
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SecurityForm;