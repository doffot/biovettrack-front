// src/components/owners/EditOwnerform.tsx
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import OwnerForm from "./OwnerForm";
import { useForm } from "react-hook-form";
import type { Owner, OwnerFormData } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOwners } from "../../api/OwnerAPI";
import { toast } from "../Toast";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";

type EditOwnerformProps = {
  data: OwnerFormData;
  ownerId: Owner["_id"];
};

export default function EditOwnerform({ data, ownerId }: EditOwnerformProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: data.name,
      contact: data.contact,
      email: data.email,
      address: data.address,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateOwners,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.refetchQueries({ queryKey: ["editOwners", ownerId] });
      toast.success(data.msg);
      navigate(-1);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForm = (formData: OwnerFormData) => {
    const payload = {
      formData,
      ownerId,
    };
    mutate(payload);
  };

  return (
    <>
      {/* Header con espaciado superior */}
      <div className="mt-30 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Editar Propietario</h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Actualiza la información del propietario
            </p>
          </div>
        </div>
      </div>

      {/* Card única con formulario */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            <form onSubmit={handleSubmit(handleForm)} noValidate>
              <OwnerForm 
                register={register} 
                errors={errors}
                watch={watch}
                setValue={setValue}
              />

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
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
                  {isPending ? "Actualizando..." : "Actualizar Propietario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}