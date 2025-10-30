import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordWithToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken, NewPasswordForm } from "../../types";

type NewPasswordFormProps = {
  token: confirmToken["token"];
};

export default function NewPasswordFormComponent({ token }: NewPasswordFormProps) {
  const navigate = useNavigate();

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

  const { mutate } = useMutation({
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

  return (
    <div className="min-h-screen bg-[#0b132b] flex">
      {/* Left Panel - Logo */}
      <div className="hidden lg:flex lg:w-[35%] bg-gradient-to-br from-[#0b132b] via-[#172554] to-[#1e293b] items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#39ff14]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8a7f9e]/5 rounded-full blur-3xl"></div>

        <div className="text-center max-w-md z-10">
          <div className="mb-8 flex justify-center">
            <Logo size="xl" showText={true} showSubtitle={false} layout="vertical" />
          </div>
          <p className="text-[#8a7f9e] text-lg leading-relaxed">
            Tu cuenta está protegida. Establece una contraseña segura para continuar.
          </p>
          <div className="mt-12 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col h-screen lg:w-[65%]">
        <div className="lg:hidden bg-[#0b132b] border-b border-[#8a7f9e]/20 py-4 px-4 flex justify-center sticky top-0 z-10">
          <Logo size="lg" showText={true} showSubtitle={false} layout="vertical" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-xl">
              <div className="bg-[#0b132b]/50 backdrop-blur-sm border border-[#8a7f9e]/20 rounded-2xl p-8 sm:p-10 lg:p-12 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#39ff14]/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#e7e5f2] mb-3 tracking-tight">
                    Nueva Contraseña
                  </h2>
                  <p className="text-[#8a7f9e] text-sm sm:text-base leading-relaxed">
                    Establece una contraseña segura para tu cuenta
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-6">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide"
                    >
                      Contraseña
                    </label>

                    <input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full px-4 py-3 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                        errors.password ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                      }`}
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                          value: 8,
                          message: "La contraseña debe tener mínimo 8 caracteres",
                        },
                      })}
                    />

                    <div className="h-5">
                      {errors.password && (
                        <p className="text-[#ff5e5b] text-xs">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide"
                    >
                      Confirmar Contraseña
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu contraseña"
                      className={`w-full px-4 py-3 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                        errors.confirmPassword ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                      }`}
                      {...register("confirmPassword", {
                        required: "Debes confirmar la contraseña",
                        validate: (value) =>
                          value === password || "Las contraseñas no coinciden",
                      })}
                    />

                    <div className="h-5">
                      {errors.confirmPassword && (
                        <p className="text-[#ff5e5b] text-xs">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#39ff14] hover:bg-[#39ff14]/90 text-[#0b132b] font-bold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-[#39ff14]/20 hover:scale-[1.02] active:scale-[0.98] mt-8"
                  >
                    Establecer Contraseña
                  </button>
                </form>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-[#8a7f9e]/5 rounded-lg border border-[#8a7f9e]/10">
                  <p className="text-[#8a7f9e] text-xs text-center leading-relaxed">
                    💡 Usa una combinación de letras, números y símbolos para mayor seguridad.
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