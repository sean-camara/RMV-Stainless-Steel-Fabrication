import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api/services';
import { getFullImageUrl } from '../../utils/image';

interface BackendNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  resourceType?: string;
  resourceId?: string;
}

interface NavItem {
  name: string;
  shortName: string;
  path: string;
  icon: React.ReactNode;
}

const CustomerLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load from localStorage on initial mount
    const saved = localStorage.getItem('customerSidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.getAll();
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.notifications.filter((n: BackendNotification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Remove/delete notification
  const handleRemoveNotification = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('customerSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Reset image error when avatar changes
  useEffect(() => {
    setImgError(false);
  }, [user?.profile?.avatar, user?.avatar]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      shortName: 'Home',
      path: '/dashboard/customer',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Book Appointment',
      shortName: 'Book',
      path: '/dashboard/customer/appointments/new',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'My Appointments',
      shortName: 'Appts',
      path: '/dashboard/customer/appointments',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'My Projects',
      shortName: 'Projects',
      path: '/dashboard/customer/projects',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Payments',
      shortName: 'Pay',
      path: '/dashboard/customer/payments',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      shortName: 'Settings',
      path: '/dashboard/customer/settings',
      icon: (
        <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Exact match for dashboard, prefix match for others (but not overlapping)
  const isActive = (path: string) => {
    if (path === '/dashboard/customer') {
      return location.pathname === path;
    }
    if (path === '/dashboard/customer/appointments/new') {
      return location.pathname === path;
    }
    if (path === '/dashboard/customer/appointments') {
      return location.pathname === path || 
        (location.pathname.startsWith(path) && !location.pathname.includes('/new'));
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 z-40 h-full bg-slate-900 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Collapse Toggle (top) */}
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
                      onError={() => setImgError(true)}
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
                    <p className="text-xs text-slate-500 truncate">Customer</p>
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
                  if (next) handleMarkAllRead();
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
                    <span className="text-xs text-slate-500">{notifications.length || 0} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-slate-500 text-center">No notifications yet</div>
                    ) : (
                      notifications.map((item) => (
                        <div key={item._id} className={`px-4 py-3 border-b border-slate-100 last:border-b-0 ${!item.read ? 'bg-blue-50' : ''}`}>
                          {item.title && <p className="text-sm font-semibold text-slate-900">{item.title}</p>}
                          <p className="text-sm text-slate-600">{item.message}</p>
                          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                            <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
                            <button onClick={() => handleRemoveNotification(item._id)} className="text-slate-400 hover:text-slate-600">Clear</button>
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
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-medium overflow-hidden"
            >
              {(user?.profile?.avatar || user?.avatar) && !imgError ? (
                <img 
                  src={getFullImageUrl(user?.profile?.avatar || user?.avatar) || ''} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
              )}
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
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500">Customer</p>
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

      {/* Mobile Bottom Navigation - Like IG/FB */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
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
                <img src="/1.jpg" alt="RMV" className="w-full h-full object-cover" />
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
                    if (next) handleMarkAllRead();
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
                      <button onClick={handleMarkAllRead} className="text-xs text-slate-500 hover:text-slate-700">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">No notifications yet</div>
                      ) : (
                        notifications.map((item) => (
                          <div key={item._id} className={`px-4 py-3 border-b border-slate-100 last:border-b-0 ${!item.read ? 'bg-blue-50' : ''}`}>
                            {item.title && <p className="text-sm font-semibold text-slate-900">{item.title}</p>}
                            <p className="text-sm text-slate-600">{item.message}</p>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                              <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
                              <button onClick={() => handleRemoveNotification(item._id)} className="text-slate-400 hover:text-slate-600">Clear</button>
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

export default CustomerLayout;
