import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import type { ForgotPasswordForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import Logo from "../../components/Logo";
import { Mail, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordView() {
  const initialValues: ForgotPasswordForm = { email: '' };
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onError: (error: any) => {
      toast.error(error.message || 'Error al enviar las instrucciones');
    },
    onSuccess: (data) => {  
      toast.success(data || "Instrucciones enviadas al email");
      setIsSubmitted(true);
    }
  });
  
  const handleForgotPassword = (formData: ForgotPasswordForm) => mutate(formData);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-12">
            <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Correo enviado!
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Hemos enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.
              </p>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <Shield className="w-4 h-4" />
                <span>El enlace expira en 30 minutos</span>
              </div>

              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center w-full bg-vet-primary text-white font-medium py-3 rounded-lg hover:bg-vet-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              ¿No recibes el email? Revisa tu carpeta de spam o{" "}
              <Link to="/auth/contact" className="text-vet-primary hover:text-vet-secondary font-medium">
                contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-vet-light rounded-full mb-4">
              <Mail className="w-6 h-6 text-vet-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Recuperar contraseña
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary hover:border-gray-300'
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
                <p className="text-red-600 text-sm mt-2 font-medium">{errors.email.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-vet-primary text-white font-medium py-3.5 rounded-xl hover:bg-vet-secondary focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando instrucciones...</span>
                </div>
              ) : (
                "Enviar instrucciones"
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center w-full text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors py-2 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>

        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            ¿No recibes el email? Revisa tu carpeta de spam o{" "}
            <Link to="/auth/contact" className="text-vet-primary hover:text-vet-secondary font-medium transition-colors">
              contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}