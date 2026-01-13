import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NotificationStack } from '@/components/ui/Notifications';

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type: NotificationKind;
  duration?: number;
  persist?: boolean;
  timestamp?: number;
  read?: boolean;
}

interface NotificationContextValue {
  notify: (input: Omit<NotificationItem, 'id'>) => void;
  feed: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeFeedItem: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [feed, setFeed] = useState<NotificationItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((input: Omit<NotificationItem, 'id'>) => {
    const id = generateId();
    const notification: NotificationItem = {
      id,
      title: input.title,
      message: input.message,
      type: input.type ?? 'info',
      duration: input.duration ?? 4000,
      persist: input.persist ?? false,
      timestamp: Date.now(),
      read: false,
    };
    setItems((prev) => [...prev, notification]);
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => remove(id), notification.duration);
    }

    if (notification.persist) {
      setFeed((prev) => {
        const next = [notification, ...prev].slice(0, 20);
        return next;
      });
    }
  }, [remove]);

  const markRead = useCallback((id: string) => {
    setFeed((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
  }, []);

  const markAllRead = useCallback(() => {
    setFeed((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const removeFeedItem = useCallback((id: string) => {
    setFeed((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = feed.filter((item) => !item.read).length;

  const value = useMemo(() => ({ notify, feed, unreadCount, markRead, markAllRead, removeFeedItem }), [notify, feed, unreadCount, markRead, markAllRead, removeFeedItem]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationStack items={items} onDismiss={remove} />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
};
