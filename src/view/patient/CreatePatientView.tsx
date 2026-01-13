// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, PawPrint, User, Loader2 } from "lucide-react";
import PatientForm from "../../components/patients/PatientForm";
import type { PatientFormData } from "../../types";
import { toast } from "../../components/Toast";
import { createPatient } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";
import { defaultPhotoFile } from "../../utils/defaultPhoto";
import { useAuth } from "../../hooks/useAuth";

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const { data: vetData } = useAuth();

  // Obtener información del dueño
  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientFormData>({
    defaultValues: {
      name: "",
      birthDate: "",
      species: "",
      breed: "",
      sex: undefined,
      weight: 0,
      color: "",
      identification: "",
      photo: undefined,
      mainVet: "",
      referringVet: "",
    },
  });

  // Establecer el veterinario automáticamente
  useEffect(() => {
    if (vetData?.name) {
      const vetName = `M.V. ${vetData.name} ${vetData.lastName || ""}`.trim();
      setValue("mainVet", vetName);
      setValue("referringVet", vetName);
    }
  }, [vetData, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      if (!ownerId) {
        throw new Error("ID del dueño no encontrado en la URL");
      }

      const form = new FormData();
      form.append("name", data.name);
      form.append("birthDate", data.birthDate);
      form.append("species", data.species);
      form.append("sex", data.sex);
      if (data.breed) form.append("breed", data.breed);
      if (data.color) form.append("color", data.color);
      if (data.identification) form.append("identification", data.identification);
      if (data.weight) form.append("weight", String(data.weight));
      form.append("mainVet", data.mainVet);
      form.append("referringVet", data.referringVet || data.mainVet);

      if (data.photo && data.photo.length > 0) {
        form.append("photo", data.photo[0]);
      } else {
        const defaultPng = await defaultPhotoFile();
        form.append("photo", defaultPng);
      }

      return await createPatient(form, ownerId);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar mascota");
    },
    onSuccess: () => {
      toast.success('Registro completado', 'La mascota ha sido añadida al sistema.');
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      queryClient.invalidateQueries({ queryKey: ["owner", ownerId] });
      navigate(`/owners/${ownerId}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: PatientFormData) => {
    mutate(data);
  };

  return (
    <>
      {/* Header Fijo */}
      <div className="fixed top-16 left-0 right-0 lg:left-64 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Botón Volver */}
            <Link
              to={`/owners/${ownerId}`}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
              title="Volver al propietario"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Información del Header */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Nueva Mascota
                </h1>
                
                {/* Información del dueño */}
                {isLoadingOwner ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Cargando propietario...</span>
                  </div>
                ) : owner ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      Propietario: <span className="font-medium text-gray-700">{owner.name}</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Registra la información de la mascota
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-28 sm:h-24"></div>

      {/* Contenido Principal */}
      <div 
        className={`
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} 
          transition-all duration-500 px-4 sm:px-6 lg:px-8 pb-8
        `}
      >
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Formulario */}
              <div className="p-6">
                <PatientForm 
                  register={register} 
                  errors={errors} 
                  setValue={setValue} 
                />
              </div>

              {/* Footer con botones */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/owners/${ownerId}`)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Guardar Mascota</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}