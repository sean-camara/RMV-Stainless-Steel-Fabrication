import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { User, Phone, Shield, Bell, ChevronRight } from 'lucide-react';

const SettingsLayout: React.FC = () => {
  const location = useLocation();

  // Redirect root /settings to /settings/profile
  if (location.pathname === '/dashboard/customer/settings') {
    return <Navigate to="/dashboard/customer/settings/profile" replace />;
  }

  const navItems = [
    { to: 'profile', icon: User, label: 'Profile' },
    { to: 'contact', icon: Phone, label: 'Contact Details' },
    { to: 'security', icon: Shield, label: 'Security' },
    { to: 'notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-lg">Manage your personal information and security preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-2">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 border whitespace-nowrap group ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 lg:group-hover:opacity-50 transition-opacity hidden lg:block" />
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 min-h-[600px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
