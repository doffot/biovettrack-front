import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { RequestConfirmationCodeForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { requestConfirmationCode } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import Logo from "../../components/Logo";

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
        <div className="min-h-screen bg-[#0b132b] flex">
            {/* Left Panel - Logo centrado */}
            <div className="hidden lg:flex lg:w-[35%] bg-gradient-to-br from-[#0b132b] via-[#172554] to-[#1e293b] items-center justify-center p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#39ff14]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8a7f9e]/5 rounded-full blur-3xl"></div>
                
                <div className="text-center max-w-md z-10">
                    <div className="mb-8 flex justify-center">
                        <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
                    </div>
                    <p className="text-[#8a7f9e] text-lg leading-relaxed">
                        Solicita un nuevo código de verificación para confirmar tu cuenta.
                    </p>
                    <div className="mt-12 flex justify-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#39ff14]/50"></div>
                        <div className="w-3 h-3 rounded-full bg-[#39ff14]/30"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Formulario */}
            <div className="flex-1 flex flex-col h-screen lg:w-[65%]">
                {/* Mobile Logo - Fixed header */}
                <div className="lg:hidden bg-[#0b132b] border-b border-[#8a7f9e]/20 py-4 px-4 flex justify-center sticky top-0 z-10">
                    <Logo size="lg" showText={true} showSubtitle={false} layout="vertical" />
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                        <div className="w-full max-w-xl">
                            <div className="bg-[#0b132b]/50 backdrop-blur-sm border border-[#8a7f9e]/20 rounded-2xl p-8 sm:p-10 lg:p-12 shadow-2xl">
                                
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#39ff14]/10 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-[#e7e5f2] mb-3 tracking-tight">
                                        Solicitar Nuevo Código
                                    </h2>
                                    <p className="text-[#8a7f9e] text-sm sm:text-base leading-relaxed">
                                        Coloca tu email para recibir{' '}
                                        <span className="text-[#39ff14] font-semibold">un nuevo código de verificación</span>
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-6" noValidate>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-2">
                                            Email de Registro
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            className={`w-full px-4 py-3 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                                                errors.email ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                                            }`}
                                            {...register("email", {
                                                required: "El email es obligatorio",
                                                pattern: {
                                                    value: /\S+@\S+\.\S+/,
                                                    message: "Email no válido",
                                                },
                                            })}
                                        />
                                        {errors.email && (
                                            <p className="text-[#ff5e5b] text-xs mt-2">{errors.email.message as string}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full bg-[#39ff14] hover:bg-[#39ff14]/90 text-[#0b132b] font-bold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-[#39ff14]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isPending ? 'Enviando código...' : 'Enviar Código'}
                                    </button>
                                </form>

                                {/* Footer Links */}
                                <div className="mt-8 pt-6 border-t border-[#8a7f9e]/20 space-y-3">
                                    <Link
                                        to='/auth/login'
                                        className="block text-center text-[#8a7f9e] hover:text-[#39ff14] text-sm transition-colors"
                                    >
                                        ¿Ya tienes cuenta? <span className="font-semibold">Iniciar Sesión</span>
                                    </Link>
                                    <Link
                                        to='/auth/forgot-password'
                                        className="block text-center text-[#8a7f9e] hover:text-[#39ff14] text-sm transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña? <span className="font-semibold">Restablecer</span>
                                    </Link>
                                </div>

                                {/* Help text */}
                                <div className="mt-6 p-4 bg-[#8a7f9e]/5 rounded-lg border border-[#8a7f9e]/10">
                                    <p className="text-[#8a7f9e] text-xs text-center leading-relaxed">
                                        💡 El código se enviará al email con el que te registraste. Revisa tu bandeja de spam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}