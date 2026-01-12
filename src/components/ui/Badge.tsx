import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-600 text-slate-200',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  secondary: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Status badge with predefined colors for common statuses
interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariants: Record<string, BadgeProps['variant']> = {
  // Appointment statuses
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
  no_show: 'error',
  
  // Project statuses
  blueprint_pending: 'warning',
  blueprint_uploaded: 'info',
  client_approved: 'success',
  client_rejected: 'error',
  dp_pending: 'warning',
  in_fabrication: 'info',
  fabrication_done: 'success',
  ready_for_pickup: 'info',
  released: 'success',
  
  // Payment statuses
  payment_pending: 'warning',
  payment_verified: 'success',
  payment_rejected: 'error',
  
  // User statuses
  active: 'success',
  inactive: 'error',
  verified: 'success',
  unverified: 'warning',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const variant = statusVariants[status.toLowerCase().replace(/ /g, '_')] || 'default';
  const displayText = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
  return (
    <Badge variant={variant} className={className}>
      {displayText}
    </Badge>
  );
};
