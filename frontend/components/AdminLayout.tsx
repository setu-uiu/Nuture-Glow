import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../constants';
import AdminNotificationBell from './AdminNotificationBell';

// Admin Pages
import MedicalAdminDash from '../pages/admin/MedicalAdminDashboard';
import MedicalDoctorVerifications from '../pages/admin/MedicalDoctorVerifications';
import MedicalHighRiskCases from '../pages/admin/MedicalHighRiskCases';
import MedicalConsultationReviews from '../pages/admin/MedicalConsultationReviews';
import MedicalEmergencyAccessLogs from '../pages/admin/MedicalEmergencyAccessLogs';
import OperationsAdminDash from '../pages/admin/OperationsAdminDashboard';
import OperationsCardBatches from '../pages/admin/OperationsCardBatches';
import OperationsHospitals from '../pages/admin/OperationsHospitals';
import OperationsCSRPrograms from '../pages/admin/OperationsCSRPrograms';
import OperationsSupportTickets from '../pages/admin/OperationsSupportTickets';
import SystemAdminDash from '../pages/admin/SystemAdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import SecuritySettings from '../pages/admin/SecuritySettings';
import DatabaseBackup from '../pages/admin/DatabaseBackup';
import SystemMonitoring from '../pages/admin/SystemMonitoring';
import SuspensionAppeals from '../pages/admin/SuspensionAppeals';
import HealthIdVerifications from '../pages/admin/HealthIdVerifications';

import '../styles/adminTheme.css';

/**
 * AdminLayout Component
 * 
 * SEPARATE LAYOUT FOR ADMIN USERS
 * This layout is completely independent from the patient Layout.tsx
 * It ensures that admin users CANNOT accidentally navigate to patient dashboards
 * 
 * Features:
 * - No patient navigation links
 * - Admin-only sidebar with role-specific navigation
 * - Logout returns to /admin/login, not patient login
 * - Logo click stays in admin system
 */

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  // Verify user is admin
  if (!user || !['medical_admin', 'ops_admin', 'system_admin'].includes(user.role || '')) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin navigation items based on role
  const getAdminNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: `/admin/${user.role === 'medical_admin' ? 'medical' : user.role === 'ops_admin' ? 'operations' : 'system'}`, roles: ['medical_admin', 'ops_admin', 'system_admin'] }
    ];

    if (user.role === 'medical_admin') {
      return [
        ...baseItems,
        { label: 'Doctor Verifications', path: '/admin/medical/verifications', roles: ['medical_admin'] },
        { label: 'High-Risk Cases', path: '/admin/medical/high-risk', roles: ['medical_admin'] },
        { label: 'Consultation Reviews', path: '/admin/medical/consultations', roles: ['medical_admin'] },
        { label: 'Emergency Access Logs', path: '/admin/medical/emergency-access', roles: ['medical_admin'] }
      ];
    }

    if (user.role === 'system_admin') {
      return [
        ...baseItems,
        { label: 'User Management', path: '/admin/system/users', roles: ['system_admin'] },
        { label: 'Health ID Verifications', path: '/admin/system/health-verifications', roles: ['system_admin'] },
        { label: 'Security Settings', path: '/admin/system/security', roles: ['system_admin'] },
        { label: 'Suspension Appeals', path: '/admin/system/appeals', roles: ['system_admin'] },
        { label: 'Database Backup', path: '/admin/system/backup', roles: ['system_admin'] },
        { label: 'System Monitoring', path: '/admin/system/monitoring', roles: ['system_admin'] }
      ];
    }

    if (user.role === 'ops_admin') {
      return [
        ...baseItems,
        { label: 'Card Batches', path: '/admin/operations/batches', roles: ['ops_admin'] },
        { label: 'Hospital Onboarding', path: '/admin/operations/hospitals', roles: ['ops_admin'] },
        { label: 'CSR Programs', path: '/admin/operations/csr-programs', roles: ['ops_admin'] },
        { label: 'Support Tickets', path: '/admin/operations/support-tickets', roles: ['ops_admin'] }
      ];
    }

    return baseItems;
  };

  const navItems = getAdminNavItems().filter(item => item.roles.includes(user.role || ''));

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Admin Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Logo />
              <div>
                <h1 className="text-sm font-bold text-white">Admin</h1>
                <span className="text-[10px] text-amber-400 font-semibold">Control</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg text-gray-400"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/50'
              }`}
            >
              <div className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg text-gray-400"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold text-white capitalize">
              {(user.role || '').replace('_', ' ').replace('admin', 'Admin').toUpperCase()} Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <AdminNotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Administrator</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <img
                src={user.avatar}
                alt="Admin"
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Admin Content Area */}
        <div className="flex-1 overflow-auto bg-slate-900 p-6">
          <Routes>
            {/* Medical Admin Routes */}
            <Route
              path="medical"
              element={
                user.role === 'medical_admin' ? (
                  <MedicalAdminDash />
                ) : (
                  <Navigate to={`/admin/${user.role === 'ops_admin' ? 'operations' : 'system'}`} replace />
                )
              }
            />

            {/* Operations Admin Routes */}
            <Route
              path="operations"
              element={
                user.role === 'ops_admin' ? (
                  <OperationsAdminDash />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="operations/batches"
              element={
                user.role === 'ops_admin' ? (
                  <OperationsCardBatches />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="operations/hospitals"
              element={
                user.role === 'ops_admin' ? (
                  <OperationsHospitals />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="operations/csr-programs"
              element={
                user.role === 'ops_admin' ? (
                  <OperationsCSRPrograms />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="operations/support-tickets"
              element={
                user.role === 'ops_admin' ? (
                  <OperationsSupportTickets />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'system'}`} replace />
                )
              }
            />

            {/* System Admin Routes */}
            <Route
              path="system"
              element={
                user.role === 'system_admin' ? (
                  <SystemAdminDash />
                ) : (
                  <Navigate to={`/admin/${user.role === 'medical_admin' ? 'medical' : 'operations'}`} replace />
                )
              }
            />
            <Route
              path="system/users"
              element={
                user.role === 'system_admin' ? (
                  <UserManagement />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />
            <Route
              path="system/security"
              element={
                user.role === 'system_admin' ? (
                  <SecuritySettings />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />
            <Route
              path="system/backup"
              element={
                user.role === 'system_admin' ? (
                  <DatabaseBackup />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />
            <Route
              path="medical/verifications"
              element={
                user.role === 'medical_admin' ? (
                  <MedicalDoctorVerifications />
                ) : (
                  <Navigate to={`/admin/${user.role === 'ops_admin' ? 'operations' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="medical/high-risk"
              element={
                user.role === 'medical_admin' ? (
                  <MedicalHighRiskCases />
                ) : (
                  <Navigate to={`/admin/${user.role === 'ops_admin' ? 'operations' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="medical/consultations"
              element={
                user.role === 'medical_admin' ? (
                  <MedicalConsultationReviews />
                ) : (
                  <Navigate to={`/admin/${user.role === 'ops_admin' ? 'operations' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="medical/emergency-access"
              element={
                user.role === 'medical_admin' ? (
                  <MedicalEmergencyAccessLogs />
                ) : (
                  <Navigate to={`/admin/${user.role === 'ops_admin' ? 'operations' : 'system'}`} replace />
                )
              }
            />
            <Route
              path="system/appeals"
              element={
                user.role === 'system_admin' ? (
                  <SuspensionAppeals />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />
            <Route
              path="system/monitoring"
              element={
                user.role === 'system_admin' ? (
                  <SystemMonitoring />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />
            <Route
              path="system/health-verifications"
              element={
                user.role === 'system_admin' ? (
                  <HealthIdVerifications />
                ) : (
                  <Navigate to="/admin/system" replace />
                )
              }
            />

            {/* Default redirect */}
            <Route
              path="*"
              element={
                <Navigate
                  to={`/admin/${
                    user.role === 'medical_admin'
                      ? 'medical'
                      : user.role === 'ops_admin'
                      ? 'operations'
                      : 'system'
                  }`}
                  replace
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
