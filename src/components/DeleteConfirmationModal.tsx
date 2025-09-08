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
      {/* Overlay con backdrop blur */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-radial-center backdrop-blur-sm bg-background/90 border border-danger/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-premium">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-danger/5 to-transparent animate-shimmer opacity-70 rounded-xl" />
        
        {/* Contenido */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="text-lg font-bold text-text">Confirmar eliminación</h3>
            </div>
            
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 text-muted hover:text-text transition-colors duration-200 rounded-md hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mb-6">
            <p className="text-text mb-2">
              ¿Estás seguro de que deseas eliminar a <span className="font-bold text-primary">{petName}</span>?
            </p>
            <p className="text-muted text-sm">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta mascota.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-muted hover:text-text border border-muted/30 hover:border-muted/50 rounded-lg transition-all duration-200 hover:bg-muted/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-danger/90 hover:bg-danger text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-danger/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        {/* Punto de animación */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-danger rounded-full animate-neon-pulse opacity-60" />
      </div>
    </div>
  );
}