import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Building2, 
  Navigation,
  User,
  Settings,
  LogOut,
  Edit3,
  Heart,
  CheckCircle,
  Bike
} from 'lucide-react';
import type { DonationItem } from '../lib/donationStore';
import type { UserProfile } from '../lib/AuthContext';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface NGODashboardProps {
  donations: DonationItem[];
  onReserveDonation: (donationId: string, ngoName: string) => Promise<{ success: boolean; message: string }>;
  ngoName?: string;
  userEmail?: string;
  profile?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onShowToast: (msg: string) => void;
}

export const NGODashboard: React.FC<NGODashboardProps> = ({
  donations,
  onReserveDonation,
  ngoName = 'Aasra Community Food Bank',
  userEmail = 'shelter@resqfood.org',
  profile,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'available' | 'claimed' | 'completed'>('available');
  const [isReserving, setIsReserving] = useState(false);
  const [trackingDonation, setTrackingDonation] = useState<DonationItem | null>(null);

  const displayName = profile?.organization_name || ngoName;
  const displayAddress = profile?.address || 'Plot 8, Community Shelter Block, Okhla Phase 3';
  const displayCity = profile?.city || 'New Delhi';

  const categories = ['All', 'Cooked Meals', 'Bakery & Bread', 'Fresh Produce', 'Dairy & Refrigerated', 'Packaged Goods'];

  const availableDonations = donations.filter(d => d.status === 'available');
  
  const myClaimedDonations = donations.filter(d => {
    if (profile) {
      return (
        d.reservedByNgoName?.toLowerCase() === displayName.toLowerCase() ||
        d.reservedByNgoName?.toLowerCase() === (profile.organization_name || '').toLowerCase()
      ) && d.status !== 'available' && d.status !== 'cancelled' && d.status !== 'delivered' && d.status !== 'completed';
    }
    return (
      d.reservedByNgoName?.toLowerCase() === displayName.toLowerCase() ||
      d.status === 'reserved'
    ) && d.status !== 'available' && d.status !== 'cancelled' && d.status !== 'delivered' && d.status !== 'completed';
  });

  const completedDonations = donations.filter(d => {
    if (profile) {
      return (d.status === 'delivered' || d.status === 'completed') && (
        d.reservedByNgoName?.toLowerCase() === displayName.toLowerCase() ||
        d.reservedByNgoName?.toLowerCase() === (profile.organization_name || '').toLowerCase()
      );
    }
    return (d.status === 'delivered' || d.status === 'completed');
  });

  const getActiveTabDonations = () => {
    switch (activeTab) {
      case 'available':
        return availableDonations;
      case 'claimed':
        return myClaimedDonations;
      case 'completed':
        return completedDonations;
    }
  };

  const filteredDonations = getActiveTabDonations().filter(d => {
    const matchesSearch = 
      d.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalMealsClaimed = [...myClaimedDonations, ...completedDonations].reduce(
    (acc, d) => acc + (d.unit === 'meals' || d.unit === 'servings' ? d.quantity : d.quantity * 2), 0
  );

  const handleClaim = async (donation: DonationItem) => {
    setIsReserving(true);
    const res = await onReserveDonation(donation.id, displayName);
    setIsReserving(false);
    onShowToast(res.message);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* NGO PROFILE HEADER CARD */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-soft">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#142e20] text-[#bbf246] flex items-center justify-center font-extrabold text-2xl shadow-forest shrink-0">
              <Heart className="w-8 h-8 text-[#bbf246]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Verified NGO Shelter & Foodbank
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  Govt Reg. 80G Certified
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142e20] mt-0.5">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {displayAddress}, {displayCity}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 font-medium">
                  {profile?.email || userEmail}
                </span>
                {profile?.phone && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{profile.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#142e20] text-xs font-bold border border-emerald-900/15 shadow-xs transition-all active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Navigation and Account Management */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1 hover:text-[#142e20] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>My Profile</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettings || onOpenProfile}
              className="inline-flex items-center gap-1 hover:text-[#142e20] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-700" />
              <span>Account Settings</span>
            </button>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Impact Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#142e20]">{totalMealsClaimed}</div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Beneficiary Meals Coordinated</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {availableDonations.length}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Batches Available Nearby</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
            {myClaimedDonations.length}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Active Deliveries in Transit</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {completedDonations.length}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Completed Collections</div>
        </div>
      </div>

      {/* View Switcher Tabs & Search */}
      <div className="bg-white/95 rounded-3xl p-6 border border-emerald-950/10 shadow-soft space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#142e20]">
              Surplus Food Feed & Delivery Management
            </h3>
            <p className="text-xs text-gray-500">
              Browse freshly published kitchen batches, claim portions, and track courier dispatch
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'available'
                  ? 'bg-[#142e20] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Available Feed ({availableDonations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('claimed')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'claimed'
                  ? 'bg-[#142e20] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              In Transit ({myClaimedDonations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#142e20] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              History ({completedDonations.length})
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, restaurant, or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Donation Grid Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {filteredDonations.length === 0 ? (
            <div className="col-span-full bg-gray-50/70 rounded-3xl p-12 text-center border border-gray-200">
              <Building2 className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <h4 className="font-bold text-sm text-gray-700">No matching donations found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {activeTab === 'available'
                  ? 'All nearby surplus donations have currently been reserved. New batches are posted continually by local kitchens.'
                  : activeTab === 'claimed'
                  ? 'Your organization has no active batches currently in transit.'
                  : 'No completed donation history recorded yet.'}
              </p>
            </div>
          ) : (
            filteredDonations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-emerald-950/10 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-900/10">
                      {item.category}
                    </span>
                    {item.urgencyLevel === 'high' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>Urgent: 3h window</span>
                      </span>
                    )}
                    {item.status !== 'available' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-[#142e20] group-hover:text-emerald-800 transition-colors">
                    {item.foodName}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-400">Available Quantity:</span>
                      <span className="text-[#142e20] text-sm font-extrabold">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{item.restaurantName} • {item.pickupAddress}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Pickup Window: {new Date(item.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {item.assignedVolunteerName && (
                      <div className="flex items-center gap-1.5 pt-1 text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded-xl">
                        <Bike className="w-3.5 h-3.5 text-teal-600" />
                        <span>Assigned Volunteer: {item.assignedVolunteerName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  {item.status === 'available' ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(item)}
                      disabled={isReserving}
                      className="w-full py-2.5 px-4 rounded-full bg-[#142e20] hover:bg-[#1f4230] text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#bbf246]" />
                      <span>Reserve for Shelter</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full py-1.5 text-center text-xs font-semibold text-gray-500 bg-gray-50 rounded-full flex items-center justify-center gap-1.5">
                        <span>{item.reservedByNgoName === displayName ? 'Claimed by Your Team' : `Claimed by ${item.reservedByNgoName}`}</span>
                      </div>

                      {/* Live Courier Tracking Trigger */}
                      {item.status !== 'delivered' && item.status !== 'completed' && item.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => setTrackingDonation(item)}
                          className="w-full py-2.5 px-4 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#bbf246] group-hover:scale-110 transition-transform" />
                          <span>Track Courier Live GPS</span>
                        </button>
                      )}

                      {/* Food Receipt Confirmation */}
                      {item.status === 'picked_up' && (
                        <button
                          type="button"
                          onClick={() => {
                            onShowToast(`Food receipt confirmed for batch #${item.id}. Verified record logged.`);
                          }}
                          className="w-full py-2 px-3 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                          <span>Confirm Safe Receipt</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Courier Map Modal for Shelter */}
      {trackingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full">
            <LiveDeliveryMap
              assignmentId={trackingDonation.id}
              donationId={trackingDonation.id}
              foodName={trackingDonation.foodName}
              restaurantName={trackingDonation.restaurantName}
              restaurantAddress={trackingDonation.pickupAddress}
              ngoName={trackingDonation.reservedByNgoName || displayName}
              ngoAddress={displayAddress}
              onClose={() => setTrackingDonation(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
