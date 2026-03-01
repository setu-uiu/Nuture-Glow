import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, Shield, Eye, EyeOff, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../constants';
import { UserRole } from '../../types';

const AdminRegister: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState<UserRole>('ops_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const adminRoles = [
    {
      value: 'medical_admin' as UserRole,
      label: 'Medical Admin',
      description: 'Doctor verification, case reviews, clinical oversight',
      icon: '🩺',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'ops_admin' as UserRole,
      label: 'Operations Admin',
      description: 'Cards, hospitals, CSR programs, call center',
      icon: '⚙️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      value: 'system_admin' as UserRole,
      label: 'System Admin',
      description: 'User management, security, system monitoring',
      icon: '🔧',
      color: 'from-red-500 to-orange-500'
    }
  ];

  const selectedRoleData = adminRoles.find(r => r.value === role);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setShowRoleSelection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate invite code (in production, verify against database)
    if (inviteCode !== 'NURTURE_ADMIN_2026') {
      setError('Invalid invitation code. Please contact system administrator.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(name.trim(), email.trim().toLowerCase(), phone.trim(), password, role, inviteCode.trim());
      navigate('/admin/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full mb-4">
            <Shield className="text-amber-400" size={16} />
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Admin Registration</span>
            <div className="ml-2 scale-90">
              <Logo />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Admin Account</h1>
          <p className="text-gray-400 text-sm">Invitation code required • Internal staff only</p>
        </div>

        {/* Registration Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
          {/* Shield Icon Button - Top Right of Form */}
          <button
            type="button"
            onClick={() => setShowRoleSelection(!showRoleSelection)}
            className={`absolute top-0 right-0 p-3 rounded-tr-2xl rounded-bl-lg border-l-2 border-b-2 transition-all hover:scale-105 z-10 ${
              selectedRoleData 
                ? `bg-gradient-to-br ${selectedRoleData.color} border-white/30 shadow-lg` 
                : 'bg-slate-900/90 border-slate-600 hover:border-slate-500'
            }`}
          >
            <Shield className="text-white" size={24} />
          </button>

          <form onSubmit={handleSubmit} className="space-y-5 p-8 pt-16">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Invite Code */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <label className="text-sm font-bold text-amber-400 ml-1 flex items-center gap-2 mb-2">
                <Key size={16} />
                Invitation Code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invitation code"
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
              />
            </div>

            {/* Role Selection Cards - Shown on Shield Click */}
            {showRoleSelection && (
              <div className="grid grid-cols-3 gap-3 animate-fadeIn">
                {adminRoles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRoleSelect(r.value)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      role === r.value
                        ? 'bg-gradient-to-br ' + r.color + ' border-white/30 shadow-lg'
                        : 'bg-slate-900/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{r.icon}</div>
                      <span className={`text-sm font-bold block mb-1 ${role === r.value ? 'text-white' : 'text-gray-300'}`}>
                        {r.label}
                      </span>
                      <p className={`text-xs ${role === r.value ? 'text-white/80' : 'text-gray-500'}`}>
                        {r.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="Password"
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Create Admin Account</span>
                  <Shield size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-gray-400 mb-3">
              Already have an admin account?{' '}
              <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-medium">
                Sign In
              </Link>
            </p>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-400">
              ← Back to Landing Page
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Admin accounts are monitored and require approval
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;


