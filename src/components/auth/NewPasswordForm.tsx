import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordWithToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken, NewPasswordForm } from "../../types";
import { Lock, Shield, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type NewPasswordFormProps = {
  token: confirmToken["token"];
};

export default function NewPasswordFormComponent({ token }: NewPasswordFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: NewPasswordForm = {
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: updatePasswordWithToken,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "Contraseña actualizada");
      reset();
      navigate("/auth/login");
    },
  });

  const handleNewPassword = (formData: NewPasswordForm) => {
    const data = {
      formData,
      token,
    };
    mutate(data);
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 lg:p-8">
      
      {/* Mobile & Tablet Layout */}
      <div className="w-full max-w-md lg:hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
          <div className="mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-light rounded-full mb-4">
              <Lock className="w-8 h-8 text-vet-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600 text-sm">
              Establece una contraseña segura para tu cuenta
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          
          {/* Security Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-vet-light rounded-lg">
            <Shield className="w-4 h-4 text-vet-primary" />
            <span className="text-sm text-vet-primary font-medium">Contraseña segura</span>
          </div>

          <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-5">
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-vet-primary transition-all"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 8,
                      message: "Mínimo 8 caracteres",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-10 pr-10 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-vet-primary transition-all ${
                    confirmPassword && password === confirmPassword
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-vet-primary'
                  }`}
                  {...register("confirmPassword", {
                    required: "Debes confirmar la contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-vet-primary text-white font-medium py-3.5 rounded-lg hover:bg-vet-secondary focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando contraseña...</span>
                </div>
              ) : (
                "Establecer Contraseña"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/auth/login")}
              className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-vet-light rounded-lg border border-vet-primary/20">
          <div className="space-y-2 text-vet-muted text-xs">
            <p className="font-medium text-vet-primary mb-2">Recomendaciones de seguridad:</p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-vet-primary rounded-full"></div>
              <span>Mínimo 8 caracteres</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-vet-primary rounded-full"></div>
              <span>Incluye mayúsculas y minúsculas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-vet-primary rounded-full"></div>
              <span>Agrega números y símbolos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-2/5 bg-gradient-to-br from-vet-primary to-vet-secondary p-8 flex flex-col justify-center">
          <div className="text-white">
            <div className="mb-6">
              <Logo 
                size="xl" 
                showText={true} 
                showSubtitle={true} 
                layout="vertical" 
                textClassName="text-white" 
                subtitleClassName="text-white/80" 
              />
            </div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold mb-4">
              Seguridad Primero
            </h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              Establece una contraseña segura para proteger tu cuenta veterinaria y toda la información de tus pacientes.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Protege datos sensibles</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Cumple con normativas</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Acceso seguro 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-3/5 p-8 flex items-center justify-center">
          <div className="w-full max-w-sm">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nueva Contraseña
              </h2>
              <p className="text-gray-600">
                Establece una contraseña segura
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 mb-6 p-4 bg-vet-light rounded-lg">
              <Shield className="w-5 h-5 text-vet-primary" />
              <span className="text-sm text-vet-primary font-medium">Protege tu cuenta con una contraseña segura</span>
            </div>

            <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-5">
              
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-vet-primary transition-all"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 8,
                        message: "Mínimo 8 caracteres",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className={`w-full pl-10 pr-10 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-vet-primary transition-all ${
                      confirmPassword && password === confirmPassword
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-vet-primary'
                    }`}
                    {...register("confirmPassword", {
                      required: "Debes confirmar la contraseña",
                      validate: (value) =>
                        value === password || "Las contraseñas no coinciden",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-vet-primary text-white font-medium py-3.5 rounded-lg hover:bg-vet-secondary focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Actualizando contraseña...</span>
                  </div>
                ) : (
                  "Establecer Contraseña"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/auth/login")}
                className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}