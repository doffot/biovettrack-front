// src/views/LoginView.tsx

import { useForm } from "react-hook-form";
import type { UserLoginForm } from "../../types";
import { login } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function LoginView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(
        "Acceso concedido",
        "Panel clínico de BioVetTrack listo para operar."
      );
      navigate("/dashboard");
    },
  });

  const handleLogin = (formData: UserLoginForm) => {
    mutate(formData);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo principal - Imagen completa */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
        }}
      />

      {/* Overlay - Más oscuro */}
      <div className="absolute inset-0 bg-slate-900/90"></div>

      {/* Registrarse - Esquina superior derecha */}
      <div className="absolute top-8 right-8 z-20">
        <Link
          to="/auth/register"
          className="text-white font-semibold px-6 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        >
          Registrarse
        </Link>
      </div>

      {/* Contenedor principal con dos columnas */}
      <div className="absolute inset-0 flex z-10">
        {/* Columna izquierda - Título grande y características */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-xl">
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              BioVetTrack
            </h1>
            <p className="text-3xl lg:text-4xl font-bold text-vet-accent drop-shadow-lg mb-8">
              Sistema integral veterinario
            </p>

            {/* Lista de características */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Gestión integral de pacientes
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Control de citas y servicios
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Reportes y estadísticas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo SVG centrado */}
            <div className="flex justify-center mb-8">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-48 w-auto drop-shadow-2xl"
              />
            </div>

            {/* Descripción */}
            <div className="mb-6 text-center">
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                Accede a tu panel de control veterinario para gestionar
                pacientes, citas y servicios.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                    <img
                      src="/vet_user.svg"
                      alt="User icon"
                      className="h-7 w-auto drop-shadow-2xl"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Email
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={`w-full pl-28 pr-4 py-3.5 bg-transparent border rounded-xl text-white placeholder-transparent font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      ${
                      errors.email
                        ? "border-red-400 focus:ring-0"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("email", {
                      required: "El correo es obligatorio",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Correo inválido",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                    <img
                      src="/vet_pass.svg"
                      alt="Password icon"
                      className="h-7 w-auto drop-shadow-2xl"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Contraseña
                    </span>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    className={`w-full pl-44 pr-12 py-3.5 bg-transparent border rounded-xl text-white placeholder-gray-300 font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      ${
                      errors.password
                        ? "border-red-400 focus:ring-0"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 6,
                        message: "Mínimo 6 caracteres",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center text-vet-muted hover:text-vet-accent transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Olvidaste tu contraseña - Debajo del campo de contraseña */}
              <div className="text-right">
                <Link
                  to="/auth/forgot-password"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors underline decoration-white/40 hover:decoration-white"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-vet-primary text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </div>
            </form>

            {/* Copyright */}
            <p className="text-center text-xs text-white/70 font-medium mt-6 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}