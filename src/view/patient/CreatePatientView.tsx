// src/views/patients/CreatePatientView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, PawPrint, Sparkles, Heart } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";
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
      mainVet: vetmain?.name || "",
      referringVet: vetmain?.name || "",
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
    <div className="relative mt-20 min-h-screen bg-gradient-dark overflow-hidden">
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

      <FloatingParticles />

      {/* Botón regresar */}
      <div className="fixed top-22 left-7 z-150">
        <BackButton />
      </div>

      {/* Header con título simple */}
      <div className="relative z-10 pt-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col items-center gap-6 transform transition-all duration-1000 delay-200 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/30 px-6 py-4 inline-flex items-center gap-3 xl:min-w-[400px] xl:max-w-[480px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10 flex flex-col items-center gap-3 justify-center w-full">
                <div className="p-3 rounded-xl bg-black/20 text-primary mx-auto mb-3 w-fit">
                  <PawPrint className="w-8 h-8 xl:w-10 xl:h-10" />
                </div>
                <h1 className="text-3xl  xl:text-3xl font-bold text-text mb-1">
                  Nueva Mascota
                </h1>
                <p className="text-muted text-sm">
                  Registros de Mascotas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="relative z-10 px-4 sm:px-6 pb-20 mt-12">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transform transition-all duration-1000 delay-400 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="grid gap-6 sm:gap-8">
              <div className="tile-entrance">
                <div className="relative overflow-hidden rounded-2xl xl:rounded-3xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 shadow-premium p-6 xl:p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <PatientForm register={register} errors={errors} setValue={setValue} />

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        type="submit"
                        disabled={isPending}
                        onClick={handleSubmit(onSubmit)}
                        className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                        <div className="relative z-10 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black/20 text-primary">
                            <Save className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-text font-bold text-sm sm:text-base">
                              {isPending ? "Guardando..." : "Guardar Mascota"}
                            </div>
                            <div className="text-muted text-xs sm:text-sm">
                              {isPending ? "Procesando..." : "Crear nuevo registro"}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}