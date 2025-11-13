// src/views/patient/components/PhotoModal.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Camera } from "lucide-react";
import type { Patient } from "../../types";
import { updatePatient } from "../../api/patientAPI";
import { toast } from "../Toast";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export default function PhotoModal({ isOpen, onClose, patient }: PhotoModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(patient.photo || null);
  const queryClient = useQueryClient();

  const { mutate: updatePatientPhoto, isPending: isUpdatingPhoto } = useMutation({
    mutationFn: (dataToUpdate: FormData) =>
      updatePatient({ formData: dataToUpdate, patientId: patient._id }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la foto");
    },
    onSuccess: () => {
      toast.success("Foto actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patient", patient._id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onClose();
      setPhoto(null);
      setPreviewImage(patient.photo || null);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPreviewImage(patient.photo || null);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 max-w-sm w-full p-4">
        <h3 className="text-base font-semibold text-vet-text mb-3">
          Cambiar foto
        </h3>

        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 bg-vet-light aspect-square">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer p-1.5 bg-vet-primary hover:bg-vet-secondary rounded transition-colors">
                    <Upload className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors p-3">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 text-center">
                  Seleccionar foto
                </span>
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
            <p className="text-xs text-vet-primary flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-vet-primary rounded-full animate-pulse" />
              Nueva foto seleccionada
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                setPhoto(null);
                setPreviewImage(patient.photo || null);
              }}
              className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200 text-vet-text transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePhoto}
              disabled={isUpdatingPhoto || !photo}
              className="px-3 py-1.5 rounded text-sm bg-vet-primary hover:bg-vet-secondary text-white font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {isUpdatingPhoto ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
              {isUpdatingPhoto ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}