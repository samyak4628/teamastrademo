import React, { useState } from 'react';
import { 
  PlusCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Sparkles, 
  X, 
  ShieldCheck,
  Building,
  Flame,
  Navigation,
  User,
  Settings,
  LogOut,
  Edit3,
  CheckCircle,
  Bike
} from 'lucide-react';
import type { DonationItem } from '../lib/donationStore';
import type { UserProfile } from '../lib/AuthContext';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface RestaurantDashboardProps {
  donations: DonationItem[];
  onCreateDonation: (donation: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => void;
  restaurantName?: string;
  userEmail?: string;
  profile?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({
  donations,
  onCreateDonation,
  restaurantName = 'The Golden Bistro',
  userEmail = 'bistro@resqfood.org',
  profile,
  onOpenProfile,
  onOpenSettings,
  onLogout
}) => {
  const [isPosting, setIsPosting] = useState(false);
  const [selectedTrackingItem, setSelectedTrackingItem] = useState<DonationItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'dispatch' | 'completed'>('all');
  
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<DonationItem['category']>('Cooked Meals');
  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState<DonationItem['unit']>('meals');
  const [description, setDescription] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>(['Vegetarian']);
  const [pickupAddress, setPickupAddress] = useState(profile?.address || '14 Barakhamba Road, Connaught Place, New Delhi');
  const [pickupInstructions, setPickupInstructions] = useState('Ask at reception or loading door on North lane.');
  const [urgencyLevel, setUrgencyLevel] = useState<DonationItem['urgencyLevel']>('high');
  const [formError, setFormError] = useState('');

  const displayName = profile?.organization_name || restaurantName;
  const displayAddress = profile?.address || '14 Barakhamba Road, Connaught Place';
  const displayCity = profile?.city || 'New Delhi';

  // Quick templates
  const applyTemplate = (name: string, cat: DonationItem['category'], qty: number, u: DonationItem['unit'], desc: string, tags: string[]) => {
    setFoodName(name);
    setCategory(cat);
    setQuantity(qty);
    setUnit(u);
    setDescription(desc);
    setDietaryTags(tags);
    setIsPosting(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setFormError('Please enter the food name.');
      return;
    }
    if (quantity <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }

    setFormError('');
    onCreateDonation({
      foodName: foodName.trim(),
      category,
      quantity,
      unit,
      description: description.trim() || 'Hygienically packaged surplus food from fresh service.',
      dietaryTags,
      pickupWindowStart: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      pickupWindowEnd: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      pickupAddress: pickupAddress.trim(),
      pickupInstructions: pickupInstructions.trim(),
      restaurantName: displayName,
      restaurantCity: displayCity,
      urgencyLevel,
    });

    // Reset & close
    setFoodName('');
    setDescription('');
    setIsPosting(false);
  };

  const restaurantDonations = donations.filter(d => {
    if (profile) {
      return d.restaurantName.toLowerCase() === displayName.toLowerCase() || 
             d.restaurantName.toLowerCase() === (profile.organization_name || '').toLowerCase();
    }
    // Demo unauthenticated preview: show initial items
    return true;
  });

  const filteredDonations = restaurantDonations.filter(d => {
    if (activeTab === 'available') return d.status === 'available';
    if (activeTab === 'dispatch') return d.status === 'reserved' || d.status === 'volunteer_assigned' || d.status === 'picked_up';
    if (activeTab === 'completed') return d.status === 'delivered' || d.status === 'completed';
    return true;
  });

  const totalMealsRescued = restaurantDonations.reduce((acc, d) => acc + (d.unit === 'meals' || d.unit === 'servings' ? d.quantity : d.quantity * 2), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* RESTAURANT PROFILE HEADER CARD */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-soft">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#142e20] text-[#bbf246] flex items-center justify-center font-extrabold text-2xl shadow-forest shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Verified Restaurant Kitchen
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  Active Donor
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

          {/* Profile & Post Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
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

            <button
              type="button"
              onClick={() => setIsPosting(true)}
              className="inline-flex items-center gap-2 bg-[#142e20] hover:bg-[#1e4633] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#bbf246]" />
              <span>Post Surplus Food</span>
            </button>
          </div>
        </div>

        {/* Quick Account Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1 hover:text-[#142e20] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>My Profile Details</span>
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

      {/* Reusable Fast Templates */}
      <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-900/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-bold text-[#142e20]">
              1-Click Repeat Templates (Quick Post)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">Standard Kitchen Batches</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => applyTemplate('Lunch Buffet Surplus (Curry & Rice)', 'Cooked Meals', 40, 'meals', 'Warmly held buffet surplus in hygienic insulated containers.', ['Vegetarian'])}
            className="p-3 bg-white/95 hover:bg-white rounded-2xl border border-emerald-900/10 text-left transition-all hover:border-emerald-500 shadow-xs group"
          >
            <div className="text-xs font-bold text-[#142e20] group-hover:text-emerald-700">
              Daily Lunch Buffet (40 Meals)
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">Cooked Meals • 40 meals</div>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('Artisan Bakery Breads & Rolls', 'Bakery & Bread', 20, 'kg', 'Unsold fresh artisanal loaves baked today, packaged in clean paper bags.', ['Vegetarian'])}
            className="p-3 bg-white/95 hover:bg-white rounded-2xl border border-emerald-900/10 text-left transition-all hover:border-emerald-500 shadow-xs group"
          >
            <div className="text-xs font-bold text-[#142e20] group-hover:text-emerald-700">
              End-of-Day Bakery (20 kg)
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">Bakery & Bread • 20 kg</div>
          </button>

          <button
            type="button"
            onClick={() => applyTemplate('Banquet Salads & Fresh Cut Fruit', 'Fresh Produce', 25, 'servings', 'Freshly prepared cold salads and fruit platters, refrigerated at 4°C.', ['Vegan', 'Gluten-Free'])}
            className="p-3 bg-white/95 hover:bg-white rounded-2xl border border-emerald-900/10 text-left transition-all hover:border-emerald-500 shadow-xs group"
          >
            <div className="text-xs font-bold text-[#142e20] group-hover:text-emerald-700">
              Banquet Salad Platters (25 Servings)
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">Fresh Produce • 25 servings</div>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#142e20]">{totalMealsRescued}</div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Verified Meals Rescued</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {restaurantDonations.filter(d => d.status === 'available').length}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Active Live Listings</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
            {restaurantDonations.filter(d => d.status === 'reserved' || d.status === 'volunteer_assigned').length}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Claimed & In Dispatch</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/90 border border-emerald-900/10 shadow-soft">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">100%</div>
          <div className="text-xs text-gray-600 font-semibold mt-1">Hygienic Safety Record</div>
        </div>
      </div>

      {/* DONATION & DELIVERY MANAGEMENT SECTION */}
      <div className="bg-white/95 rounded-3xl p-6 border border-emerald-950/10 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-[#142e20]">
              Donation Management & Delivery Tracking
            </h3>
            <p className="text-xs text-gray-500">
              Manage live batches, view assigned couriers, and track live GPS dispatches
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'all' ? 'bg-[#142e20] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              All ({restaurantDonations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'available' ? 'bg-[#142e20] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Available ({restaurantDonations.filter(d => d.status === 'available').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dispatch')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'dispatch' ? 'bg-[#142e20] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              In Dispatch ({restaurantDonations.filter(d => d.status === 'reserved' || d.status === 'volunteer_assigned' || d.status === 'picked_up').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'completed' ? 'bg-[#142e20] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Completed ({restaurantDonations.filter(d => d.status === 'delivered' || d.status === 'completed').length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredDonations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">No donations found in this tab.</p>
              <p className="text-[11px] text-gray-400 mt-1">Post a new surplus batch to begin distribution.</p>
            </div>
          ) : (
            filteredDonations.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 font-mono">#{item.id}</span>
                    <h4 className="text-sm font-bold text-[#142e20]">{item.foodName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {item.category}
                    </span>
                    {item.urgencyLevel === 'high' && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        <Flame className="w-2.5 h-2.5 text-amber-600" />
                        <span>High Urgency</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 max-w-xl">{item.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-900">
                      <strong>{item.quantity}</strong> {item.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.pickupAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      Window: {new Date(item.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.assignedVolunteerName && (
                      <span className="flex items-center gap-1 text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                        <Bike className="w-3 h-3 text-teal-600" />
                        <span>Courier: {item.assignedVolunteerName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    item.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'reserved'
                      ? 'bg-blue-100 text-blue-800'
                      : item.status === 'picked_up'
                      ? 'bg-purple-100 text-purple-800'
                      : item.status === 'delivered' || item.status === 'completed'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>

                  {item.reservedByNgoName && (
                    <span className="text-xs text-gray-600 font-medium">
                      by <strong>{item.reservedByNgoName}</strong>
                    </span>
                  )}

                  {item.status !== 'available' && item.status !== 'completed' && item.status !== 'delivered' && (
                    <button
                      type="button"
                      onClick={() => setSelectedTrackingItem(item)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-900/10 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Live GPS Route</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Donation Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-900/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="font-extrabold text-lg text-[#142e20]">Post Surplus Food Donation</h3>
                <p className="text-xs text-gray-500">Provide accurate details for instant NGO matching & safe handover.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Food Item Name *</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Vegetable Biryani & Raita"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DonationItem['category'])}
                    className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                    <option value="Packaged Goods">Packaged Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Urgency</label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as DonationItem['urgencyLevel'])}
                    className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="normal">Normal (Within 6h)</option>
                    <option value="high">High (Within 3h)</option>
                    <option value="critical">Critical (Immediate 1h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as DonationItem['unit'])}
                    className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="meals">meals</option>
                    <option value="servings">servings</option>
                    <option value="kg">kg</option>
                    <option value="boxes">boxes</option>
                    <option value="liters">liters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description & Storage Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Prepared at 1:00 PM, held in insulated containers at 65°C."
                  rows={2}
                  className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Address</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Instructions for Courier</label>
                <input
                  type="text"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g. Ring bell at kitchen back entrance"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Food safety commitment note */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-900/10 flex items-start gap-2 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  By posting, you verify this food has been prepared and stored in accordance with local food safety hygiene standards.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#142e20] text-white text-xs font-bold hover:bg-[#1f4230] shadow-sm"
                >
                  Publish Donation Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Map Modal for Restaurant */}
      {selectedTrackingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full">
            <LiveDeliveryMap
              assignmentId={selectedTrackingItem.id}
              donationId={selectedTrackingItem.id}
              foodName={selectedTrackingItem.foodName}
              restaurantName={selectedTrackingItem.restaurantName}
              restaurantAddress={selectedTrackingItem.pickupAddress}
              ngoName={selectedTrackingItem.reservedByNgoName || 'Shelter'}
              ngoAddress="Shelter Distribution Hub"
              onClose={() => setSelectedTrackingItem(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
