// src/views/owners/CreateOwnerView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import type { OwnerFormData } from "../../types";
import { createOwner } from "../../api/OwnerAPI";
import { useNavigate, Link } from "react-router-dom";
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

  // Contar campos completados
  const formValues = watch();
  const requiredFields = ['name', 'contact'];
  const allFields = ['name', 'contact', 'email', 'address'];
  
  const completedRequired = requiredFields.filter(field => 
    formValues[field as keyof OwnerFormData] && formValues[field as keyof OwnerFormData]!.trim() !== ''
  ).length;
  
  const completedAll = allFields.filter(field => 
    formValues[field as keyof OwnerFormData] && formValues[field as keyof OwnerFormData]!.trim() !== ''
  ).length;

  const completionPercentage = (completedAll / allFields.length) * 100;

  return (
    <>
      {/* Header Compacto */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* BackButton */}
            <Link
              to="/owners"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
              title="Volver a la lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-vet-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-vet-primary" />
                </div>
                <h1 className="text-xl font-bold text-vet-text">
                  Nuevo Propietario
                </h1>
              </div>
              
              {/* Contadores de progreso */}
              <div className="flex items-center justify-between text-sm text-vet-muted">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Campos requeridos:</span>
                  <span className="font-semibold">{completedRequired}/{requiredFields.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{completedAll}/{allFields.length} completos</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-vet-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador reducido para el header fijo */}
      <div className="h-28"></div>

      {/* Formulario - Sin márgenes grandes */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <form id="owner-form" onSubmit={handleSubmit(handleForm)} noValidate>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-vet-text font-semibold mb-2 text-sm">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200
                        ${errors.name 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-vet-light border-gray-300 hover:border-gray-400 focus-within:border-vet-primary'
                        }
                      `}>
                        <div className={`p-1.5 rounded ${errors.name ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          {...register("name", {
                            required: "El nombre es requerido",
                            minLength: { value: 2, message: "Mínimo 2 caracteres" },
                          })}
                          className="flex-1 bg-transparent text-vet-text placeholder-vet-muted focus:outline-none text-sm"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-red-600 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="md:col-span-2">
                    <WhatsAppPhoneInput
                      value={watch("contact") || ""}
                      onChange={(val) => setValue("contact", val)}
                      error={errors.contact?.message}
                      required={true}
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-vet-text font-semibold mb-2 text-sm">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200
                        ${errors.email 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-vet-light border-gray-300 hover:border-gray-400 focus-within:border-vet-primary'
                        }
                      `}>
                        <div className={`p-1.5 rounded ${errors.email ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
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
                          className="flex-1 bg-transparent text-vet-text placeholder-vet-muted focus:outline-none text-sm"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-red-600 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-vet-text font-semibold mb-2 text-sm">
                      Dirección
                    </label>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-vet-light border-gray-300 hover:border-gray-400 focus-within:border-vet-primary transition-all duration-200">
                      <div className="p-1.5 rounded bg-gray-100 text-gray-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Dirección completa"
                        {...register("address")}
                        className="flex-1 bg-transparent text-vet-text placeholder-vet-muted focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones en la parte inferior del card */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-lg">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/owners")}
                    className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 order-1 sm:order-2"
                  >
                    {isPending ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isPending ? "Guardando..." : "Guardar Propietario"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}