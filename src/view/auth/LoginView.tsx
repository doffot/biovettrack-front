import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import type { UserLoginForm } from "../../types";
import { login } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, User } from "lucide-react";
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
      toast.success('Acceso concedido', 'Panel clínico de BioVetTrack listo para operar.');
      navigate("/dashboard");
    },
  });

  const handleLogin = (formData: UserLoginForm) => {
    mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 lg:p-8">
      {/* Container responsive */}
      <div className="w-full max-w-md lg:max-w-6xl">
        
        {/* Desktop: Two column layout */}
        <div className="lg:flex lg:bg-white lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-100 lg:overflow-hidden">
          
          {/* Left Panel - Solo visible en Desktop */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-vet-primary to-vet-secondary p-12 flex-col justify-center relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <Logo
                  size="xl"
                  showText={true}
                  showSubtitle={true}
                  layout="vertical"
                  textClassName="text-white"
                  subtitleClassName="text-white/80"
                />
              </div>

              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white leading-tight">
                  Bienvenido de vuelta
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Accede a tu panel de control veterinario para gestionar
                  pacientes, citas y servicios.
                </p>

                {/* Features List */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center gap-3 text-white/90">
                    <User className="h-5 w-5" />
                    <span className="text-sm">Gestión integral de pacientes</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Control de citas y servicios</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm">Reportes y estadísticas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel / Mobile Panel - El formulario ÚNICO */}
          <div className="lg:w-1/2 lg:p-12 lg:flex lg:items-center lg:justify-center">
            <div className="w-full lg:max-w-sm">
              
              {/* Header Mobile - Solo visible en mobile/tablet */}
              <div className="text-center mb-8 lg:hidden">
                <Logo
                  size="xl"
                  showText={true}
                  showSubtitle={true}
                  layout="vertical"
                />
                <div className="mt-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Bienvenido de vuelta
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Accede a tu panel de control veterinario
                  </p>
                </div>
              </div>

              {/* Header Desktop - Solo visible en desktop */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">
                  Ingresa tus credenciales para acceder al sistema
                </p>
              </div>

              {/* Form Card - Mobile tiene estilos de card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                
                {/* ✅ FORMULARIO ÚNICO */}
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-5 lg:space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                          errors.email
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary"
                        }`}
                        {...register("email", {
                          required: "El correo electrónico es obligatorio",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Correo electrónico no válido",
                          },
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Tu contraseña"
                        className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                          errors.password
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary"
                        }`}
                        {...register("password", {
                          required: "La contraseña es obligatoria",
                          minLength: {
                            value: 6,
                            message: "La contraseña debe tener al menos 6 caracteres",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm font-medium">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-vet-primary hover:text-vet-secondary font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-vet-primary text-white font-medium py-3.5 rounded-lg hover:bg-vet-secondary focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center lg:mt-8">
                  <p className="text-gray-600 text-sm">
                    ¿No tienes cuenta?{" "}
                    <Link
                      to="/auth/register"
                      className="text-vet-primary hover:text-vet-secondary font-medium transition-colors"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>

              {/* Security Notice - Solo Mobile */}
              <div className="mt-6 p-4 bg-vet-light rounded-lg border border-vet-primary/20 lg:hidden">
                <div className="flex items-center justify-center gap-2 text-vet-primary text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Tus datos están protegidos con encriptación</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}