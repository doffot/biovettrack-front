import { useForm } from "react-hook-form";
import { estadosVenezuela } from "../../data/venezuela";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { UserRegistrationForm } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, User, Mail, Phone, FileText, MapPin } from "lucide-react";
import { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: initialValues,
  });

  const selectedEstado = watch('estado');

  const { mutate, isPending } = useMutation({
  mutationFn: createAccount,
  onError: (error: any) => {
    // Extraer el mensaje del backend
    toast.error('Registro fallido', error.message); 
  },
  onSuccess: (data) => {
    toast.success('¡Cuenta creada!', data || 'Revisa tu email para confirmar.');
    reset();
    navigate('/auth/confirm-account');
  }
});

  const handleRegister = (formData: any) => {
    const dataToSend: UserRegistrationForm = {
      ...formData,
      whatsapp: `${formData.countryCode}${formData.whatsapp}`,
    };
    delete (dataToSend as any).countryCode;
    mutate(dataToSend);
  };

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
              Únete a nuestra red
            </p>
            
            {/* Características adicionales */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Gestión profesional de pacientes
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Control completo de citas
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Reportes y estadísticas avanzadas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo SVG centrado - más espacio arriba */}
            <div className="flex justify-center mb-4 mt-4">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-24 w-auto drop-shadow-2xl"
              />
            </div>

            {/* Título del formulario - más compacto */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-white mb-1">Crear Cuenta</h2>
              <p className="text-white/80 text-xs">
                Completa tus datos profesionales
              </p>
            </div>

            {/* Formulario - espaciado reducido */}
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-2.5">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="h-4 w-4 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre"
                      className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.name
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("name", { required: "El nombre es obligatorio" })}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="h-4 w-4 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="Apellido"
                      className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.lastName
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("lastName", { required: "El apellido es obligatorio" })}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.lastName.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="h-4 w-4 text-white/70" />
                  </div>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
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
                      required: "El email es obligatorio",
                      pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex gap-2">
                  <select
                    {...register("countryCode")}
                    className="w-20 px-2 py-2 text-xs bg-transparent border border-white/50 rounded-lg text-white font-medium focus:outline-none focus:border-vet-primary transition-all"
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code} className="bg-slate-800">
                        {country.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="h-4 w-4 text-white/70" />
                    </div>
                    <input
                      type="tel"
                      placeholder="4121234567"
                      className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.whatsapp
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("whatsapp", {
                        required: "El WhatsApp es obligatorio",
                        pattern: { value: /^[0-9]+$/, message: "Solo números" },
                      })}
                    />
                  </div>
                </div>
                {errors.whatsapp && (
                  <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.whatsapp.message as string}
                  </p>
                )}
              </div>

              {/* CI y Estado en dos columnas */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <FileText className="h-4 w-4 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="CI"
                      className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.ci
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("ci", { required: "La cédula es obligatoria" })}
                    />
                  </div>
                  {errors.ci && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.ci.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MapPin className="h-4 w-4 text-white/70" />
                    </div>
                    <select
                      {...register("estado", { required: "El estado es obligatorio" })}
                      className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white font-medium focus:outline-none transition-all appearance-none
                        ${
                        errors.estado
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                    >
                      <option value="" className="bg-slate-800">Estado</option>
                      {estadosVenezuela.map((estado) => (
                        <option key={estado} value={estado} className="bg-slate-800">{estado}</option>
                      ))}
                    </select>
                  </div>
                  {errors.estado && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.estado.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* CMV */}
              <div>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FileText className="h-4 w-4 text-white/70" />
                  </div>
                  <input
                    type="text"
                    placeholder={selectedEstado ? `COLVET ${selectedEstado}` : "Selecciona estado"}
                    disabled={!selectedEstado}
                    className={`w-full pl-8 pr-3 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                      errors.cmv
                        ? "border-red-400 focus:ring-0"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("cmv", { required: "El CMV es obligatorio" })}
                  />
                </div>
                {errors.cmv && (
                  <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.cmv.message as string}
                  </p>
                )}
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      autoComplete="new-password"
                      className={`w-full px-3 pr-9 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.password
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2.5 text-white/70 hover:text-vet-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar"
                      autoComplete="new-password"
                      className={`w-full px-3 pr-9 py-2 text-sm bg-transparent border rounded-lg text-white placeholder-white/50 font-medium focus:outline-none transition-all
                        autofill:bg-transparent autofill:text-white
                        autofill:shadow-[0_0_0_1000px_transparent_inset]
                        autofill:[-webkit-text-fill-color:white]
                        ${
                        errors.confirmPassword
                          ? "border-red-400 focus:ring-0"
                          : "border-white/50 focus:border-vet-primary"
                      }`}
                      style={{
                        WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        WebkitTextFillColor: "white",
                      }}
                      {...register("confirmPassword", {
                        required: "Confirma tu contraseña",
                        validate: value => value === watch('password') || "Las contraseñas no coinciden",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2.5 text-white/70 hover:text-vet-accent transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-300 text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold bg-black/20 backdrop-blur-sm">
                      {errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-vet-primary text-white font-bold py-2.5 text-sm rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando...</span>
                    </div>
                  ) : (
                    "Registrarse"
                  )}
                </button>
              </div>
            </form>

            {/* Copyright */}
            <p className="text-center text-[10px] text-white/70 font-medium mt-3 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}