// src/views/patients/EditPatientView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { getPatientById, updatePatient } from "../../api/patientAPI";
import {
  PawPrint,
  CalendarDays,
  Scale,
  Tag,
  Save,
  Heart,
  Bone,
} from "lucide-react";
import BackButton from "../../components/BackButton";

export default function EditPatientView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    species: "",
    sex: "",
    breed: "",
    weight: 0,
  });

  const [ageText, setAgeText] = useState<string>('');

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  useEffect(() => {
    if (patient) {
      const birthDate = patient.birthDate.split("T")[0];
      setFormData({
        name: patient.name,
        birthDate,
        species: patient.species,
        sex: patient.sex,
        breed: patient.breed || "",
        weight: patient.weight || 0,
      });
      calculateAge(birthDate);
    }
  }, [patient]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: updatePatientData, isPending } = useMutation({
    mutationFn: (dataToUpdate: FormData) =>
      updatePatient({ formData: dataToUpdate, patientId: patient!._id }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la mascota");
    },
    onSuccess: () => {
      toast.success("Información actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate(`/patients/${patientId}`);
    },
  });

  const calculateAge = (dateString: string) => {
    if (!dateString) {
      setAgeText('');
      return;
    }

    const today = new Date();
    const birthDate = new Date(dateString);
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    let text = '';

    if (years > 0) {
      text = `${years} año${years !== 1 ? 's' : ''}`;
      if (months > 0) {
        text += ` y ${months} mes${months !== 1 ? 'es' : ''}`;
      }
    } else if (months > 0) {
      text = `${months} mes${months !== 1 ? 'es' : ''}`;
      if (days > 0) {
        text += ` y ${days} día${days !== 1 ? 's' : ''}`;
      }
    } else {
      const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      text = `${totalDays} día${totalDays !== 1 ? 's' : ''}`;
    }

    setAgeText(text);
  };

  const handleSaveData = () => {
    const dataToUpdate = new FormData();

    if (formData.name !== patient?.name) dataToUpdate.append("name", formData.name);
    if (formData.birthDate !== patient?.birthDate.split("T")[0])
      dataToUpdate.append("birthDate", formData.birthDate);
    if (formData.species !== patient?.species)
      dataToUpdate.append("species", formData.species);
    if (formData.sex !== patient?.sex) dataToUpdate.append("sex", formData.sex);
    if (formData.breed !== (patient?.breed || ""))
      dataToUpdate.append("breed", formData.breed);
    if (formData.weight !== (patient?.weight || 0))
      dataToUpdate.append("weight", String(formData.weight));

    if (Array.from(dataToUpdate.entries()).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updatePatientData(dataToUpdate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Cargando mascota...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Mascota no encontrada</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mt-30 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Editar Mascota</h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Actualiza la información de {patient.name}
            </p>
          </div>
        </div>
      </div>

      {/* Card con formulario */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            
            {/* Grid de formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nombre - ocupa toda la fila */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Nombre del paciente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PawPrint className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Luna, Max, Rocky..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200 mb-2">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData({ ...formData, birthDate: e.target.value });
                      calculateAge(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                {ageText && (
                  <p className="mt-1 text-xs text-gray-400">
                    Edad: <span className="text-blue-400 font-semibold">{ageText}</span>
                  </p>
                )}
              </div>

              {/* Especie */}
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-200 mb-2">
                  Especie <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Bone className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="species"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona una especie</option>
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Hurón">Hurón</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Sexo */}
              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-200 mb-2">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heart className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              {/* Raza */}
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-200 mb-2">
                  Raza
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="breed"
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ej: Labrador, Siamés, Mestizo..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Peso */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-200 mb-2">
                  Peso actual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 mt-6">
              <button
                type="button"
                onClick={() => navigate(`/patients/${patientId}`)}
                className="px-4 sm:px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveData}
                disabled={isPending}
                className="px-4 sm:px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}