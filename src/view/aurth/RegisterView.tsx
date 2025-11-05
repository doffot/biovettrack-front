import { useForm } from "react-hook-form";
import Logo from "../../components/Logo";
import { estadosVenezuela } from "../../data/venezuela";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { UserRegistrationForm } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, FileText, MapPin, ArrowLeft } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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

  const { mutate, isPending } = useMutation({
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
    const dataToSend: UserRegistrationForm = {
      ...formData,
      whatsapp: `${formData.countryCode}${formData.whatsapp}`,
    };
    delete (dataToSend as any).countryCode;
    mutate(dataToSend);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Mobile & Tablet Layout
  const MobileTabletLayout = () => (
    <div className="w-full max-w-2xl lg:hidden">
      
      {/* Header */}
      <div className="text-center mb-6">
        <Logo size="lg" showText={true} showSubtitle={true} layout="vertical" />
        <div className="mt-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Crear Cuenta</h1>
          <p className="text-gray-600 text-sm">Completa tus datos para registrarte</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">Paso {currentStep} de {totalSteps}</span>
          <span className="text-xs font-medium text-vet-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-vet-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit(handleRegister)}>
          
          {/* Step 1: Información Personal */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("name", { required: "El nombre es obligatorio" })}
                    />
                  </div>
                  {errors.name && <p className="text-red-600 text-xs">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tu apellido"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.lastName ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("lastName", { required: "El apellido es obligatorio" })}
                    />
                  </div>
                  {errors.lastName && <p className="text-red-600 text-xs">{errors.lastName.message as string}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                    }`}
                    {...register("email", {
                      required: "El email es obligatorio",
                      pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-600 text-xs">{errors.email.message as string}</p>}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-vet-primary text-white font-medium py-3 rounded-lg hover:bg-vet-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Información Profesional */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <div className="flex gap-2">
                  <div className="relative w-1/3">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      {...register("countryCode")}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-vet-primary appearance-none"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>{country.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="4121234567"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.whatsapp ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("whatsapp", {
                        required: "El WhatsApp es obligatorio",
                        pattern: { value: /^[0-9]+$/, message: "Solo números" },
                      })}
                    />
                  </div>
                </div>
                {errors.whatsapp && <p className="text-red-600 text-xs">{errors.whatsapp.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cédula (CI)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="V-12345678"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.ci ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("ci", { required: "La cédula es obligatoria" })}
                    />
                  </div>
                  {errors.ci && <p className="text-red-600 text-xs">{errors.ci.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">CMV</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Número CMV"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.cmv ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("cmv", { required: "El CMV es obligatorio" })}
                    />
                  </div>
                  {errors.cmv && <p className="text-red-600 text-xs">{errors.cmv.message as string}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    {...register("estado", { required: "El estado es obligatorio" })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 focus:outline-none transition-all appearance-none ${
                      errors.estado ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                    }`}
                  >
                    <option value="">Selecciona un estado</option>
                    {estadosVenezuela.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                {errors.estado && <p className="text-red-600 text-xs">{errors.estado.message as string}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-vet-primary text-white font-medium py-3 rounded-lg hover:bg-vet-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contraseña y Registro */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
                    />
                  </div>
                  {errors.password && <p className="text-red-600 text-xs">{errors.password.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Repite tu contraseña"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                      }`}
                      {...register("confirmPassword", {
                        required: "Confirma tu contraseña",
                        validate: value => value === watch('password') || "Las contraseñas no coinciden",
                      })}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-xs">{errors.confirmPassword.message as string}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-vet-primary text-white font-medium py-3 rounded-lg hover:bg-vet-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    "Registrarse"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/auth/login" className="text-vet-primary hover:text-vet-secondary font-medium transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="hidden lg:flex w-full max-w-6xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Left Panel */}
      <div className="w-2/5 bg-gradient-to-br from-vet-primary to-vet-secondary p-8 flex flex-col justify-center">
        <div className="text-white">
          <div className="mb-6">
            <Logo size="xl" showText={true} showSubtitle={true} layout="vertical" textClassName="text-white" subtitleClassName="text-white/80" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Únete a nuestra comunidad</h1>
          <p className="text-white/80 mb-6">Registra tu consultorio y optimiza tu gestión veterinaria</p>
          
          <div className="space-y-3">
            {['Gestión de pacientes', 'Control de citas', 'Reportes automáticos', 'Soporte especializado'].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-white/90">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-3/5 p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear Cuenta</h2>
            <p className="text-gray-600">Completa tus datos profesionales</p>
          </div>

          <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("name", { required: "El nombre es obligatorio" })}
                />
                {errors.name && <p className="text-red-600 text-xs">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.lastName ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("lastName", { required: "El apellido es obligatorio" })}
                />
                {errors.lastName && <p className="text-red-600 text-xs">{errors.lastName.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                  errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                }`}
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" },
                })}
              />
              {errors.email && <p className="text-red-600 text-xs">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
              <div className="flex gap-3">
                <select
                  {...register("countryCode")}
                  className="w-1/3 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-vet-primary focus:border-vet-primary"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>{country.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="4121234567"
                  className={`flex-1 px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.whatsapp ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("whatsapp", {
                    required: "El WhatsApp es obligatorio",
                    pattern: { value: /^[0-9]+$/, message: "Solo números" },
                  })}
                />
              </div>
              {errors.whatsapp && <p className="text-red-600 text-xs">{errors.whatsapp.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cédula (CI)</label>
                <input
                  type="text"
                  placeholder="V-12345678"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.ci ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("ci", { required: "La cédula es obligatoria" })}
                />
                {errors.ci && <p className="text-red-600 text-xs">{errors.ci.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">CMV</label>
                <input
                  type="text"
                  placeholder="Número CMV"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.cmv ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("cmv", { required: "El CMV es obligatorio" })}
                />
                {errors.cmv && <p className="text-red-600 text-xs">{errors.cmv.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register("estado", { required: "El estado es obligatorio" })}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 focus:outline-none transition-all ${
                  errors.estado ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                }`}
              >
                <option value="">Selecciona un estado</option>
                {estadosVenezuela.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estado && <p className="text-red-600 text-xs">{errors.estado.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                />
                {errors.password && <p className="text-red-600 text-xs">{errors.password.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confirmar</label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-vet-primary focus:border-vet-primary'
                  }`}
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: value => value === watch('password') || "Las contraseñas no coinciden",
                  })}
                />
                {errors.confirmPassword && <p className="text-red-600 text-xs">{errors.confirmPassword.message as string}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-vet-primary text-white font-medium py-3 rounded-lg hover:bg-vet-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-vet-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                "Registrarse"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/auth/login" className="text-vet-primary hover:text-vet-secondary font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 lg:p-8">
      <MobileTabletLayout />
      <DesktopLayout />
    </div>
  );
}