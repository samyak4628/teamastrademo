import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  AlertCircle,
  Save,
  Bike
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [vehicleType, setVehicleType] = useState('Bicycle / Courier');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setOrgName(profile.organization_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || 'New Delhi');
      setAvatarUrl(profile.avatar_url || '');
      setVehicleType(profile.vehicle_type || 'Bicycle / Courier');
    }
  }, [profile, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isProfileIncomplete = !profile?.full_name || !profile?.phone || (profile.role !== 'volunteer' && !profile.organization_name);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      organization_name: orgName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      avatar_url: avatarUrl.trim(),
      vehicle_type: vehicleType.trim(),
    });
    setIsSaving(false);

    if (res.success) {
      if (onShowToast) onShowToast('Profile updated successfully in Supabase!');
      setIsEditing(false);
      refreshProfile();
    } else {
      setFormError(res.error || 'Failed to save profile changes.');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-[#142e20] to-[#1f4230] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-lg text-[#bbf246] shadow-xs">
              {getInitials(profile?.full_name || user.email)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="profile-modal-title" className="text-base sm:text-lg font-bold">
                  {profile?.full_name || 'My Account Profile'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#bbf246] text-[#142e20]">
                  {profile?.role || 'User'}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Verified Supabase Account • {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Incomplete Profile Alert Banner */}
          {isProfileIncomplete && !isEditing && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Profile Incomplete</strong>
                Please update your contact phone and organization details to receive verified food rescue dispatches.
              </div>
            </div>
          )}

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Account Full Name</span>
                  </div>
                  <div className="font-bold text-sm text-[#142e20] mt-1">
                    {profile?.full_name || 'Not configured'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Email Address</span>
                  </div>
                  <div className="font-bold text-sm text-[#142e20] mt-1 truncate">
                    {user.email}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Entity / Organization</span>
                  </div>
                  <div className="font-bold text-sm text-[#142e20] mt-1">
                    {profile?.organization_name || (profile?.role === 'volunteer' ? 'Independent Volunteer Courier' : 'Not configured')}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Phone Number</span>
                  </div>
                  <div className="font-bold text-sm text-[#142e20] mt-1">
                    {profile?.phone || 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10 sm:col-span-2">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Operational Address & City</span>
                  </div>
                  <div className="font-bold text-sm text-[#142e20] mt-1">
                    {profile?.address ? `${profile.address}, ${profile.city || 'New Delhi'}` : `${profile?.city || 'New Delhi'}`}
                  </div>
                </div>

                {profile?.role === 'volunteer' && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-900/15 sm:col-span-2">
                    <div className="flex items-center gap-2 text-teal-900 text-[11px] font-semibold uppercase">
                      <Bike className="w-3.5 h-3.5 text-teal-700" />
                      <span>Delivery Transport Mode</span>
                    </div>
                    <div className="font-bold text-sm text-[#142e20] mt-1">
                      {profile?.vehicle_type || vehicleType || 'Bicycle / Courier'}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Metadata Row */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-900/10 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>
                    Account active since: <strong>{new Date(profile?.created_at || user.created_at).toLocaleDateString()}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verified Session</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#142e20] hover:bg-[#1f4230] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#bbf246]" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {profile?.role !== 'volunteer' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {profile?.role === 'restaurant' ? 'Restaurant / Kitchen Name *' : 'NGO / Shelter Name *'}
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={profile?.role === 'restaurant' ? 'e.g. The Golden Bistro' : 'e.g. Aasra Food Bank'}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {profile?.role === 'volunteer' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Primary Delivery Vehicle / Transport Mode
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Bicycle / Courier">Bicycle / Green Courier</option>
                    <option value="E-Bike / Electric Scooter">E-Bike / Electric Scooter</option>
                    <option value="Motorcycle / Scooter">Motorcycle / Scooter</option>
                    <option value="Car / Small Van">Car / Small Van</option>
                    <option value="On Foot / Metro Transit">On Foot / Metro Transit</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Physical / Dispatch Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Barakhamba Road, Connaught Place"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormError(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#142e20] hover:bg-[#1f4230] text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-75"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#bbf246]" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
