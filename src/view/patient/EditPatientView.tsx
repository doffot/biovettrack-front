// src/views/patients/EditPatientView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  ArrowLeft
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
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando mascota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md mx-auto shadow-sm">
            <PawPrint className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Mascota no encontrada</h2>
            <p className="text-gray-600 mb-6">La mascota que buscas no existe o ha sido eliminada.</p>
            <Link
              to="/patients"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to={`/patients/${patientId}`}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al detalle"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <PawPrint className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Editar {patient.name}
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Actualiza la información de la mascota
                </p>
              </div>
            </div>

            {/* Botón Guardar para desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <button
                onClick={handleSaveData}
                disabled={isPending}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPending ? "Guardando..." : "Guardar Cambios"}
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
            
            {/* Grid de formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nombre - ocupa toda la fila */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">
                  Nombre del paciente <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
                    <PawPrint className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Luna, Max, Rocky..."
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-900 mb-3">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData({ ...formData, birthDate: e.target.value });
                      calculateAge(e.target.value);
                    }}
                    className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium"
                  />
                </div>
                {ageText && (
                  <p className="mt-2 text-xs text-gray-600">
                    Edad: <span className="text-vet-primary font-semibold">{ageText}</span>
                  </p>
                )}
              </div>

              {/* Especie */}
              <div>
                <label htmlFor="species" className="block text-sm font-semibold text-gray-900 mb-3">
                  Especie <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
                    <Bone className="w-4 h-4" />
                  </div>
                  <select
                    id="species"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium appearance-none cursor-pointer"
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
                <label htmlFor="sex" className="block text-sm font-semibold text-gray-900 mb-3">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
                    <Heart className="w-4 h-4" />
                  </div>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="flex-1 bg-transparent text-gray-900 focus:outline-none text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              {/* Raza */}
              <div>
                <label htmlFor="breed" className="block text-sm font-semibold text-gray-900 mb-3">
                  Raza
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    id="breed"
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ej: Labrador, Siamés, Mestizo..."
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Peso */}
              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-gray-900 mb-3">
                  Peso actual
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-vet-light border-gray-200 hover:border-vet-primary focus-within:border-vet-primary transition-all duration-200">
                  <div className="p-2 rounded-lg bg-vet-primary/10 text-vet-primary">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-gray-500 text-sm font-medium">kg</span>
                </div>
              </div>
            </div>

            {/* Botones para móvil */}
            <div className="sm:hidden flex flex-col gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={handleSaveData}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/patients/${patientId}`)}
                className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>

            {/* Botón Cancelar para desktop */}
            <div className="hidden sm:flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(`/patients/${patientId}`)}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}