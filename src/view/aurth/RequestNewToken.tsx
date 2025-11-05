import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { RequestConfirmationCodeForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { requestConfirmationCode } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import Logo from "../../components/Logo";
import { Mail, RefreshCw, ArrowLeft, Shield } from "lucide-react";

export default function NewCodeView() {
    const initialValues: RequestConfirmationCodeForm = {
        email: ''
    }

    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

    const { mutate, isPending } = useMutation({
        mutationFn: requestConfirmationCode,
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.values(errors).forEach((errorMsg: any) => {
                    toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
                });
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Error al solicitar el código');
            }
        },
        onSuccess: (data) => {
            toast.success(data || "Nuevo código enviado al email");
            reset();
        }
    });

    const handleRequestCode = (formData: RequestConfirmationCodeForm) => mutate(formData);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 lg:p-8">
            
            {/* Mobile & Tablet Layout */}
            <div className="w-full max-w-md lg:hidden">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
                    <div className="mt-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-light rounded-full mb-4">
                            <RefreshCw className="w-8 h-8 text-vet-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Nuevo Código
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Solicita un nuevo código de verificación
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

                    <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                                        errors.email 
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
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
                                <p className="text-red-600 text-sm font-medium">{errors.email.message as string}</p>
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
                                    <span>Enviando código...</span>
                                </div>
                            ) : (
                                "Enviar Código"
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-5 border-t border-gray-200 space-y-3">
                        <Link
                            to="/auth/login"
                            className="block text-center text-gray-600 hover:text-vet-primary text-sm transition-colors font-medium"
                        >
                            ¿Ya tienes cuenta? Iniciar Sesión
                        </Link>
                        <Link
                            to="/auth/forgot-password"
                            className="block text-center text-gray-600 hover:text-vet-primary text-sm transition-colors font-medium"
                        >
                            ¿Olvidaste tu contraseña? Restablecer
                        </Link>
                    </div>

                    {/* Back Link */}
                    <div className="mt-4 text-center">
                        <Link
                            to="/auth/confirm-account"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a confirmar cuenta
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-vet-light rounded-lg border border-vet-primary/20">
                    <p className="text-vet-muted text-xs text-center">
                        💡 El código se enviará al email con el que te registraste. Revisa tu bandeja de spam.
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
                            <RefreshCw className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-2xl font-bold mb-4">
                            Nuevo Código de Verificación
                        </h1>
                        <p className="text-white/80 mb-6 leading-relaxed">
                            ¿No recibiste el código? Solicita uno nuevo para completar la verificación de tu cuenta.
                        </p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-sm">Entrega inmediata</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="text-sm">Válido por 10 minutos</span>
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
                                Solicitar Nuevo Código
                            </h2>
                            <p className="text-gray-600">
                                Ingresa tu email para recibir un nuevo código
                            </p>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 mb-6 p-4 bg-vet-light rounded-lg">
                            <Shield className="w-5 h-5 text-vet-primary" />
                            <span className="text-sm text-vet-primary font-medium">Verificación de cuenta segura</span>
                        </div>

                        <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                                            errors.email 
                                                ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
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
                                    <p className="text-red-600 text-sm font-medium">{errors.email.message as string}</p>
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
                                        <span>Enviando código...</span>
                                    </div>
                                ) : (
                                    "Enviar Código"
                                )}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-6 pt-5 border-t border-gray-200 space-y-3">
                            <Link
                                to="/auth/login"
                                className="block text-center text-gray-600 hover:text-vet-primary text-sm transition-colors font-medium"
                            >
                                ¿Ya tienes cuenta? Iniciar Sesión
                            </Link>
                            <Link
                                to="/auth/forgot-password"
                                className="block text-center text-gray-600 hover:text-vet-primary text-sm transition-colors font-medium"
                            >
                                ¿Olvidaste tu contraseña? Restablecer
                            </Link>
                        </div>

                        {/* Back Link */}
                        <div className="mt-4 text-center">
                            <Link
                                to="/auth/confirm-account"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-vet-primary font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a confirmar cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}