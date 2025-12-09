// src/components/DeleteConfirmationModal.tsx
import { X, Trash2Icon, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  petName: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  petName, 
  isDeleting = false 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-vet-text/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white border border-vet-danger/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-card">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vet-danger via-red-400 to-vet-danger rounded-t-xl" />
        
        {/* Contenido */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vet-danger/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-vet-danger" />
              </div>
              <h3 className="text-lg font-bold text-vet-text font-montserrat">
                Confirmar eliminación
              </h3>
            </div>
            
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 text-vet-muted hover:text-vet-text transition-colors duration-200 rounded-md hover:bg-vet-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mb-6">
            <p className="text-vet-text mb-2 font-inter">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-bold text-vet-primary">{petName}</span>?
            </p>
            <p className="text-vet-muted text-sm font-inter">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta mascota.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-vet-muted hover:text-vet-text border border-vet-muted/30 hover:border-vet-primary/50 rounded-lg transition-all duration-200 hover:bg-vet-light disabled:opacity-50 disabled:cursor-not-allowed font-medium font-inter"
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-vet-danger hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-vet-danger/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-inter"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2Icon className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Icono decorativo en esquina */}
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-vet-danger rounded-full flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}