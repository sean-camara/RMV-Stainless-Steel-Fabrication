import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'dark' | 'light';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'dark', ...props }) => {
  const baseClass =
    variant === 'light'
      ? 'bg-white border border-slate-200 rounded-lg shadow-sm'
      : 'bg-slate-800 border border-slate-700 rounded-lg shadow-lg';

  return (
    <div
      className={`${baseClass} ${className} ${
        onClick ? 'cursor-pointer hover:border-cyan-500/50 transition-colors' : ''
      }`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', variant = 'dark' }) => {
  const borderClass = variant === 'light' ? 'border-slate-200' : 'border-slate-700';
  return (
    <div className={`px-6 py-4 border-b ${borderClass} ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', variant = 'dark' }) => {
  const textClass = variant === 'light' ? 'text-slate-900' : 'text-white';
  return (
    <h3 className={`text-lg font-semibold ${textClass} ${className}`}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-slate-400 mt-1 ${className}`}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', variant = 'dark' }) => {
  const borderClass = variant === 'light' ? 'border-slate-200' : 'border-slate-700';
  return (
    <div className={`px-6 py-4 border-t ${borderClass} ${className}`}>
      {children}
    </div>
  );
};
