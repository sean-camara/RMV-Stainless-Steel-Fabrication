import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getFullImageUrl } from '../../utils/image';
import type { UserRole } from '../../types';

interface NavItem {
  name: string;
  shortName: string;
  path: string;
  icon: React.ReactNode;
}

// Role labels for display
const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  customer: 'Customer',
  appointment_agent: 'Appointment Agent',
  sales_staff: 'Sales Staff',
  engineer: 'Engineer',
  cashier: 'Cashier',
  fabrication_staff: 'Fabrication Staff',
};

// Navigation items per role
const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/admin',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'Users',
          shortName: 'Users',
          path: '/dashboard/admin/users',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
        {
          name: 'Appointments',
          shortName: 'Appts',
          path: '/dashboard/admin/appointments',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: 'Projects',
          shortName: 'Projects',
          path: '/dashboard/admin/projects',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        },
        {
          name: 'Payments',
          shortName: 'Pay',
          path: '/dashboard/admin/payments',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
        {
          name: 'Activity Logs',
          shortName: 'Logs',
          path: '/dashboard/admin/logs',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: 'Reports',
          shortName: 'Reports',
          path: '/dashboard/admin/reports',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
      ];
    case 'appointment_agent':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/agent',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'Appointments',
          shortName: 'Appts',
          path: '/dashboard/agent/appointments',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
        {
          name: 'Calendar',
          shortName: 'Cal',
          path: '/dashboard/agent/calendar',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: 'Sales Staff',
          shortName: 'Staff',
          path: '/dashboard/agent/staff',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
      ];
    case 'sales_staff':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/sales',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'My Appointments',
          shortName: 'Appts',
          path: '/dashboard/sales/appointments',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ];
    case 'engineer':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/engineer',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'All Projects',
          shortName: 'Projects',
          path: '/dashboard/engineer/projects',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        },
      ];
    case 'cashier':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/cashier',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'Pending Payments',
          shortName: 'Pending',
          path: '/dashboard/cashier/pending',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: 'All Payments',
          shortName: 'Payments',
          path: '/dashboard/cashier/payments',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
      ];
    case 'fabrication_staff':
      return [
        {
          name: 'Dashboard',
          shortName: 'Home',
          path: '/dashboard/fabrication',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: 'Active Projects',
          shortName: 'Active',
          path: '/dashboard/fabrication/active',
          icon: (
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          ),
        },
      ];
    default:
      return [];
  }
};

const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Persistence of sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { feed, unreadCount, markAllRead, removeFeedItem } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // Reset error state when user/avatar changes
  useEffect(() => {
    setImgError(false);
  }, [user?.profile?.avatar, user?.avatar]);

  // Debug: surface the avatar data used by the sidebar
  useEffect(() => {
    if (!user) return;
    const raw = user.profile?.avatar || user.avatar;
    const url = getFullImageUrl(raw);
    console.log('[Sidebar Avatar]', { rawAvatar: raw, resolvedUrl: url, imgError });
  }, [user, user?.profile?.avatar, user?.avatar, imgError]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user ? getNavItems(user.role) : [];
  const roleLabel = user ? roleLabels[user.role] || user.role.replace('_', ' ') : '';

  // Get base path for the current role
  const getBasePath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/dashboard/admin';
      case 'appointment_agent': return '/dashboard/agent';
      case 'sales_staff': return '/dashboard/sales';
      case 'engineer': return '/dashboard/engineer';
      case 'cashier': return '/dashboard/cashier';
      case 'fabrication_staff': return '/dashboard/fabrication';
      default: return '/dashboard';
    }
  };

  // Exact match for dashboard, prefix match for others, handles query params
  const isActive = (path: string) => {
    const basePath = getBasePath();
    const [pathWithoutQuery, query] = path.split('?');
    
    // For dashboard index, exact match only
    if (path === basePath) {
      return location.pathname === path;
    }
    
    // If path has query params, match both pathname and search
    if (query) {
      return location.pathname === pathWithoutQuery && location.search === `?${query}`;
    }
    
    // For other paths, prefix match but avoid matching when there's a specific query filter active
    if (location.search && location.pathname === pathWithoutQuery) {
      return false; // Don't highlight generic path when a filtered path is active
    }
    
    return location.pathname.startsWith(pathWithoutQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 z-40 h-full bg-slate-900 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Collapse Toggle (moved to top) */}
        <div className="flex items-center h-16 px-3 border-b border-slate-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`group relative flex items-center justify-center h-11 rounded-lg text-slate-300 bg-slate-800/60 hover:bg-slate-700 hover:text-white transition-all duration-150 w-full ${
              isCollapsed ? '' : 'px-3 justify-between'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!isCollapsed && <span className="text-sm font-semibold">Collapse sidebar</span>}
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-3 px-3 overflow-y-auto ${isCollapsed ? 'scrollbar-hidden' : 'scrollbar-thin'}`}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center h-11 rounded-lg transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'px-3'
                    } ${
                      active
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>
                  
                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-800" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-800">
          {/* User Info */}
          {user && (
            <div className={`p-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-700 border border-slate-600">
                  {(user.profile?.avatar || user.avatar) && !imgError ? (
                    <img 
                      src={getFullImageUrl(user.profile?.avatar || user.avatar) || ''} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.log('[Sidebar Avatar] img onError');
                        setImgError(true);
                      }}
                      onLoad={() => console.log('[Sidebar Avatar] img onLoad')}
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Row */}
          <div className={`p-3 flex ${isCollapsed ? 'flex-col space-y-2' : 'items-center justify-end'}`}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`group relative flex items-center justify-center h-10 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 ${
                isCollapsed ? 'w-full' : 'w-full'
              } ${isCollapsed ? '' : 'gap-2 px-3 justify-start bg-slate-800/50 text-white hover:bg-red-500/15'}`}
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span className="text-sm font-semibold">Logout</span>}
              
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  Sign out
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-800" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src="/1.jpg" alt="RMV" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">RMV Steel</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  const next = !showNotifications;
                  setShowNotifications(next);
                  if (next) markAllRead();
                }}
                className="relative p-2 text-slate-500 hover:text-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <span className="text-xs text-slate-500">{feed.length || 0} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {feed.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-slate-500 text-center">No notifications yet</div>
                    ) : (
                      feed.map((item) => (
                        <div key={item.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0">
                          {item.title && <p className="text-sm font-semibold text-slate-900">{item.title}</p>}
                          <p className="text-sm text-slate-600">{item.message}</p>
                          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                            <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
                            <button onClick={() => removeFeedItem(item.id)} className="text-slate-400 hover:text-slate-600">Clear</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile/Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-medium"
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </button>
          </div>
        </div>
        
        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute right-4 top-14 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200">
                    <img 
                      src={getFullImageUrl(user?.profile?.avatar || user?.avatar) || '/1.jpg'} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.firstName}</p>
                    <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
                 </div>
              </div>
              <Link
                to="/"
                className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => setShowMobileMenu(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                  active 
                    ? 'text-slate-900' 
                    : 'text-slate-400 active:text-slate-600'
                }`}
              >
                <span className={`${active ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-60'}`}>
        {/* Desktop Top Bar - Hidden on mobile */}
        <header className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-slate-200">
                <img 
                  src={getFullImageUrl(user?.profile?.avatar || user?.avatar) || '/1.jpg'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">
                {navItems.find(item => isActive(item.path))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showNotifications;
                    setShowNotifications(next);
                    if (next) markAllRead();
                  }}
                  className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                      <button onClick={markAllRead} className="text-xs text-slate-500 hover:text-slate-700">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {feed.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">No notifications yet</div>
                      ) : (
                        feed.map((item) => (
                          <div key={item.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0">
                            {item.title && <p className="text-sm font-semibold text-slate-900">{item.title}</p>}
                            <p className="text-sm text-slate-600">{item.message}</p>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                              <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
                              <button onClick={() => removeFeedItem(item.id)} className="text-slate-400 hover:text-slate-600">Clear</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Home Link */}
              <Link 
                to="/"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen">
          <div className="p-4 md:p-6 overflow-y-auto scrollbar-light">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Sign out?</h3>
              <p className="text-sm text-slate-500 mt-1">You will be returned to the home page.</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
