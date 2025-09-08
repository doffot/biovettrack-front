import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { getPatientById, updatePatient } from "../../api/patientAPI";
import { PawPrint, CalendarDays, Scale, Bone, Tag, Upload, Save, X, Heart } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";

export default function PatientDetailView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    species: '',
    sex: '',
    breed: '',
    weight: 0,
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setPreviewImage(patient.photo || null);
      setFormData({
        name: patient.name,
        birthDate: patient.birthDate.split('T')[0],
        species: patient.species,
        sex: patient.sex,
        breed: patient.breed || '',
        weight: patient.weight || 0,
      });
    }
  }, [patient]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mutación para actualizar paciente
  const { mutate: updatePatientData, isPending } = useMutation({
    mutationFn: (dataToUpdate: FormData) => updatePatient({ formData: dataToUpdate, patientId: patient!._id }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la mascota");
    },
    onSuccess: () => {
      toast.success("Información actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients", patient!.owner] });
      setPhoto(null);
        navigate(`/owners/${patient?.owner}`);
    },
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-coral-pulse/20 rounded-full flex items-center justify-center animate-spin">
            <PawPrint className="w-8 h-8 text-coral-pulse" />
          </div>
          <p className="text-coral-pulse">Cargando mascota...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger">Mascota no encontrada</p>
        </div>
      </div>
    );
  }

  const calculateAge = () => {
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (years > 0) return `${years} año${years !== 1 ? 's' : ''}`;
    if (months > 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
    return `${Math.max(0, days)} día${days !== 1 ? 's' : ''}`;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveData = () => {
    const dataToUpdate = new FormData();
    
    // Agregar foto si hay una nueva
    if (photo) {
      dataToUpdate.append("photo", photo);
    }
    
    // Agregar campos de texto que hayan cambiado
    if (formData.name !== patient.name) dataToUpdate.append("name", formData.name);
    if (formData.birthDate !== patient.birthDate.split('T')[0]) dataToUpdate.append("birthDate", formData.birthDate);
    if (formData.species !== patient.species) dataToUpdate.append("species", formData.species);
    if (formData.sex !== patient.sex) dataToUpdate.append("sex", formData.sex);
    if (formData.breed !== (patient.breed || '')) dataToUpdate.append("breed", formData.breed);
    if (formData.weight !== (patient.weight || 0)) dataToUpdate.append("weight", String(formData.weight));

    if (Array.from(dataToUpdate.entries()).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updatePatientData(dataToUpdate);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-coral-pulse/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-coral-pulse/10 rounded-full blur-3xl animate-float" />
      </div>

      <FloatingParticles />
      
      <div className="fixed top-6 left-6 z-50">
        <BackButton />
      </div>

      <div className="relative pt-20 px-4 sm:px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className={`transform transition-all duration-1200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-coral-pulse/20 to-lavender-fog/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100" />
              <div className="relative bg-space-navy/80 backdrop-blur-xl border-2 border-coral-pulse/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
                
                {/* Header Content */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Foto de la mascota */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <img 
                        src={previewImage || "/img/default-pet.png"} 
                        alt={patient.name} 
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border-4 border-coral-pulse/30 shadow-xl"
                      />
                      <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                      </label>
                    </div>
                    
                    {/* Indicador de foto pendiente */}
                    {photo && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-coral-pulse/20 text-coral-pulse text-xs rounded-full">
                          <div className="w-2 h-2 bg-coral-pulse rounded-full animate-pulse" />
                          Foto pendiente
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información principal */}
                  <div className="flex-1 text-center sm:text-left space-y-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl sm:text-4xl font-bold bg-transparent text-white border-b-2 border-coral-pulse focus:outline-none w-full text-center sm:text-left"
                      placeholder="Nombre de la mascota"
                    />
                    
                    <p className="text-lavender-fog/90 text-base sm:text-lg">
                      {patient.species} • {calculateAge()} • {patient.sex}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className={`transform transition-all duration-1200 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
            <div className="bg-space-navy/80 backdrop-blur-xl border-2 border-coral-pulse/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-misty-lilac mb-6 sm:mb-8 flex items-center gap-3">
                <PawPrint className="w-6 h-6 sm:w-7 sm:h-7 text-coral-pulse" /> 
                Información del Paciente
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* Fecha de nacimiento */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lavender-fog">
                    <CalendarDays className="w-5 h-5 text-coral-pulse" />
                    <label className="font-medium">Fecha de nacimiento</label>
                  </div>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-space-navy/50 text-misty-lilac border border-coral-pulse/30 focus:outline-none focus:border-coral-pulse focus:ring-2 focus:ring-coral-pulse/20"
                  />
                </div>

                {/* Especie */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lavender-fog">
                    <Bone className="w-5 h-5 text-coral-pulse" />
                    <label className="font-medium">Especie</label>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.species}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                      className="w-full p-3 rounded-xl bg-space-navy/50 text-misty-lilac border border-coral-pulse/30 focus:outline-none focus:border-coral-pulse focus:ring-2 focus:ring-coral-pulse/20 appearance-none cursor-pointer pr-10"
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
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-coral-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Raza */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lavender-fog">
                    <Tag className="w-5 h-5 text-coral-pulse" />
                    <label className="font-medium">Raza</label>
                  </div>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full p-3 rounded-xl bg-space-navy/50 text-misty-lilac border border-coral-pulse/30 focus:outline-none focus:border-coral-pulse focus:ring-2 focus:ring-coral-pulse/20"
                    placeholder="Ej: Labrador, Mestizo, etc."
                  />
                </div>

                {/* Peso */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lavender-fog">
                    <Scale className="w-5 h-5 text-coral-pulse" />
                    <label className="font-medium">Peso (kg)</label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 rounded-xl bg-space-navy/50 text-misty-lilac border border-coral-pulse/30 focus:outline-none focus:border-coral-pulse focus:ring-2 focus:ring-coral-pulse/20 pr-12"
                      placeholder="0.0"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lavender-fog text-sm pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>

                {/* Sexo */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center gap-3 text-lavender-fog">
                    <Heart className="w-5 h-5 text-coral-pulse" />
                    <label className="font-medium">Sexo</label>
                  </div>
                  <div className="relative max-w-md">
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full p-3 rounded-xl bg-space-navy/50 text-misty-lilac border border-coral-pulse/30 focus:outline-none focus:border-coral-pulse focus:ring-2 focus:ring-coral-pulse/20 appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Selecciona sexo</option>
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-coral-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Guardar */}
              <div className="flex justify-center mt-8 sm:mt-12">
                <button
                  onClick={handleSaveData}
                  disabled={isPending}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 
                           bg-gradient-to-r from-coral-pulse to-coral-pulse/90 text-white font-bold text-base sm:text-lg
                           rounded-2xl border-2 border-coral-pulse/50 
                           hover:from-coral-pulse/90 hover:to-coral-pulse hover:scale-105 
                           focus:outline-none focus:ring-4 focus:ring-coral-pulse/20
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-coral-pulse/50 to-coral-pulse/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}