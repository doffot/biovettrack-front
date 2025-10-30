import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { estadosVenezuela } from "../../data/venezuela";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { UserRegistrationForm } from "../../types";
import { useNavigate } from "react-router-dom";

// Códigos internacionales
const countryCodes = [
  { code: "+58", name: "Venezuela" },
  { code: "+57", name: "Colombia" },
  { code: "+593", name: "Ecuador" },
  { code: "+51", name: "Perú" },
  { code: "+52", name: "México" },
  { code: "+1", name: "EE.UU. / Canadá" },
  { code: "+34", name: "España" },
];

export default function RegisterView() {

  const navigate = useNavigate();


  const initialValues = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    countryCode: '+58',
    ci: '',
    cmv: '',
    estado: '',
    runsai: '',
    msds: '',
    somevepa: '',
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialValues,
  });

  const { mutate } = useMutation({
    mutationFn: createAccount,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "Registro exitoso");
      reset();
      navigate('/auth/confirm-account')
    }
  });

  const handleRegister = (formData: any) => {
    // Combinar el código de país con el número de WhatsApp
    const dataToSend: UserRegistrationForm = {
      ...formData,
      whatsapp: `${formData.countryCode}${formData.whatsapp}`,
    };
    
    // Eliminar countryCode del objeto final
    delete (dataToSend as any).countryCode;
    
    mutate(dataToSend);
  };

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
            Sistema profesional de gestión veterinaria diseñado para optimizar tus procesos de trabajo.
          </p>
          <div className="mt-12 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#39ff14]/30"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]/50"></div>
            <div className="w-3 h-3 rounded-full bg-[#39ff14]"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Formulario con scroll */}
      <div className="flex-1 flex flex-col h-screen lg:w-[65%]">
        {/* Mobile Logo - Fixed header */}
        <div className="lg:hidden bg-[#0b132b] border-b border-[#8a7f9e]/20 py-4 px-4 flex justify-center sticky top-0 z-10">
          <Logo size="lg" showText={true} showSubtitle={false} layout="vertical" />
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-3xl">
              <div className="bg-[#0b132b]/50 backdrop-blur-sm border border-[#8a7f9e]/20 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#e7e5f2] mb-2 tracking-tight">Crear Cuenta</h2>
                  <p className="text-[#8a7f9e] text-sm sm:text-base">
                    Regístrate como veterinario para acceder al sistema
                  </p>
                </div>

                <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        Nombre
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.name ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("name", { required: "El nombre es obligatorio" })}
                      />
                      {errors.name && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.name.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        Apellido
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Tu apellido"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.lastName ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("lastName", { required: "El apellido es obligatorio" })}
                      />
                      {errors.lastName && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.lastName.message as string}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
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
                      <p className="text-[#ff5e5b] text-xs mt-1">{errors.email.message as string}</p>
                    )}
                  </div>

                  {/* WhatsApp con código internacional */}
                  <div>
                    <label className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                      WhatsApp
                    </label>
                    <div className="flex gap-2">
                      <select
                        {...register("countryCode")}
                        className="w-1/3 sm:w-1/4 px-3 py-2.5 bg-[#0b132b] border-2 border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] focus:border-[#39ff14] focus:outline-none"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} ({country.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="4121234567"
                        className={`flex-1 px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.whatsapp ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("whatsapp", {
                          required: "El WhatsApp es obligatorio",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "Solo números sin espacios",
                          },
                        })}
                      />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-[#ff5e5b] text-xs mt-1">{errors.whatsapp.message as string}</p>
                    )}
                  </div>

                  {/* CI y CMV */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ci" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        Cédula (CI)
                      </label>
                      <input
                        id="ci"
                        type="text"
                        placeholder="V-12345678"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.ci ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("ci", { required: "La cédula es obligatoria" })}
                      />
                      {errors.ci && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.ci.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cmv" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        CMV
                      </label>
                      <input
                        id="cmv"
                        type="text"
                        placeholder="Número de CMV"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.cmv ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("cmv", { required: "El CMV es obligatorio" })}
                      />
                      {errors.cmv && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.cmv.message as string}</p>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <label htmlFor="estado" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                      Estado
                    </label>
                    <select
                      id="estado"
                      className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] focus:outline-none transition-colors duration-200 appearance-none ${
                        errors.estado ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                      }`}
                      {...register("estado", { required: "El estado es obligatorio" })}
                    >
                      <option value="">Selecciona un estado</option>
                      {estadosVenezuela.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                    {errors.estado && (
                      <p className="text-[#ff5e5b] text-xs mt-1">{errors.estado.message as string}</p>
                    )}
                  </div>

                  {/* Contraseñas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.password ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("password", {
                          required: "La contraseña es obligatoria",
                          minLength: { value: 6, message: "Mínimo 6 caracteres" },
                        })}
                      />
                      {errors.password && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.password.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#e7e5f2] uppercase tracking-wide mb-1.5">
                        Confirmar Contraseña
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        className={`w-full px-4 py-2.5 bg-[#0b132b] border-2 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:outline-none transition-colors duration-200 ${
                          errors.confirmPassword ? 'border-[#ff5e5b]' : 'border-[#8a7f9e]/30 focus:border-[#39ff14]'
                        }`}
                        {...register("confirmPassword", {
                          required: "Debes confirmar la contraseña",
                          validate: (value, formValues) =>
                            value === formValues.password || "Las contraseñas no coinciden",
                        })}
                      />
                      {errors.confirmPassword && (
                        <p className="text-[#ff5e5b] text-xs mt-1">{errors.confirmPassword.message as string}</p>
                      )}
                    </div>
                  </div>

                  {/* Campos opcionales */}
                  <div className="pt-3 border-t border-[#8a7f9e]/20">
                    <h3 className="text-xs font-semibold text-[#8a7f9e] uppercase tracking-wide mb-3">
                      Información Adicional (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="runsai" className="block text-xs text-[#e7e5f2] mb-1.5">RUNSAI</label>
                        <input
                          id="runsai"
                          type="text"
                          placeholder="Número RUNSAI"
                          className="w-full px-4 py-2 bg-[#0b132b] border border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:border-[#39ff14] focus:outline-none text-sm"
                          {...register("runsai")}
                        />
                      </div>

                      <div>
                        <label htmlFor="msds" className="block text-xs text-[#e7e5f2] mb-1.5">MSDS</label>
                        <input
                          id="msds"
                          type="text"
                          placeholder="Código MSDS"
                          className="w-full px-4 py-2 bg-[#0b132b] border border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:border-[#39ff14] focus:outline-none text-sm"
                          {...register("msds")}
                        />
                      </div>

                      <div>
                        <label htmlFor="somevepa" className="block text-xs text-[#e7e5f2] mb-1.5">SOMEVEPA</label>
                        <input
                          id="somevepa"
                          type="text"
                          placeholder="Número SOMEVEPA"
                          className="w-full px-4 py-2 bg-[#0b132b] border border-[#8a7f9e]/30 rounded-lg text-[#e7e5f2] placeholder-[#8a7f9e]/50 focus:border-[#39ff14] focus:outline-none text-sm"
                          {...register("somevepa")}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#39ff14] hover:bg-[#39ff14]/90 text-[#0b132b] font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-[#39ff14]/20 hover:scale-[1.02] active:scale-[0.98] mt-4"
                  >
                    Registrarse
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#8a7f9e]/20 text-center">
                  <p className="text-[#8a7f9e] text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <a href="#" className="text-[#39ff14] hover:text-[#39ff14]/80 font-semibold transition-colors">
                      Inicia sesión aquí
                    </a>
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