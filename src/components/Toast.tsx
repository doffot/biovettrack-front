import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Tipos TypeScript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Context para manejar los toasts
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personalizado para usar toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// API simplificada para usar toasts
export const toast = {
  success: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: {
        type: 'success',
        title,
        message,
        ...options
      }
    });
    window.dispatchEvent(event);
  },

  error: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: {
        type: 'error',
        title,
        message,
        ...options
      }
    });
    window.dispatchEvent(event);
  },

  info: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: {
        type: 'info',
        title,
        message,
        ...options
      }
    });
    window.dispatchEvent(event);
  },

  warning: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    const event = new CustomEvent('add-toast', {
      detail: {
        type: 'warning',
        title,
        message,
        ...options
      }
    });
    window.dispatchEvent(event);
  }
};

// Componente individual de Toast (MODIFICADO CON NUEVOS ESTILOS)
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          iconBg: 'bg-green-500',
          iconColor: 'text-white',
          titleColor: 'text-[#10b981]', // Verde brillante
          messageColor: 'text-gray-400',
          icon: CheckCircle,
          bgColor: 'rgba(16, 50, 45, 0.95)', // Fondo verde oscuro
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'error':
        return {
          iconBg: 'bg-red-500',
          iconColor: 'text-white',
          titleColor: 'text-[#ef4444]', // Rojo brillante
          messageColor: 'text-gray-400',
          icon: AlertCircle,
          bgColor: 'rgba(50, 20, 30, 0.95)', // Fondo rojo oscuro
          borderColor: 'rgba(239, 68, 68, 0.3)'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-500',
          iconColor: 'text-white',
          titleColor: 'text-[#f59e0b]', // Amarillo brillante
          messageColor: 'text-gray-400',
          icon: AlertTriangle,
          bgColor: 'rgba(50, 40, 20, 0.95)', // Fondo amarillo oscuro
          borderColor: 'rgba(245, 158, 11, 0.3)'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500',
          iconColor: 'text-white',
          titleColor: 'text-[#3b82f6]', // Azul brillante
          messageColor: 'text-gray-400',
          icon: Info,
          bgColor: 'rgba(20, 30, 50, 0.95)', // Fondo azul oscuro
          borderColor: 'rgba(59, 130, 246, 0.3)'
        };
      default:
        return {
          iconBg: 'bg-gray-500',
          iconColor: 'text-white',
          titleColor: 'text-gray-300',
          messageColor: 'text-gray-400',
          icon: Info,
          bgColor: 'rgba(30, 30, 40, 0.95)',
          borderColor: 'rgba(107, 114, 128, 0.3)'
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isRemoving 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
        }
        ${isRemoving ? 'opacity-0 scale-95 -translate-y-2' : ''}
      `}
    >
      <div 
        className="rounded-lg shadow-xl max-w-xs min-w-[280px] relative overflow-hidden"
        style={{
          backgroundColor: styles.bgColor,
          borderWidth: '1px',
          borderColor: styles.borderColor
        }}
      >        
        <div className="flex items-start gap-3 p-4">
          <div className={`${styles.iconBg} ${styles.iconColor} flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md`}>
            <IconComponent size={16} />
          </div>
          
          <div className="flex-1 min-w-0 pr-1">
            <h4 className={`font-semibold ${styles.titleColor} text-sm leading-5 mb-0.5`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className={`${styles.messageColor} text-xs leading-4 opacity-90`}>
                {toast.message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-800/50"
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Contenedor de toasts
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

// Provider de toasts
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, ...toastData };
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Escuchar eventos globales de toast
  useEffect(() => {
    const handleAddToast = (event: CustomEvent) => {
      addToast(event.detail);
    };

    window.addEventListener('add-toast', handleAddToast as EventListener);
    
    return () => {
      window.removeEventListener('add-toast', handleAddToast as EventListener);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};