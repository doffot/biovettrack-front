// src/views/owners/CreateOwnerView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import type { OwnerFormData } from "../../types";
import { createOwner } from "../../api/OwnerAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Save, User, Mail, MapPin, ArrowLeft, Users } from "lucide-react";
import { WhatsAppPhoneInput } from "../../components/WhatsAppPhoneInput";

export default function CreateOwnerView() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const initialValues: OwnerFormData = {
    name: "",
    contact: "",
    email: "",
    address: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: initialValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
      navigate(`/owners/${data.owner._id}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForm = async (formData: OwnerFormData) => mutate(formData);

  return (
    <>
      {/* Header Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to="/owners"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver a la lista"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Nuevo Propietario
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Registra la información del nuevo propietario
                </p>
              </div>
            </div>

            {/* Botón Guardar para desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <button
                type="submit"
                form="owner-form"
                disabled={isPending}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPending ? "Guardando..." : "Guardar Propietario"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-40"></div>

      {/* Formulario */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <form id="owner-form" onSubmit={handleSubmit(handleForm)} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-3 text-sm">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                      ${errors.name 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
                      }
                    `}>
                      <div className={`p-2 rounded-lg ${errors.name ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ingresa el nombre del propietario"
                        {...register("name", {
                          required: "El nombre es requerido",
                          minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        })}
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <WhatsAppPhoneInput
                    value={watch("contact") || ""}
                    onChange={(val) => setValue("contact", val)}
                    error={errors.contact?.message}
                    required={true}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-3 text-sm">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                      ${errors.email 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary'
                      }
                    `}>
                      <div className={`p-2 rounded-lg ${errors.email ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        {...register("email", {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Formato de email inválido",
                          },
                        })}
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-red-600 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-3 text-sm">
                    Dirección
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      {...register("address")}
                      className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Botones para móvil */}
              <div className="sm:hidden flex flex-col gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPending ? "Guardando..." : "Guardar Propietario"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/owners")}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Botón Cancelar para desktop */}
              <div className="hidden sm:flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/owners")}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Necesitas agregar este import que falta
import { Link } from "react-router-dom";