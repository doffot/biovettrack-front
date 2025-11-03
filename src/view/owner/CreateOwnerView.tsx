// src/views/owners/CreateOwnerView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import type { OwnerFormData } from "../../types";
import { createOwner } from "../../api/OwnerAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Save, User, Mail, MapPin } from "lucide-react";
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
      {/* Header con espaciado superior */}
      <div className="mt-10 lg:mt-0 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Nuevo Propietario</h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Registra la información del nuevo propietario
            </p>
          </div>
        </div>
      </div>

      {/* Card única con formulario */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            <form onSubmit={handleSubmit(handleForm)} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg border
                      ${errors.name 
                        ? 'bg-red-500/10 border-red-500/50' 
                        : 'bg-gray-700/50 border-gray-700 hover:border-green-500/50 focus-within:border-green-500'
                      } transition-colors
                    `}>
                      <div className={`p-1 rounded bg-gray-900 ${errors.name ? 'text-red-500' : 'text-green-500'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ingresa el nombre del propietario"
                        {...register("name", {
                          required: "El nombre es requerido",
                          minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        })}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full" />
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
                  <label className="block text-white font-medium mb-2 text-sm">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg border
                      ${errors.email 
                        ? 'bg-red-500/10 border-red-500/50' 
                        : 'bg-gray-700/50 border-gray-700 hover:border-green-500/50 focus-within:border-green-500'
                      } transition-colors
                    `}>
                      <div className={`p-1 rounded bg-gray-900 ${errors.email ? 'text-red-500' : 'text-green-500'}`}>
                        <Mail className="w-5 h-5" />
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
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Dirección
                  </label>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border bg-gray-700/50 border-gray-700 hover:border-green-500/50 focus-within:border-green-500 transition-colors
                  `}>
                    <div className="p-1 rounded bg-gray-900 text-green-500">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      {...register("address")}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/owners")}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isPending ? "Guardando..." : "Guardar Propietario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}