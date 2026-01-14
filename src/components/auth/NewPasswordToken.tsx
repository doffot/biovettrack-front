import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { validateToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken } from "../../types";
import { KeyRound, Mail, Shield, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen flex relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/90"></div>

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
        <Link
          to="/auth/login"
          className="text-white text-sm md:text-base font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        >
          Iniciar Sesión
        </Link>
      </div>

      <div className="absolute inset-0 flex flex-col lg:flex-row z-10">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-xl">
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              BioVetTrack
            </h1>
            <p className="text-3xl lg:text-4xl font-bold text-vet-accent drop-shadow-lg mb-8">
              Verifica tu identidad
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Código válido por 10 minutos
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Proceso seguro y encriptado
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Soporte disponible 24/7
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6 md:mb-8">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-32 md:h-48 w-auto drop-shadow-2xl"
              />
            </div>

            <div className="lg:hidden mb-4 md:mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 drop-shadow-lg">
                BioVetTrack
              </h1>
              <p className="text-base md:text-lg font-bold text-vet-accent drop-shadow-lg">
                Verifica tu identidad
              </p>
            </div>

            <div className="mb-4 md:mb-6 text-center">
              <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 bg-vet-accent/20 backdrop-blur-sm rounded-full mb-3 md:mb-4 border-2 border-vet-accent/50">
                <KeyRound className="w-7 md:w-8 h-7 md:h-8 text-vet-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Verificar Código</h2>
              <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
                Ingresa el código de 6 dígitos enviado a tu email
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="w-4 md:w-5 h-4 md:h-5 text-vet-accent" />
              <span className="text-xs md:text-sm text-white font-medium">Código expira en 10 minutos</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-4 md:px-6 py-3 md:py-4 bg-transparent border-2 rounded-xl text-white text-center text-2xl md:text-3xl font-bold tracking-[0.5em] placeholder-white/30 focus:outline-none transition-all
                    autofill:bg-transparent autofill:text-white
                    autofill:shadow-[0_0_0_1000px_transparent_inset]
                    autofill:[-webkit-text-fill-color:white]
                    ${
                    errors.token 
                      ? 'border-red-400 focus:ring-0' 
                      : 'border-white/50 focus:border-vet-primary'
                  }`}
                  style={{
                    WebkitBoxShadow: "0 0 0 1000px transparent inset",
                    WebkitTextFillColor: "white",
                  }}
                  {...register("token", {
                    required: "El código es obligatorio",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Debe ser un código de 6 dígitos",
                    },
                  })}
                />
                {errors.token && (
                  <p className="text-red-300 text-[10px] md:text-xs mt-1.5 md:mt-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm text-center">
                    {errors.token.message as string}
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-1 md:pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-vet-primary text-white font-bold py-3 md:py-3.5 text-sm md:text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validando...</span>
                    </div>
                  ) : (
                    "Validar Código"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 md:mt-6 pt-4 md:pt-5 border-t border-white/20 text-center space-y-2 md:space-y-3">
              <p className="text-white/80 text-xs md:text-sm">
                ¿No recibiste el código?
              </p>
              <Link
                to="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 text-vet-accent hover:text-white font-medium transition-colors text-xs md:text-sm"
              >
                <Mail className="w-3.5 md:w-4 h-3.5 md:h-4" />
                Solicitar nuevo código
              </Link>
            </div>

            <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-white/70 text-[10px] md:text-xs text-center">
                💡 Revisa tu bandeja de spam si no encuentras el correo
              </p>
            </div>

            <p className="text-center text-[10px] md:text-xs text-white/70 font-medium mt-4 md:mt-6 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
