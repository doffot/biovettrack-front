import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import type { UserLoginForm } from "../../types";
import { login } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

export default function LoginView() {
  const initialValues = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const navigate = useNavigate();


  const { mutate } = useMutation({
    mutationFn: login,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Iniciando sesión...");
      navigate("/");
    },
  });

  const handleLogin = (formData: UserLoginForm) => mutate(formData);

  return (
    <div className="min-h-screen bg-[#0b132b] flex">
      {/* Left Panel - Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0b132b] via-[#172554] to-[#1e293b] items-center justify-center p-12">
        <div className="max-w-md">
          <Logo
            size="xl"
            showText={true}
            showSubtitle={false}
            layout="vertical"
          />
          <p className="mt-8 text-[#8a7f9e] text-lg leading-relaxed">
            Sistema profesional de gestión diseñado para optimizar tus procesos
            de trabajo.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo
              size="lg"
              showText={true}
              showSubtitle={false}
              layout="vertical"
            />
          </div>

          <div className="bg-[#0b132b] border border-[#8a7f9e]/20 rounded-2xl p-8 shadow-xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#e7e5f2] mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-[#8a7f9e]">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#e7e5f2] uppercase tracking-wide"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 bg-[#0b132b] border-2 border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:border-[#39ff14] focus:outline-none transition-colors duration-200"
                  {...register("email", {
                    required: "El Email es obligatorio",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "E-mail no válido",
                    },
                  })}
                />

                <div className="h-5">
                  {errors.email && (
                    <p className="text-[#ff5e5b] text-sm font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#e7e5f2] uppercase tracking-wide"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  className="w-full px-4 py-3 bg-[#0b132b] border-2 border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:border-[#39ff14] focus:outline-none transition-colors duration-200"
                  {...register("password", {
                    required: "El Password es obligatorio",
                  })}
                />

                <div className="h-5">
                  {errors.password && (
                    <p className="text-[#ff5e5b] text-sm font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-[#39ff14] hover:text-[#39ff14]/80 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit(handleLogin)}
                type="button"
                className="w-full bg-[#39ff14] hover:bg-[#39ff14]/90 text-[#0b132b] font-bold py-3.5 rounded-lg transition-colors duration-200"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-[#8a7f9e]/20 text-center">
              <p className="text-[#8a7f9e] text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/auth/register"
                  className="text-[#39ff14] hover:text-[#39ff14]/80 font-semibold transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
