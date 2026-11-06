import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Reusable alert banner for success, error, warning, and info notifications.
 */
export const AlertBanner = ({
  type = 'info',
  title = null,
  message,
  onDismiss = null,
  className = '',
}) => {
  if (!message) return null;

  const configs = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      titleColor: 'text-emerald-200',
      Icon: CheckCircle2,
    },
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      titleColor: 'text-rose-200',
      Icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      titleColor: 'text-amber-200',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-300',
      titleColor: 'text-indigo-200',
      Icon: Info,
    },
  };

  const { bg, border, text, titleColor, Icon } = configs[type] || configs.info;

  return (
    <div
      className={`p-3 rounded-lg border text-xs font-mono flex items-start justify-between gap-3 ${bg} ${border} ${text} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0 flex-1">
          {title && <h4 className={`font-semibold ${titleColor}`}>{title}</h4>}
          <p className="leading-relaxed break-words">{message}</p>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;

