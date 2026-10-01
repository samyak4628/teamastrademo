import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Package, 
  Navigation, 
  Bike,
  Radio,
  StopCircle,
  Play,
  Map as MapIcon,
  AlertCircle,
  Activity,
  User,
  Settings,
  LogOut,
  Edit3,
  CheckCircle
} from 'lucide-react';
import type { DonationItem } from '../lib/donationStore';
import type { UserProfile } from '../lib/AuthContext';
import { useVolunteerTracking } from '../lib/useVolunteerTracking';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface VolunteerDashboardProps {
  donations: DonationItem[];
  onAssignVolunteer: (donationId: string, volunteerName: string) => void;
  onUpdateStatus: (donationId: string, newStatus: DonationItem['status']) => void;
  volunteerName?: string;
  userEmail?: string;
  profile?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onShowToast: (msg: string) => void;
}

// Sub-component for an active delivery run to manage isolated GPS tracking
const ActiveRunCard: React.FC<{
  task: DonationItem;
  volunteerName: string;
  onAdvanceStatus: (donationId: string, nextStatus: DonationItem['status'], label: string) => void;
  onOpenMap: (task: DonationItem) => void;
}> = ({ task, volunteerName, onAdvanceStatus, onOpenMap }) => {
  const {
    isTracking,
    currentLocation,
    error: trackingError,
    lastPushedAt,
    startTracking,
    stopTracking,
  } = useVolunteerTracking({
    assignmentId: task.id,
    donationId: task.id,
    volunteerId: volunteerName,
  });

  // Stop tracking automatically if delivery is finalized
  useEffect(() => {
    if (task.status === 'delivered' || task.status === 'completed') {
      stopTracking();
    }
  }, [task.status, stopTracking]);

  const handleCompleteDelivery = () => {
    stopTracking();
    onAdvanceStatus(task.id, 'delivered', 'Food handover completed successfully');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Active Run #{task.id}</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold capitalize">
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <h4 className="text-lg font-bold text-[#142e20] mt-1">{task.foodName} ({task.quantity} {task.unit})</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            <strong>{task.restaurantName}</strong> ({task.pickupAddress}) → <strong>{task.reservedByNgoName}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenMap(task)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-900/10 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <MapIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>View Live Route Map</span>
        </button>
      </div>

      {/* GPS Courier Broadcasting Panel */}
      <div className="bg-[#142e20]/5 rounded-2xl p-4 sm:p-5 border border-[#142e20]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isTracking ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-xs font-extrabold text-[#142e20] uppercase tracking-wide">
              Live Courier GPS Sharing
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isTracking 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {isTracking ? 'Broadcasting Live' : 'Tracking Paused'}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {isTracking
              ? 'Your live position is being broadcast to the recipient shelter and restaurant via Supabase Realtime.'
              : 'Turn on GPS sharing to allow the shelter to track your arrival window in real-time.'}
          </p>

          {currentLocation && isTracking && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-emerald-900">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-600" />
                Speed: <strong>{currentLocation.speed ?? 0} km/h</strong>
              </span>
              <span>•</span>
              <span>Accuracy: <strong>±{currentLocation.accuracy}m</strong></span>
              {lastPushedAt && (
                <>
                  <span>•</span>
                  <span className="text-gray-500">Updated: {lastPushedAt.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          )}

          {trackingError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trackingError}</span>
            </div>
          )}
        </div>

        {/* Start / Stop Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {isTracking ? (
            <button
              type="button"
              onClick={stopTracking}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop GPS Tracking</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startTracking}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#142e20] hover:bg-[#1e4633] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-[#bbf246]" />
              <span>Start GPS Tracking</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Stepper Progression */}
      <div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Delivery Progress Stepper</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onAdvanceStatus(task.id, 'picked_up', 'Food picked up from kitchen')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              task.status === 'picked_up' || task.status === 'on_the_way'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Confirm Food Picked Up</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Tap when food is verified and loaded in bag.</p>
          </button>

          <button
            type="button"
            onClick={() => onAdvanceStatus(task.id, 'on_the_way', 'Courier in transit to shelter')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              task.status === 'on_the_way'
                ? 'bg-blue-50 border-blue-500 text-blue-900'
                : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-[10px]">2</span>
              <span>In Transit (On The Way)</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Live tracking coordinates transmitted to shelter.</p>
          </button>

          <button
            type="button"
            onClick={handleCompleteDelivery}
            className="p-4 rounded-2xl border bg-[#142e20] text-white hover:bg-[#1e4633] text-left transition-all shadow-md active:scale-95"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#bbf246]">
              <span className="w-5 h-5 rounded-full bg-[#bbf246] text-[#142e20] flex items-center justify-center text-[10px] font-extrabold">3</span>
              <span>Confirm Final Delivery</span>
            </div>
            <p className="text-[11px] text-gray-300 mt-1">Stops GPS & logs verified shelter handover.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  donations,
  onAssignVolunteer,
  onUpdateStatus,
  volunteerName = 'Marcus S. (City Courier)',
  userEmail = 'volunteer@resqfood.org',
  profile,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [selectedTaskForMap, setSelectedTaskForMap] = useState<DonationItem | null>(null);

  const displayName = profile?.full_name || volunteerName;
  const displayCity = profile?.city || 'New Delhi Central';

  const availableTasks = donations.filter(d => 
    d.status === 'reserved' && !d.assignedVolunteerName
  );

  const myActiveTasks = donations.filter(d => 
    (d.assignedVolunteerName === displayName || d.assignedVolunteerName === volunteerName) && 
    d.status !== 'completed' && 
    d.status !== 'delivered'
  );

  const completedTasks = donations.filter(d => 
    (d.assignedVolunteerName === displayName || d.assignedVolunteerName === volunteerName) && 
    (d.status === 'delivered' || d.status === 'completed')
  );

  const handleAcceptTask = (donationId: string) => {
    onAssignVolunteer(donationId, displayName);
    onShowToast(`Delivery task assigned to you! Please proceed to pickup location.`);
    setActiveTab('active');
  };

  const handleAdvanceStatus = (donationId: string, nextStatus: DonationItem['status'], label: string) => {
    onUpdateStatus(donationId, nextStatus);
    onShowToast(`Status updated: ${label}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* VOLUNTEER PROFILE HEADER CARD */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-soft">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#142e20] text-[#bbf246] flex items-center justify-center font-extrabold text-2xl shadow-forest shrink-0">
              <Bike className="w-8 h-8 text-[#bbf246]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Verified Food Rescue Courier
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  Active Field Volunteer
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142e20] mt-0.5">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  Operational Hub: {displayCity}
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

      {/* Task & Operations Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Courier Dispatch & GPS Sharing</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#142e20]">
            Delivery Missions & Realtime Tracking
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Pickup prepared surplus meals from donor kitchens and coordinate timely, temperature-controlled delivery to local shelters.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'available' ? 'bg-[#142e20] text-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Available Runs ({availableTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'active' ? 'bg-[#142e20] text-white shadow-sm' : 'text-gray-600'
            }`}
          >
            My Active Run ({myActiveTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'completed' ? 'bg-[#142e20] text-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Available Runs View */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#142e20]">Available Pickup Runs Ready for Dispatch</h3>
            <span className="text-xs text-gray-500 font-medium">Claim a route based on your current location</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTasks.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-gray-200 text-gray-500">
                <Truck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">No pending delivery runs right now.</p>
                <p className="text-[11px] text-gray-400 mt-1">Shelters that reserve food will generate dispatch requests automatically.</p>
              </div>
            ) : (
              availableTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-900/10">
                        {task.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">
                        {task.quantity} {task.unit}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#142e20]">{task.foodName}</h4>
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Pickup from:</span>
                          <strong className="text-gray-800">{task.restaurantName}</strong> — {task.pickupAddress}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Deliver to:</span>
                          <strong className="text-gray-800">{task.reservedByNgoName}</strong> (Shelter Reception)
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAcceptTask(task.id)}
                    className="mt-5 w-full py-2.5 rounded-full bg-[#142e20] hover:bg-[#1f4230] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#bbf246]" />
                    <span>Accept This Pickup Mission</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Runs View with Live GPS broadcasting */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#142e20]">Your Active Deliveries in Progress</h3>
            <span className="text-xs text-emerald-800 font-semibold">Live GPS Telemetry Active</span>
          </div>

          {myActiveTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 text-gray-500">
              <Bike className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold">No active deliveries underway.</p>
              <p className="text-[11px] text-gray-400 mt-1">Switch to "Available Runs" to pick up a pending assignment.</p>
            </div>
          ) : (
            myActiveTasks.map((task) => (
              <ActiveRunCard
                key={task.id}
                task={task}
                volunteerName={displayName}
                onAdvanceStatus={handleAdvanceStatus}
                onOpenMap={(t) => setSelectedTaskForMap(t)}
              />
            ))
          )}
        </div>
      )}

      {/* Live Map Modal */}
      {selectedTaskForMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full">
            <LiveDeliveryMap
              assignmentId={selectedTaskForMap.id}
              donationId={selectedTaskForMap.id}
              foodName={selectedTaskForMap.foodName}
              restaurantName={selectedTaskForMap.restaurantName}
              restaurantAddress={selectedTaskForMap.pickupAddress}
              ngoName={selectedTaskForMap.reservedByNgoName || 'Shelter'}
              ngoAddress="Shelter Distribution Hub"
              onClose={() => setSelectedTaskForMap(null)}
            />
          </div>
        </div>
      )}

      {/* Completed Runs View */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <h3 className="font-bold text-base text-[#142e20] mb-4">Completed Delivery Ledger</h3>
          {completedTasks.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No completed runs logged yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedTasks.map(task => (
                <div key={task.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-gray-800">{task.foodName}</strong>
                    <p className="text-gray-500 text-[11px]">{task.restaurantName} → {task.reservedByNgoName}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Verified Delivery Complete
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
