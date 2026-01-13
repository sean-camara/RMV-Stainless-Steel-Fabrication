import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'dark' | 'light';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, variant = 'dark', className = '', ...props }, ref) => {
    const labelColor = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
    const baseInput =
      variant === 'light'
        ? 'bg-white/95 border border-slate-200 text-slate-900 placeholder-slate-500 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)] focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
        : 'bg-slate-700 border text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent';
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium ${labelColor} mb-2`}>
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg
              focus:outline-none transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${baseInput}
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'dark' | 'light';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, variant = 'dark', className = '', ...props }, ref) => {
    const labelColor = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
    const baseTextarea =
      variant === 'light'
        ? 'bg-white/95 border border-slate-200 text-slate-900 placeholder-slate-500 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)] focus:ring-2 focus:ring-slate-500 focus:border-slate-500'
        : 'bg-slate-700 border text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent';
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium ${labelColor} mb-2`}>
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg
            focus:outline-none transition-all duration-200 resize-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${baseTextarea}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  variant?: 'light' | 'dark' | 'minimal';
  placeholder?: string | null;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, variant = 'dark', placeholder = 'Select an option', className = '', ...props }, ref) => {
    const hasEmptyOption = options.some((option) => option.value === '');
    const variantClass = variant === 'dark' ? 'rmv-select--dark' : variant === 'minimal' ? 'rmv-select--minimal' : '';
    const errorClass = error ? 'rmv-select--error' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`rmv-select ${variantClass} ${errorClass} ${className}`}
          {...props}
        >
          {!hasEmptyOption && placeholder !== null && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
