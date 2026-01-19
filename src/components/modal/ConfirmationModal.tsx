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
  borderColor: string;
  Icon: LucideIcon;
}> = {
  danger: {
    gradientColor: "from-red-600 via-red-500 to-red-600",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    buttonBg: "bg-red-600",
    buttonHover: "hover:bg-red-700",
    buttonShadow: "hover:shadow-red-600/30",
    borderColor: "border-red-500/30",
    Icon: AlertTriangle,
  },
  warning: {
    gradientColor: "from-amber-600 via-amber-500 to-amber-600",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    buttonShadow: "hover:shadow-amber-600/30",
    borderColor: "border-amber-500/30",
    Icon: AlertCircle,
  },
  info: {
    gradientColor: "from-vet-primary via-vet-accent to-vet-primary",
    iconBg: "bg-vet-primary/10",
    iconColor: "text-vet-primary",
    buttonBg: "bg-vet-primary",
    buttonHover: "hover:bg-vet-secondary",
    buttonShadow: "hover:shadow-vet-primary/30",
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-card border ${styles.borderColor} rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in`}>
        {/* Barra superior decorativa */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${styles.gradientColor} rounded-t-2xl`} />

        {/* Contenido */}
        <div className="relative z-10 pt-2">
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
              className="p-2 text-vet-muted hover:text-vet-text transition-colors duration-200 rounded-lg hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mb-6 pl-[52px]">
            {typeof message === "string" ? (
              <p className="text-vet-text font-inter">{message}</p>
            ) : (
              message
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-vet-muted hover:text-vet-text border border-border hover:border-vet-muted/50 rounded-lg transition-all duration-200 hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 text-sm text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${styles.buttonBg} ${styles.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}