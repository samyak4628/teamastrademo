import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  Heart, 
  Bike, 
  Building2, 
  Check, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  initialEmail?: string;
  onClose: () => void;
  onComplete: (role: UserRole, orgName: string) => void;
  onSwitchToSignIn?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialRole = 'restaurant',
  initialEmail = '',
  onClose,
  onComplete,
  onSwitchToSignIn
}) => {
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    password: '',
    confirmPassword: '',
    orgName: '',
    phone: '',
    address: '',
    city: 'New Delhi',
    vehicleType: 'Bicycle / Courier',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cooldown, setCooldown] = useState(0);

  // Rate limit cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (initialRole) setRole(initialRole);
    if (initialEmail) setFormData((prev) => ({ ...prev, email: initialEmail }));
    setSubmitted(false);
    setErrors({});
    setConfirmationNotice(null);
  }, [initialRole, initialEmail, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldown > 0) return;

    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Contact name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email address is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.orgName.trim()) newErrors.orgName = 'Organization / entity name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const { requireVerification, error } = await signUp({
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.name.trim(),
      role: role,
      organizationName: formData.orgName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      vehicleType: formData.vehicleType,
    });

    setIsSubmitting(false);

    if (error) {
      if (error.toLowerCase().includes('rate limit')) {
        setCooldown(30);
        setErrors({
          form: 'Supabase email rate limit exceeded (free-tier default allows ~3-4 emails/hour). Please wait 30 seconds before retrying, configure custom SMTP in Supabase Settings, or sign in using existing credentials.',
        });
      } else {
        setErrors({ form: error || 'Registration failed. Please try again.' });
      }
      return;
    }

    // Success confetti
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#bbf246', '#22c55e', '#142e20']
      });
    } catch {
      // ignore
    }

    if (requireVerification) {
      setConfirmationNotice(`A verification email has been dispatched to ${formData.email}. Please verify your email to log in.`);
    }

    setSubmitted(true);
    onComplete(role, formData.orgName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-900/10 bg-[#f7f9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center border border-emerald-900/10 shadow-xs overflow-hidden">
              <img src="/assets/resqfood-logo.png" alt="ResQFood Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 id="onboarding-modal-title" className="text-lg font-bold text-[#142e20]">
                Join ResQFood Pilot
              </h3>
              <p className="text-xs text-[#546b5d]">
                Create a verified organization profile to coordinate surplus food dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Close onboarding modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form level error */}
              {errors.form && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-[#142e20] uppercase tracking-wider mb-2">
                  Select Your Organization Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'restaurant', label: 'Restaurant', icon: Store },
                    { id: 'ngo', label: 'NGO / Shelter', icon: Heart },
                    { id: 'volunteer', label: 'Volunteer', icon: Bike },
                    { id: 'enterprise', label: 'Enterprise', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = role === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id as UserRole)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#142e20] text-[#bbf246] border-[#142e20] shadow-xs'
                            : 'bg-[#fafcf9] border-emerald-900/10 text-[#4c6154] hover:bg-emerald-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Chef Sanjay / Sarah J."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      {role === 'restaurant'
                        ? 'Restaurant / Kitchen Name *'
                        : role === 'ngo'
                        ? 'Shelter / Trust Name *'
                        : role === 'volunteer'
                        ? 'Display / Courier Tag *'
                        : 'Company / Group Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                      placeholder={role === 'restaurant' ? 'e.g. Grand Heritage Bistro' : role === 'ngo' ? 'e.g. Aasra Food Bank' : 'e.g. Marcus Express'}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    {errors.orgName && <p className="text-[11px] text-rose-600 mt-1">{errors.orgName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Official Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@organization.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat your password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. 14 Barakhamba Road, Connaught Place"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Operating City / Metro Area
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {role === 'volunteer' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#142e20] mb-1">
                      Primary Delivery Vehicle / Transport Mode
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Bicycle / Courier">Bicycle / Green Courier</option>
                      <option value="E-Bike / Electric Scooter">E-Bike / Electric Scooter</option>
                      <option value="Motorcycle / Scooter">Motorcycle / Scooter</option>
                      <option value="Car / Small Van">Car / Small Van</option>
                      <option value="On Foot / Metro Transit">On Foot / Metro Transit</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || cooldown > 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#bbf246] hover:bg-[#a8e632] text-[#142e20] font-bold text-sm shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#142e20]" />
                      <span>Creating Supabase Account...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <span>Rate limited — wait {cooldown}s...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {onSwitchToSignIn && (
                  <div className="text-center pt-2.5 text-xs text-gray-600">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchToSignIn();
                      }}
                      className="font-bold text-emerald-800 hover:underline"
                    >
                      Sign In here
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6d8477] mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real Supabase authentication with Row-Level Security</span>
                </div>
              </div>

            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="text-xl font-bold text-[#142e20]">
                Welcome aboard, {formData.name || 'Partner'}!
              </h4>
              <p className="text-xs sm:text-sm text-[#546b5d] max-w-md mx-auto">
                Your profile for <strong className="text-[#142e20]">{formData.orgName}</strong> has been registered in the database.
              </p>
              {confirmationNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs max-w-md mx-auto">
                  {confirmationNotice}
                </div>
              )}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#142e20] text-white text-xs sm:text-sm font-semibold hover:bg-emerald-900"
                >
                  Enter Operational Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
