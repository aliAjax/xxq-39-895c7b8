import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, ToastType } from '../store/useToastStore';

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-error/10 border-error/30 text-error',
  info: 'bg-accent/10 border-accent/30 text-accent',
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-accent',
};

export function ToastContainer() {
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur animate-slide-in ${colorMap[toast.type]}`}
            style={{ minWidth: '280px' }}
          >
            <Icon size={20} className={`flex-shrink-0 ${iconColorMap[toast.type]}`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
            >
              <X size={16} className="opacity-70" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
