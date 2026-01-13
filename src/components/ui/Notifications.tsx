import React from 'react';
import type { NotificationItem, NotificationKind } from '../../contexts/NotificationContext';

const typeStyles: Record<NotificationKind, string> = {
  info: 'bg-slate-900 text-white border-slate-800',
  success: 'bg-emerald-600 text-white border-emerald-500',
  warning: 'bg-amber-500 text-white border-amber-400',
  error: 'bg-red-600 text-white border-red-500',
};

const typeIcon: Record<NotificationKind, JSX.Element> = {
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-6.82 11.8A1 1 0 004.24 17h15.52a1 1 0 00.87-1.5l-6.82-11.8a1 1 0 00-1.74 0z" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

interface NotificationStackProps {
  items: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationStack: React.FC<NotificationStackProps> = ({ items, onDismiss }) => {
  if (items.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className={`border shadow-lg rounded-xl px-4 py-3 flex items-start gap-3 ${typeStyles[item.type]}`}
        >
          <div className="mt-0.5">{typeIcon[item.type]}</div>
          <div className="flex-1 min-w-0">
            {item.title && <p className="text-sm font-semibold leading-tight">{item.title}</p>}
            <p className="text-sm leading-tight break-words">{item.message}</p>
          </div>
          <button
            onClick={() => onDismiss(item.id)}
            aria-label="Dismiss"
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
