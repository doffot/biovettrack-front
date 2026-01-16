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
  ArrowLeft,
  Palette,
  MapPin
} from "lucide-react";

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
    color: "", 
    identification: "", 
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
        color: patient.color || "",
        identification: patient.identification || "", 
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
      toast.success(`"${patient?.name}" actualizado/a`, 'Los datos han sido guardados correctamente.');
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
    if (formData.color !== (patient?.color || ""))
      dataToUpdate.append("color", formData.color);
    if (formData.identification !== (patient?.identification || ""))
      dataToUpdate.append("identification", formData.identification);

    if (Array.from(dataToUpdate.entries()).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updatePatientData(dataToUpdate);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-3 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-vet-text)] font-medium">Cargando mascota...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] text-center max-w-sm w-full">
          <PawPrint className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h2 className="text-xl font-semibold text-[var(--color-vet-text)] mb-2">Mascota no encontrada</h2>
          <p className="text-[var(--color-vet-muted)] text-sm mb-4">La mascota que buscas no existe o ha sido eliminada.</p>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Minimalista */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-[var(--color-card)] border-b border-[var(--color-border)]">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={`/patients/${patientId}`}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
                title="Volver al detalle"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[var(--color-vet-primary)]/10 rounded border border-[var(--color-vet-primary)]/20">
                  <PawPrint className="w-4 h-4 text-[var(--color-vet-accent)]" />
                </div>
                <h1 className="text-lg font-semibold text-[var(--color-vet-text)]">
                  Editar {patient.name}
                </h1>
              </div>
            </div>

            <button
              onClick={handleSaveData}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-colors text-sm disabled:opacity-50"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* Espaciador para el header */}
      <div className="h-16"></div>

      {/* Formulario Minimalista */}
      <div className={`${mounted ? "opacity-100" : "opacity-0"} transition-opacity duration-300 px-4 sm:px-6 lg:px-8 pb-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {/* Grid de formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre - ocupa toda la fila */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <PawPrint className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre de la mascota"
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] text-sm"
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Fecha de nacimiento <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      handleInputChange("birthDate", e.target.value);
                      calculateAge(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm"
                  />
                </div>
                {ageText && (
                  <p className="mt-1 text-xs text-[var(--color-vet-muted)]">
                    Edad: <span className="text-[var(--color-vet-accent)] font-medium">{ageText}</span>
                  </p>
                )}
              </div>

              {/* Especie */}
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Especie <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)] z-10">
                    <Bone className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.species}
                    onChange={(e) => handleInputChange("species", e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Seleccionar especie</option>
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Hurón">Hurón</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-[var(--color-vet-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sexo */}
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Sexo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)] z-10">
                    <Heart className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleInputChange("sex", e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Seleccionar sexo</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-[var(--color-vet-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Raza */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Raza
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    placeholder="Raza o mestizo"
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] text-sm"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Color
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <Palette className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="Ej: Negro, Blanco y marrón..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] text-sm"
                  />
                </div>
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Señas o Marcas
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.identification}
                    onChange={(e) => handleInputChange("identification", e.target.value)}
                    placeholder="Ej: Mancha en el ojo, Cicatriz..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] text-sm"
                  />
                </div>
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
                  Peso actual
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)]">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight || ""}
                    onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                    className="w-full pl-10 pr-12 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] text-sm"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-vet-muted)] text-sm font-medium">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Botones inferiores */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => navigate(`/patients/${patientId}`)}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-hover)] text-[var(--color-vet-text)] font-medium transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveData}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-all disabled:opacity-50 text-sm"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}