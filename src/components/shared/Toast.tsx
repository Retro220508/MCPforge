import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore, type Notification } from '../../store/appStore';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-white border-emerald-200 shadow-emerald-100',
  error: 'bg-white border-red-200 shadow-red-100',
  warning: 'bg-white border-amber-200 shadow-amber-100',
  info: 'bg-white border-blue-200 shadow-blue-100',
};

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

function ToastItem({ notification }: { notification: Notification }) {
  const { dispatch } = useAppStore();
  const Icon = icons[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id });
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, dispatch]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all',
        styles[notification.type]
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', iconStyles[notification.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{notification.message}</p>
      </div>
      <button
        onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id })}
        className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { state } = useAppStore();
  if (state.notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {state.notifications.map((n) => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
