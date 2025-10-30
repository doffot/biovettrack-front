import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { useMutation } from "@tanstack/react-query";
import { confirmAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken } from "../../types"; // Asegúrate de que esta ruta sea correcta

export default function ConfirmAccountView() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
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
    mutate(token); // ✅
  };

  return (
    <div className="min-h-screen bg-[#0b132b] flex">
      {/* Left Panel - Logo centrado */}
      <div className="hidden lg:flex lg:w-[35%] bg-gradient-to-br from-[#0b132b] via-[#172554] to-[#1e293b] items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#39ff14]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8a7f9e]/5 rounded-full blur-3xl"></div>

        <div className="text-center max-w-md z-10">
          <div className="mb-8 flex justify-center">
            <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
          </div>
          <p className="text-[#8a7f9e] text-lg leading-relaxed">
            Estás a un paso de acceder al sistema profesional de gestión veterinaria.
          </p>
          <div className="mt-12 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]/30"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Formulario */}
      <div className="flex-1 flex flex-col h-screen lg:w-[65%]">
        <div className="lg:hidden bg-[#0b132b] border-b border-[#8a7f9e]/20 py-4 px-4 flex justify-center sticky top-0 z-10">
          <Logo size="lg" showText={true} showSubtitle={false} layout="vertical" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-xl">
              <div className="bg-[#0b132b]/50 backdrop-blur-sm border border-[#8a7f9e]/20 rounded-2xl p-8 sm:p-10 lg:p-12 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#39ff14]/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#e7e5f2] mb-3 tracking-tight">
                    Confirma tu Cuenta
                  </h2>
                  <p className="text-[#8a7f9e] text-sm sm:text-base leading-relaxed">
                    Ingresa el código de 6 dígitos que recibiste{' '}
                    <span className="text-[#39ff14] font-semibold">por email</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="token" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-2 text-center">
                      Código de Verificación
                    </label>
                    <input
                      id="token"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className={`w-full px-6 py-4 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] text-center text-2xl font-bold tracking-widest placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                        errors.token ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
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
                      <p className="text-[#ff5e5b] text-xs mt-2 text-center">
                        {errors.token.message as string}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#39ff14] hover:bg-[#39ff14]/90 text-[#0b132b] font-bold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-[#39ff14]/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Confirmar Cuenta
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#8a7f9e]/20 space-y-3">
                  <p className="text-[#8a7f9e] text-sm text-center">
                    ¿No recibiste el código?
                  </p>
                  <Link
                    to="/auth/request-new-token"
                    className="block text-center text-[#39ff14] hover:text-[#39ff14]/80 font-semibold text-sm transition-colors"
                  >
                    Solicitar nuevo código
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-[#8a7f9e]/5 rounded-lg border border-[#8a7f9e]/10">
                  <p className="text-[#8a7f9e] text-xs text-center leading-relaxed">
                    💡 Revisa tu bandeja de spam si no encuentras el correo. El código expira en 10 minutos.
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