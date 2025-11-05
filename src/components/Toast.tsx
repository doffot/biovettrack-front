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

// Componente individual de Toast
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
          textColor: 'text-white',
          messageColor: 'text-gray-300',
          icon: CheckCircle
        };
      case 'error':
        return {
          iconBg: 'bg-red-500',
          iconColor: 'text-white',
          textColor: 'text-white',
          messageColor: 'text-gray-300',
          icon: AlertCircle
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-500',
          iconColor: 'text-white',
          textColor: 'text-white',
          messageColor: 'text-gray-300',
          icon: AlertTriangle
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500',
          iconColor: 'text-white',
          textColor: 'text-white',
          messageColor: 'text-gray-300',
          icon: Info
        };
      default:
        return {
          iconBg: 'bg-gray-500',
          iconColor: 'text-white',
          textColor: 'text-white',
          messageColor: 'text-gray-300',
          icon: Info
        };
    }
  };

const getBackgroundGradient = () => {
  switch (toast.type) {
    case 'success':
      return {
        background:
          'linear-gradient(90deg, rgba(34, 197, 94, 0.45) 0%, rgba(55, 65, 81, 1) 50%, rgba(55, 65, 81, 1) 100%)'
      };
    case 'error':
      return {
        background:
          'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(55, 65, 81, 1) 50%, rgba(55, 65, 81, 1) 100%)'
      };
    case 'warning':
      return {
        background:
          'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(55, 65, 81, 1) 50%, rgba(55, 65, 81, 1) 100%)'
      };
    case 'info':
      return {
        background:
          'linear-gradient(90deg, rgba(59, 130, 246, 0.25) 0%, rgba(55, 65, 81, 1) 50%, rgba(55, 65, 81, 1) 100%)'
      };
    default:
      return {
        background:
          'linear-gradient(90deg, rgba(107, 114, 128, 0.25) 0%, rgba(55, 65, 81, 1) 50%, rgba(55, 65, 81, 1) 100%)'
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
        className="rounded-lg shadow-2xl min-w-80 max-w-md relative overflow-hidden"
        style={getBackgroundGradient()}
      >        
        <div className="flex items-start gap-3 p-4">
          <div className={`
            ${styles.iconBg} ${styles.iconColor}
            flex-shrink-0 w-8 h-8 rounded-full 
            flex items-center justify-center
            shadow-lg
          `}>
            <IconComponent size={18} />
          </div>
          
          <div className="flex-1 min-w-0 pr-2">
            <h4 className={`font-semibold ${styles.textColor} text-sm leading-5 mb-1`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className={`${styles.messageColor} text-xs leading-4`}>
                {toast.message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            aria-label="Cerrar notificación"
          >
            <X size={16} />
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

