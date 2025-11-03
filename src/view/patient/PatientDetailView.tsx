// src/views/patients/PatientDetailView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { getPatientById, deletePatient, updatePatient } from "../../api/patientAPI";
import {
  PawPrint,
  Heart,
  Edit,
  Trash2,
  TestTube,
  User,
  Scissors,
  Calendar,
  Weight,
  Upload,
  X,
  Camera,
} from "lucide-react";
import BackButton from "../../components/BackButton";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getOwnersById } from "../../api/OwnerAPI";

export default function PatientDetailView() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["owner", patient?.owner],
    queryFn: () => getOwnersById(patient?.owner!),
    enabled: !!patient?.owner,
  });

  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePatient(patientId!),
    onError: (error: Error) => {
      toast.error(error.message);
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  const { mutate: updatePatientPhoto, isPending: isUpdatingPhoto } = useMutation({
    mutationFn: (dataToUpdate: FormData) =>
      updatePatient({ formData: dataToUpdate, patientId: patientId! }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la foto");
    },
    onSuccess: () => {
      toast.success("Foto actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowPhotoModal(false);
      setPhoto(null);
      setPreviewImage(null);
    },
  });

  useEffect(() => {
    if (patient) {
      setPreviewImage(patient.photo || null);
    }
  }, [patient]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPreviewImage(patient?.photo || null);
    setPhoto(null);
  };

  const handleSavePhoto = () => {
    if (!photo) {
      toast.info("No hay foto nueva para guardar");
      return;
    }

    const dataToUpdate = new FormData();
    dataToUpdate.append("photo", photo);
    updatePatientPhoto(dataToUpdate);
  };

  const calculateAge = () => {
    const birthDate = new Date(patient!.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (years > 0) return `${years} año${years !== 1 ? "s" : ""}`;
    if (months > 0) return `${months} mes${months !== 1 ? "es" : ""}`;
    return `${Math.max(0, days)} día${days !== 1 ? "s" : ""}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    removePatient();
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-500">Cargando mascota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-gray-800 p-6 rounded-xl border border-red-500/30 text-center max-w-md mx-auto">
            <PawPrint className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Mascota no encontrada
            </h2>
            <p className="text-gray-400">
              La mascota que buscas no existe o ha sido eliminada
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mt-10 lg:mt-0 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {patient.name}
          </h1>
          <span className="hidden sm:inline text-gray-400 text-sm">
            Información completa de la mascota
          </span>
        </div>
      </div>

      {/* Contenedor principal */}
      <div
        className={`-mx-4 lg:-mx-0 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } transition-all duration-500`}
      >
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Columna izquierda: Foto y acciones */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0 space-y-4 lg:space-y-6 mx-4 lg:mx-0">
            {/* Tarjeta de foto */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {patient.photo ? (
                <div className="relative group">
                  <img
                    src={patient.photo}
                    alt={patient.name}
                    className="w-full aspect-square object-cover"
                  />
                  {/* Overlay para cambiar foto */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Cambiar foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-700 flex items-center justify-center">
                  <PawPrint className="w-24 h-24 text-red-500/30" />
                </div>
              )}

              <div className="p-4 sm:p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {patient.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md font-medium">
                    {patient.species}
                  </span>
                  <span>•</span>
                  <span>
                    {patient.sex === "Macho" ? "♂ Macho" : "♀ Hembra"}
                  </span>
                  <span>•</span>
                  <span>{calculateAge()}</span>
                </div>

                {/* Botón para cambiar foto cuando no hay imagen */}
                {!patient.photo && (
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Agregar foto
                  </button>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Acciones
              </h3>

              <div className="space-y-3">
                <Link
                  to={`/patients/edit/${patient._id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar información
                </Link>

                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium text-sm transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Cambiar foto
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? "Eliminando..." : "Eliminar mascota"}
                </button>

                <div className="pt-3 border-t border-gray-700">
                  <Link
                    to={`/patients/${patientId}/lab-exams`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium text-sm transition-colors"
                  >
                    <TestTube className="w-4 h-4" />
                    Exámenes de laboratorio
                  </Link>
                </div>

                <Link
                  to={`/patients/${patientId}/grooming-services/create`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium text-sm transition-colors"
                >
                  <Scissors className="w-4 h-4" />
                  Servicio de peluquería
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha: Información detallada */}
          <div className="flex-1 space-y-4 lg:space-y-6 mx-4 lg:mx-0">
            {/* Información general */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">
                  Información General
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <p className="text-xs text-gray-400 font-medium">
                      Fecha de nacimiento
                    </p>
                  </div>
                  <p className="text-white font-semibold">
                    {formatDate(patient.birthDate)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {calculateAge()} de edad
                  </p>
                </div>

                {patient.weight && (
                  <div className="p-4 rounded-lg bg-gray-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Weight className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-gray-400 font-medium">
                        Peso actual
                      </p>
                    </div>
                    <p className="text-white font-semibold text-2xl">
                      {patient.weight}{" "}
                      <span className="text-base text-gray-400">kg</span>
                    </p>
                  </div>
                )}

                {patient.breed && (
                  <div className="p-4 rounded-lg bg-gray-700/30 sm:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <PawPrint className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-gray-400 font-medium">Raza</p>
                    </div>
                    <p className="text-white font-semibold">{patient.breed}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del propietario */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-white">Propietario</h2>
              </div>

              {isLoadingOwner ? (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-700/30 animate-pulse">
                  <div className="w-12 h-12 bg-gray-600 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-3/4" />
                    <div className="h-3 bg-gray-600 rounded w-1/2" />
                  </div>
                </div>
              ) : owner ? (
                <>
                  <div className="p-4 rounded-lg bg-gray-700/30 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                        <span className="text-green-500 font-bold">
                          {owner.name
                            ? owner.name
                                .split(" ")
                                .map((n: string) => n.charAt(0))
                                .join("")
                                .toUpperCase()
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {owner.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Propietario responsable
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pl-16">
                      <p className="text-sm text-gray-400">
                        <span className="text-gray-500">Teléfono:</span>{" "}
                        {owner.contact}
                      </p>
                      {owner.email && (
                        <p className="text-sm text-gray-400">
                          <span className="text-gray-500">Email:</span>{" "}
                          {owner.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/owners/${owner._id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium text-sm transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Ver perfil completo
                  </Link>
                </>
              ) : (
                <div className="text-center text-gray-400 py-6">
                  No se encontró información del propietario
                </div>
              )}
            </div>

            {/* Médico Veterinario */}
            {patient.referringVet && (
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-bold text-white">
                    Médico Veterinario
                  </h2>
                </div>

                <div className="p-4 rounded-lg bg-gray-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {patient.referringVet}
                      </p>
                      <p className="text-sm text-gray-400">
                        Responsable del paciente
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para cambiar foto */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">Cambiar foto</h3>
            
            <div className="space-y-4">
              {/* Preview de la foto */}
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-700/30 group aspect-square">
                {previewImage ? (
                  <>
                    <img 
                      src={previewImage} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                        <Upload className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors p-4">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400 text-center">Seleccionar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {photo && (
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Nueva foto seleccionada
                </p>
              )}

              {/* Botones del modal */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPhotoModal(false);
                    setPhoto(null);
                    setPreviewImage(patient.photo || null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePhoto}
                  disabled={isUpdatingPhoto || !photo}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                >
                  {isUpdatingPhoto ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  {isUpdatingPhoto ? "Guardando..." : "Guardar Foto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        petName={patient.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}