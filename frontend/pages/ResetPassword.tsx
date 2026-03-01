import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '../constants';
import { checkPasswordStrength, validatePassword } from '../utils/validation';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const passwordStrength = checkPasswordStrength(password);
  const passwordValid = password.length > 0 && validatePassword(password).isValid;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    // Optionally verify token with backend
    setTokenValid(true);
  }, [token]);

  const getStrengthColor = () => {
    if (passwordStrength.score === 0) return 'bg-red-500';
    if (passwordStrength.score === 1) return 'bg-orange-500';
    if (passwordStrength.score === 2) return 'bg-yellow-500';
    if (passwordStrength.score === 3) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength.score === 0) return 'Very Weak';
    if (passwordStrength.score === 1) return 'Weak';
    if (passwordStrength.score === 2) return 'Fair';
    if (passwordStrength.score === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password does not meet security requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please log in with your new password.' 
          } 
        });
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#BFE6DA] via-[#F7F5EF] to-[#E6C77A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Back to Login
              </Link>
              <button
                onClick={() => navigate('/login', { state: { showForgotPassword: true } })}
                className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#BFE6DA] via-[#F7F5EF] to-[#E6C77A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-2">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in 3 seconds...
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BFE6DA] via-[#F7F5EF] to-[#E6C77A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Login</span>
        </Link>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Logo className="w-12 h-12" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">Nurture</h1>
              <span className="text-sm text-[#E6C77A] font-semibold uppercase tracking-wider">Glow</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">Create a strong, secure password for your account</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">Password Strength</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.score >= 3 ? 'text-green-600' : 
                      passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                    />
                  </div>
                  
                  {/* Requirements Checklist */}
                  <div className="mt-3 space-y-1.5">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-500">{item}</span>
                      </div>
                    ))}
                    {passwordStrength.feedback.length === 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-green-700">Password meets all requirements</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-4 outline-none transition-all ${
                    confirmPassword && passwordsMatch
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                      : confirmPassword && !passwordsMatch
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {confirmPassword && passwordsMatch && (
                  <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <XCircle size={14} />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordValid || !passwordsMatch}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${
                isLoading || !passwordValid || !passwordsMatch
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-blue-900 mb-1">Security Tips</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Use a unique password you don't use elsewhere</li>
                  <li>• Consider using a password manager</li>
                  <li>• Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
