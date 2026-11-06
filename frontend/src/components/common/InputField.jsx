import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Reusable form input field with validation error display and password masking toggle.
 */
export const InputField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  disabled = false,
  Icon = null,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-mono font-medium text-slate-300"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      </div>

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}

        <input
          id={id}
          name={id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full py-2 text-xs font-mono rounded-lg bg-slate-950 border transition-colors focus:outline-none ${
            Icon ? 'pl-9' : 'pl-3'
          } ${isPassword ? 'pr-9' : 'pr-3'} ${
            error
              ? 'border-rose-500/80 text-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-800 text-slate-100 hover:border-slate-700 focus:border-indigo-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] font-mono text-rose-400 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default InputField;

