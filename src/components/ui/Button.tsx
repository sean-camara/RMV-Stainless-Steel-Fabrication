import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  as?: React.ElementType;
  to?: string; // allow Link-like target
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  outline: 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
  ghost: 'text-slate-300 hover:text-white hover:bg-slate-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  as: Component = 'button',
  to,
  ...props
}) => {
  const isNativeButton = Component === 'button' || Component === 'input';

  return (
    <Component
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...(isNativeButton ? { disabled: disabled || loading } : {})}
      {...(to ? { to } : {})}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </Component>
  );
};
