// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, PawPrint } from "lucide-react";
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
      {/* Header Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to={`/owners/${ownerId}`}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al propietario"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <PawPrint className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Nueva Mascota
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Registra la información de la nueva mascota
                </p>
              </div>
            </div>

            {/* Botón Guardar para desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <button
                type="submit"
                form="patient-form"
                disabled={isPending}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPending ? "Guardando..." : "Guardar Mascota"}
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
            <form id="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <PatientForm register={register} errors={errors} setValue={setValue} />

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
                  {isPending ? "Guardando..." : "Guardar Mascota"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(`/owners/${ownerId}`)}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Botón Cancelar para desktop */}
              <div className="hidden sm:flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/owners/${ownerId}`)}
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