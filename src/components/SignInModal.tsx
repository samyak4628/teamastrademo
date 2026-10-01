import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  Heart, 
  Bike, 
  Check, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (role: UserRole, userEmail: string) => void;
  onSwitchToRegister?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onSwitchToRegister
}) => {
  const { signIn, resetPassword, updatePassword, isPasswordRecovery, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'forgot' | 'reset'>(isPasswordRecovery ? 'reset' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset');
    }
  }, [isPasswordRecovery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset states when modal reopens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (!isPasswordRecovery) {
        setMode('signin');
      }
    }
  }, [isOpen, isPasswordRecovery]);

  if (!isOpen) return null;

  const handleQuickFill = (demoEmail: string, demoPass: string = 'ResQFood2026!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setSuccessMessage(`Credentials pre-filled for ${demoEmail}`);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    const { user, profile, error } = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error || 'Invalid login credentials. Please try again.');
      return;
    }

    const determinedRole = (profile?.role as UserRole) || 'restaurant';
    setSuccessMessage(`Welcome back, ${profile?.full_name || user?.email}!`);
    setTimeout(() => {
      onSuccessLogin(determinedRole, user?.email || email);
      onClose();
    }, 700);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error || 'Failed to send password reset email.');
      return;
    }

    setSuccessMessage('Password reset link sent! Check your inbox to set a new password.');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error || 'Failed to update password.');
      return;
    }

    setSuccessMessage('Password successfully updated! You can now sign in.');
    setTimeout(() => {
      setMode('signin');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-900/10 bg-[#f7f9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center border border-emerald-900/10 shadow-xs overflow-hidden">
              <img src="/assets/resqfood-logo.png" alt="ResQFood Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 id="signin-modal-title" className="text-base sm:text-lg font-bold text-[#142e20]">
                {mode === 'signin' && 'Sign In to ResQFood'}
                {mode === 'forgot' && 'Reset Your Password'}
                {mode === 'reset' && 'Set New Password'}
              </h3>
              <p className="text-xs text-[#52685c]">
                {mode === 'signin' && 'Access your real-time surplus dispatch dashboard'}
                {mode === 'forgot' && 'We will send a secure reset link to your email'}
                {mode === 'reset' && 'Choose a strong password for your account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Close sign in modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <>
              {/* Quick Fill Credentials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Quick Fill Demo Accounts:
                  </span>
                  <span className="text-[10px] text-gray-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('bistro@resqfood.org')}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-900/10 text-xs transition-colors text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#142e20]">
                      <Store className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span className="truncate">Restaurant</span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate mt-0.5">bistro@resqfood.org</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('shelter@resqfood.org')}
                    className="p-2 rounded-xl bg-lime-50 hover:bg-lime-100 border border-lime-900/10 text-xs transition-colors text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#142e20]">
                      <Heart className="w-3.5 h-3.5 text-lime-800 shrink-0" />
                      <span className="truncate">NGO Shelter</span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate mt-0.5">shelter@resqfood.org</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('volunteer@resqfood.org')}
                    className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-900/10 text-xs transition-colors text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#142e20]">
                      <Bike className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                      <span className="truncate">Courier</span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate mt-0.5">volunteer@resqfood.org</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-emerald-900/10"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-gray-400 uppercase">
                  Or Sign In With Email
                </span>
                <div className="flex-grow border-t border-emerald-900/10"></div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142e20] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#142e20]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setMode('forgot');
                      }}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full py-3 px-4 rounded-full bg-[#142e20] hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {onSwitchToRegister && (
                <div className="text-center pt-1 text-xs text-gray-600">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister();
                    }}
                    className="font-bold text-emerald-800 hover:underline"
                  >
                    Register here
                  </button>
                </div>
              )}
            </>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#142e20] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email associated with your account"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-full bg-[#142e20] hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('signin');
                }}
                className="w-full text-center text-xs font-semibold text-gray-600 hover:text-black py-1"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#142e20] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142e20] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-full bg-[#142e20] hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password & Continue</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f7f9f6] border-t border-emerald-900/10 text-center text-[11px] text-[#617769] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured by Supabase Authentication & PostgreSQL RLS</span>
        </div>
      </div>
    </div>
  );
};
