import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { useMutation } from "@tanstack/react-query";
import { confirmAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken } from "../../types";
import { Mail, Shield, CheckCircle, ArrowLeft } from "lucide-react";

export default function ConfirmAccountView() {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: confirmAccount,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "Cuenta confirmada");
      navigate("/auth/login");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<confirmToken>({
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = (token: confirmToken) => {
    mutate(token);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 lg:p-8">
      
      {/* Mobile & Tablet Layout */}
      <div className="w-full max-w-md lg:hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
          <div className="mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-light rounded-full mb-4">
              <Mail className="w-8 h-8 text-vet-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmar Cuenta
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa el código de 6 dígitos enviado a tu email
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          
          {/* Security Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-vet-light rounded-lg">
            <Shield className="w-4 h-4 text-vet-primary" />
            <span className="text-sm text-vet-primary font-medium">Verificación segura</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className={`w-full px-6 py-4 bg-white border rounded-xl text-gray-900 text-center text-2xl font-bold tracking-widest placeholder-gray-300 focus:outline-none transition-all ${
                  errors.token 
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                }`}
                {...register("token", {
                  required: "El código es obligatorio",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Debe ser un código de 6 dígitos",
                  },
                })}
              />
              {errors.token && (
                <p className="text-red-600 text-sm text-center font-medium">
                  {errors.token.message as string}
                </p>
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
                  <span>Confirmando cuenta...</span>
                </div>
              ) : (
                "Confirmar Cuenta"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 text-center space-y-3">
            <p className="text-gray-600 text-sm">
              ¿No recibiste el código?
            </p>
            <Link
              to="/auth/request-new-token"
              className="inline-flex items-center justify-center w-full py-2.5 text-vet-primary hover:text-vet-secondary font-medium transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Solicitar nuevo código
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-vet-light rounded-lg border border-vet-primary/20">
          <p className="text-vet-muted text-xs text-center">
            💡 Revisa tu bandeja de spam si no encuentras el correo
          </p>
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
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold mb-4">
              ¡Ya casi estás listo!
            </h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              Confirma tu cuenta para comenzar a utilizar el sistema de gestión veterinaria más completo.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Acceso completo al sistema</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Gestiona pacientes y citas</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Soporte técnico incluido</span>
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
                Confirmar Cuenta
              </h2>
              <p className="text-gray-600">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 mb-6 p-4 bg-vet-light rounded-lg">
              <Shield className="w-5 h-5 text-vet-primary" />
              <span className="text-sm text-vet-primary font-medium">Verificación de cuenta segura</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Código de verificación
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-6 py-4 bg-white border rounded-xl text-gray-900 text-center text-2xl font-bold tracking-widest placeholder-gray-300 focus:outline-none transition-all ${
                    errors.token 
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("token", {
                    required: "El código es obligatorio",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Debe ser un código de 6 dígitos",
                    },
                  })}
                />
                {errors.token && (
                  <p className="text-red-600 text-sm text-center font-medium">
                    {errors.token.message as string}
                  </p>
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
                    <span>Confirmando cuenta...</span>
                  </div>
                ) : (
                  "Confirmar Cuenta"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center space-y-3">
              <p className="text-gray-600 text-sm">
                ¿No recibiste el código?
              </p>
              <Link
                to="/auth/request-new-token"
                className="inline-flex items-center justify-center w-full py-2.5 text-vet-primary hover:text-vet-secondary font-medium transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Solicitar nuevo código
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}