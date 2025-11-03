// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import BackButton from "../../components/BackButton";
import PatientForm from "../../components/patients/PatientForm";
import type { PatientFormData } from "../../types";
import { toast } from "../../components/Toast";
import { createPatient } from "../../api/patientAPI";
import { defaultPhotoFile } from "../../utils/defaultPhoto";
import { useAuth } from "../../hooks/useAuth";

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const { data: vetmain } = useAuth();

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
  photo: undefined,
  mainVet: `${vetmain?.name || ""} ${vetmain?.lastName || ""}`.trim(),
  referringVet: `${vetmain?.name || ""} ${vetmain?.lastName || ""}`.trim(),
},
  });

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
      if (data.weight) form.append("weight", String(data.weight));
      form.append("mainVet", data.mainVet);

      if (data.referringVet && data.referringVet.trim()) {
        form.append("referringVet", data.referringVet);
      }

      if (data.photo && data.photo.length > 0) {
        form.append("photo", data.photo[0]);
      } else {
        const defaultPng = await defaultPhotoFile();
        form.append("photo", defaultPng);
      }

      return await createPatient(form, ownerId);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar mascota");
    },
    onSuccess: () => {
      toast.success("Mascota registrada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      navigate(`/owners/${ownerId}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: PatientFormData) => {
    const processedData = {
      ...data,
      referringVet: data.referringVet && data.referringVet.trim()
        ? data.referringVet
        : vetmain?.name,
    };
    mutate(processedData);
  };

  return (
    <>
      {/* Header con espaciado superior */}
      <div className="mt-10 lg:m-0 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Nueva Mascota</h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Registra la información de la nueva mascota
            </p>
          </div>
        </div>
      </div>

      {/* Card única con formulario */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <PatientForm register={register} errors={errors} setValue={setValue} />

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/owners/${ownerId}`)}
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
                  {isPending ? "Guardando..." : "Guardar Mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}