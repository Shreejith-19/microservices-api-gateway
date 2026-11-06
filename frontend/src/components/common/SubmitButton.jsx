import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable action button with loading spinner state and accessible disabled handling.
 */
export const SubmitButton = ({
  isLoading = false,
  loadingText = 'Processing...',
  children,
  disabled = false,
  Icon = null,
  variant = 'primary',
  type = 'submit',
  onClick,
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
    cyan: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default SubmitButton;

