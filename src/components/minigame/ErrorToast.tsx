import { useEffect, useState } from 'react';
import { XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'success';

interface ErrorToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // milliseconds
  onClose?: () => void;
}

export default function ErrorToast({ 
  message, 
  type = 'error',
  duration = 3000,
  onClose 
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    success: 'bg-green-500',
  };

  const icons = {
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in-right`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 font-semibold">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
      >
        <XCircle className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Hook để quản lý toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <ErrorToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}

