import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { useMutation } from "@tanstack/react-query";
import { validateToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken } from "../../types";
import { KeyRound, Mail, Shield, ArrowLeft } from "lucide-react";

type NewPasswordTokenProps = {
  setValidToken: React.Dispatch<React.SetStateAction<boolean>>;
  onTokenValidated: (token: confirmToken["token"]) => void;
};

export default function NewPasswordToken({ 
  setValidToken,
  onTokenValidated 
}: NewPasswordTokenProps) {

  const { mutate, isPending } = useMutation({
    mutationFn: validateToken,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data, variables) => {
      toast.success(data || "Token válido");
      setValidToken(true);
      onTokenValidated(variables.token);
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

  const onSubmit = (formData: confirmToken) => {
    mutate(formData);
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
              <KeyRound className="w-8 h-8 text-vet-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Código de Verificación
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa el código de 6 dígitos enviado a tu email
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          
          {/* Security Badge */}
          <div className="flex justify-between items-center mb-6 p-3 bg-vet-light rounded-lg">
            <div className="flex items-center gap-2 text-vet-primary text-sm">
              <Shield className="w-4 h-4" />
              <span>Código seguro</span>
            </div>
            <div className="text-sm text-vet-muted font-medium">
              10 min
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 text-center mb-3">
                Código de Verificación
              </label>
              <input
                id="token"
                type="text"
                placeholder="000000"
                maxLength={6}
                className={`w-full px-6 py-4 bg-white border-2 rounded-xl text-gray-900 text-center text-2xl font-bold tracking-widest placeholder-gray-300 focus:outline-none transition-all duration-200 ${
                  errors.token ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
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
                <p className="text-red-600 text-sm mt-2 text-center font-medium">
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
                  <span>Validando código...</span>
                </div>
              ) : (
                "Validar Código"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 text-center space-y-3">
            <p className="text-gray-600 text-sm">
              ¿No recibiste el código?
            </p>
            <Link
              to="/auth/forgot-password"
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
              <KeyRound className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold mb-4">
              Verifica tu identidad
            </h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              Por seguridad, hemos enviado un código de 6 dígitos a tu correo electrónico para restablecer tu contraseña.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Código válido por 10 minutos</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Revisa tu bandeja de spam</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Soporte disponible 24/7</span>
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
                Verificar Código
              </h2>
              <p className="text-gray-600">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex justify-between items-center mb-6 p-4 bg-vet-light rounded-lg">
              <div className="flex items-center gap-2 text-vet-primary text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Código expira en 10 minutos</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 text-center mb-3">
                  Código de 6 dígitos
                </label>
                <input
                  id="token"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-6 py-4 bg-white border-2 rounded-xl text-gray-900 text-center text-2xl font-bold tracking-widest placeholder-gray-300 focus:outline-none transition-all duration-200 ${
                    errors.token ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
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
                  <p className="text-red-600 text-sm mt-2 text-center font-medium">
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
                    <span>Validando código...</span>
                  </div>
                ) : (
                  "Validar Código"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center space-y-3">
              <p className="text-gray-600 text-sm">
                ¿No recibiste el código?
              </p>
              <Link
                to="/auth/forgot-password"
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