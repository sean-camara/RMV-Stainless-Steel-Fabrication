import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute, PublicRoute, getDashboardPath } from './components/ProtectedRoute';
import { LandingLayout, DashboardLayout, CustomerLayout } from './components/layout';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Landing pages
import { Home, About, Services, Portfolio, PrivacyPolicy, TermsOfService } from './pages/landing';

// Auth pages
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from './pages/auth';

// Dashboard pages
import { CustomerDashboard, BookAppointment, MyAppointments, MyProjects, MyPayments } from './pages/dashboard/customer';
import { 
  SettingsLayout, 
  SettingsProfile, 
  SettingsContact, 
  SettingsSecurity, 
  SettingsNotifications 
} from './pages/dashboard/customer/settings';
import { AgentDashboard, AppointmentList } from './pages/dashboard/agent';
import { SalesDashboard, SalesAppointments, ProjectList as SalesProjectList, TravelFees as SalesTravelFees } from './pages/dashboard/sales';
import { EngineerDashboard, BlueprintManagement } from './pages/dashboard/engineer';
import { CashierDashboard, PaymentVerification, TravelFees as CashierTravelFees } from './pages/dashboard/cashier';
import { FabricationDashboard, FabricationQueue } from './pages/dashboard/fabrication';
import { AdminDashboard, UserManagement, ActivityLogs, AdminAppointments, AdminProjects, AdminPayments, AdminReports } from './pages/dashboard/admin';
import { Profile } from './pages/dashboard/shared';


// Dashboard redirect component
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <Routes>
          {/* Landing pages with public layout */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Route>

          {/* Auth pages */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="appointments/new" element={<BookAppointment />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="projects/:id" element={<MyProjects />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<SettingsProfile />} />
              <Route path="contact" element={<SettingsContact />} />
              <Route path="security" element={<SettingsSecurity />} />
              <Route path="notifications" element={<SettingsNotifications />} />
            </Route>
          </Route>

          {/* Agent Dashboard */}
          <Route
            path="/dashboard/agent"
            element={
              <ProtectedRoute allowedRoles={['appointment_agent']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentDashboard />} />
            <Route path="appointments" element={<AppointmentList />} />
            <Route path="appointments/:id" element={<AppointmentList />} />
            <Route path="calendar" element={<AppointmentList />} />
          </Route>

          {/* Sales Dashboard */}
          <Route
            path="/dashboard/sales"
            element={
              <ProtectedRoute allowedRoles={['sales_staff']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SalesDashboard />} />
            <Route path="appointments" element={<SalesAppointments />} />
            <Route path="appointments/:id" element={<SalesAppointments />} />
            <Route path="projects" element={<SalesProjectList />} />
            <Route path="projects/:id" element={<SalesProjectList />} />
            <Route path="travel-fees" element={<SalesTravelFees />} />
          </Route>

          {/* Engineer Dashboard */}
          <Route
            path="/dashboard/engineer"
            element={
              <ProtectedRoute allowedRoles={['engineer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EngineerDashboard />} />
            <Route path="pending" element={<BlueprintManagement />} />
            <Route path="projects" element={<BlueprintManagement />} />
            <Route path="projects/:id" element={<BlueprintManagement />} />
          </Route>

          {/* Cashier Dashboard */}
          <Route
            path="/dashboard/cashier"
            element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CashierDashboard />} />
            <Route path="pending" element={<PaymentVerification />} />
            <Route path="payments" element={<PaymentVerification />} />
            <Route path="payments/:id" element={<PaymentVerification />} />
            <Route path="travel-fees" element={<CashierTravelFees />} />
          </Route>

          {/* Fabrication Dashboard */}
          <Route
            path="/dashboard/fabrication"
            element={
              <ProtectedRoute allowedRoles={['fabrication_staff']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FabricationDashboard />} />
            <Route path="active" element={<FabricationQueue />} />
            <Route path="projects/:id" element={<FabricationQueue />} />
          </Route>

          {/* Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/new" element={<UserManagement />} />
            <Route path="users/:id" element={<UserManagement />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Profile (accessible by all authenticated users) */}
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
