import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  variant?: 'light' | 'dark' | 'minimal';
  placeholder?: string | null;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, helperText, options, variant = 'light', placeholder = 'Select option', className = '', value, onChange, name, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const labelColor = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
    
    // Find selected label - more robust matching
    const selectedOption = options.find(opt => String(opt.value) === String(value || ''));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (newValue: string) => {
      if (onChange) {
        onChange({ target: { value: newValue, name } });
      }
      setIsOpen(false);
    };

    // Style variants
    const baseButton = variant === 'light'
      ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' 
      : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600';
      
    const dropdownBg = variant === 'light' 
      ? 'bg-white border-slate-200 text-slate-900 shadow-xl border' 
      : 'bg-slate-800 border-slate-700 text-white shadow-xl border';

    const itemHover = variant === 'light'
      ? 'hover:bg-slate-50 text-slate-700'
      : 'hover:bg-slate-700 text-slate-200';

    const itemSelected = variant === 'light'
      ? 'bg-slate-100/50 text-slate-900 font-bold'
      : 'bg-cyan-900/30 text-cyan-400 font-medium';

    return (
      <div className={`w-full ${isOpen ? 'relative z-[9999]' : 'relative z-auto'}`} ref={containerRef}>
        {label && (
           <label className={`block text-sm font-medium ${labelColor} mb-2`}>
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => !props.disabled && setIsOpen(!isOpen)}
            disabled={props.disabled}
            className={`
              w-full px-4 py-2.5 rounded-lg border text-left flex items-center justify-between
              focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${baseButton}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
          >
            <span className={`block truncate ${!selectedOption && !value ? 'text-slate-400 font-normal' : ''}`}>
              {displayLabel}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className={`
              absolute z-[9999] w-full mt-1.5 rounded-lg border overflow-hidden focus:outline-none
              ${dropdownBg}
              animate-in fade-in zoom-in-95 duration-200
            `}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
            >
              <ul className="py-1 max-h-60 overflow-auto custom-scrollbar">
                {placeholder && !options.some(o => o.value === "") && (
                   <li
                    className={`
                      relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors
                      ${!value ? itemSelected : itemHover}
                    `}
                    onClick={() => handleSelect("")}
                   >
                      <span className="block truncate">{placeholder}</span>
                   </li>
                )}
                {options.map((option) => (
                  <li
                    key={option.value}
                    className={`
                      relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors
                      ${String(value) === String(option.value) ? itemSelected : itemHover}
                    `}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="block truncate">
                        {option.label}
                      </span>
                      {String(value) === String(option.value) && (
                        <Check className={`h-4 w-4 ${variant === 'light' ? 'text-slate-900' : 'text-cyan-400'}`} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
