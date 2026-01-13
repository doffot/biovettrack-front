// src/components/ConfirmationModal.tsx
import { X, AlertTriangle, AlertCircle, Info, type LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalVariant = "danger" | "warning" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: LucideIcon;
  variant?: ModalVariant;
  isLoading?: boolean;
  loadingText?: string;
}

const variantStyles: Record<ModalVariant, {
  gradientColor: string;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonShadow: string;
  cornerBg: string;
  borderColor: string;
  Icon: LucideIcon;
}> = {
  danger: {
    gradientColor: "from-vet-danger via-red-400 to-vet-danger",
    iconBg: "bg-vet-danger/15",
    iconColor: "text-vet-danger",
    buttonBg: "bg-vet-danger",
    buttonHover: "hover:bg-red-600",
    buttonShadow: "hover:shadow-vet-danger/30",
    cornerBg: "bg-vet-danger",
    borderColor: "border-vet-danger/30",
    Icon: AlertTriangle,
  },
  warning: {
    gradientColor: "from-amber-500 via-amber-400 to-amber-500",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-500",
    buttonHover: "hover:bg-amber-600",
    buttonShadow: "hover:shadow-amber-500/30",
    cornerBg: "bg-amber-500",
    borderColor: "border-amber-500/30",
    Icon: AlertCircle,
  },
  info: {
    gradientColor: "from-vet-primary via-vet-accent to-vet-primary",
    iconBg: "bg-vet-primary/15",
    iconColor: "text-vet-primary",
    buttonBg: "bg-vet-primary",
    buttonHover: "hover:bg-vet-secondary",
    buttonShadow: "hover:shadow-vet-primary/30",
    cornerBg: "bg-vet-primary",
    borderColor: "border-vet-primary/30",
    Icon: Info,
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmIcon: ConfirmIcon,
  variant = "info",
  isLoading = false,
  loadingText = "Procesando...",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const VariantIcon = styles.Icon;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-vet-text/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white ${styles.borderColor} border rounded-xl p-6 max-w-md w-full mx-4 shadow-card animate-scale-in`}>
        {/* Barra superior decorativa */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.gradientColor} rounded-t-xl`} />

        {/* Contenido */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                <VariantIcon className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-vet-text font-montserrat">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 text-vet-muted hover:text-vet-text transition-colors duration-200 rounded-md hover:bg-vet-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mb-6">
            {typeof message === "string" ? (
              <p className="text-vet-text font-inter">{message}</p>
            ) : (
              message
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-vet-muted hover:text-vet-text border border-vet-muted/30 hover:border-vet-primary/50 rounded-lg transition-all duration-200 hover:bg-vet-light disabled:opacity-50 disabled:cursor-not-allowed font-medium font-inter"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 ${styles.buttonBg} ${styles.buttonHover} text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg ${styles.buttonShadow} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-inter`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  {ConfirmIcon && <ConfirmIcon className="w-4 h-4" />}
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Icono decorativo en esquina */}
        <div className={`absolute -top-3 -right-3 w-6 h-6 ${styles.cornerBg} rounded-full flex items-center justify-center shadow-lg`}>
          <VariantIcon className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}