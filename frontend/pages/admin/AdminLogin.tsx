import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../i18n/I18nContext';
import { Logo } from '../../constants';

/**
 * SECURITY NOTE: Admin Login Portal
 * 
 * This is a HIDDEN administrative access point - NOT linked from public pages.
 * Access URL: /#/admin/login (must be accessed directly)
 * 
 * Security Features:
 * - No public navigation links (not accessible from landing page)
 * - Requires valid admin credentials (medical_admin, ops_admin, system_admin)
 * - Role verification performed on login
 * - Non-admin users are denied access
 * - All admin actions are logged and audited
 * 
 * For admin registration, use: /#/admin/register (requires invitation code)
 */

const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      
      // Note: Since login updates the user in context but doesn't return it,
      // we need to make the API call ourselves to get the user data for verification
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email.trim().toLowerCase(), password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      
      // Verify user is an admin
      if (!['medical_admin', 'ops_admin', 'system_admin'].includes(data.user.role)) {
        setError('Access Denied: Admin credentials required');
        setIsLoading(false);
        return;
      }

      // Redirect based on admin role
      switch (data.user.role) {
        case 'medical_admin':
          navigate('/admin/medical');
          break;
        case 'ops_admin':
          navigate('/admin/operations');
          break;
        case 'system_admin':
          navigate('/admin/system');
          break;
        default:
          navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
            <Shield className="text-amber-400" size={16} />
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Admin Portal</span>
            <div className="ml-2">
              <Logo />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Administrative Access</h1>
          <p className="text-gray-400 text-sm">Secure login for authorized staff only</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 peer-focus:text-amber-400 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-transparent"
              />
              <label className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-amber-400 peer-focus:bg-slate-900 peer-focus:px-2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-400 peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-2">
                Admin Email
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-transparent"
              />
              <label className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-amber-400 peer-focus:bg-slate-900 peer-focus:px-2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-400 peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-2">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Admin Panel</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <Link to="/" className="text-gray-400 hover:text-amber-400 font-medium transition-colors">
                ← Main Site
              </Link>
              <Link to="/admin/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Register Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Lock size={12} />
            <span>All admin actions are logged and monitored</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


