import { useBlockchain } from '../../context/BlockchainContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useBlockchain();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
        const iconColor = isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-cyan-400';
        const borderColor = isSuccess ? 'border-emerald-500/30' : isError ? 'border-red-500/30' : 'border-cyan-500/30';

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900/90 backdrop-blur-xl border ${borderColor} rounded-xl shadow-apple-hover text-slate-100 transition-[opacity,transform] duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} strokeWidth={2} />
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold text-white tracking-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 break-words line-clamp-3 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-[color,background-color] duration-150 enabled:active:scale-[0.96]"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

