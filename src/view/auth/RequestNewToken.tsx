import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { RequestConfirmationCodeForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { requestConfirmationCode } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Mail, RefreshCw, Shield, CheckCircle2 } from "lucide-react";

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

            {/* Iniciar Sesión - Esquina superior derecha */}
            <div className="absolute top-8 right-8 z-20">
                <Link
                    to="/auth/login"
                    className="text-white font-semibold px-6 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
                >
                    Iniciar Sesión
                </Link>
            </div>

            {/* Contenedor principal con dos columnas */}
            <div className="absolute inset-0 flex z-10">
                {/* Columna izquierda - Título grande */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="max-w-xl">
                        <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
                            BioVetTrack
                        </h1>
                        <p className="text-3xl lg:text-4xl font-bold text-vet-accent drop-shadow-lg mb-8">
                            Solicita un nuevo código
                        </p>
                        
                        {/* Características */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                                <span className="text-base font-medium">
                                    Entrega inmediata a tu email
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                                <span className="text-base font-medium">
                                    Válido por 10 minutos
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                                <span className="text-base font-medium">
                                    Soporte técnico disponible
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Formulario */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <img
                                src="/logo_main.svg"
                                alt="BioVetTrack Logo"
                                className="h-48 w-auto drop-shadow-2xl"
                            />
                        </div>

                        {/* Título */}
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-accent/20 backdrop-blur-sm rounded-full mb-4 border-2 border-vet-accent/50">
                                <RefreshCw className="w-8 h-8 text-vet-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Nuevo Código</h2>
                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                Solicita un nuevo código de verificación
                            </p>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                            <Shield className="w-5 h-5 text-vet-accent" />
                            <span className="text-sm text-white font-medium">Verificación segura</span>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-5">
                            <div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Mail className="h-5 w-5 text-white/70" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        autoComplete="email"
                                        className={`w-full pl-11 pr-4 py-3.5 bg-transparent border rounded-xl text-white placeholder-white/50 font-medium focus:outline-none transition-all
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
                                            required: "El correo electrónico es obligatorio",
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message: "Correo electrónico no válido",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                                        {errors.email.message as string}
                                    </p>
                                )}
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
                                            <span>Enviando...</span>
                                        </div>
                                    ) : (
                                        "Enviar Código"
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-6 pt-5 border-t border-white/20 space-y-3">
                            <Link
                                to="/auth/confirm-account"
                                className="block text-center text-white/80 hover:text-white text-sm transition-colors font-medium"
                            >
                                ¿Ya tienes un código? Confirmar cuenta
                            </Link>
                            <Link
                                to="/auth/forgot-password"
                                className="block text-center text-white/80 hover:text-white text-sm transition-colors font-medium"
                            >
                                ¿Olvidaste tu contraseña? Restablecer
                            </Link>
                        </div>

                        {/* Help Text */}
                        <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <p className="text-white/70 text-xs text-center">
                                💡 El código se enviará al email con el que te registraste. Revisa tu bandeja de spam.
                            </p>
                        </div>

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