import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { UserTypeCards } from './components/UserTypeCards';
import { NGOMapPreview } from './components/NGOMapPreview';
import { ImpactSection } from './components/ImpactSection';
import { PricingSection } from './components/PricingSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SignInModal } from './components/SignInModal';
import { ProfileModal } from './components/ProfileModal';
import { RestaurantDashboard } from './components/RestaurantDashboard';
import { NGODashboard } from './components/NGODashboard';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PolicyModal, type PolicyType } from './components/PolicyModal';
import { useDonationStore } from './lib/donationStore';
import { useAuth } from './lib/AuthContext';
import type { UserRole } from './types';
import { Check, LogOut, LayoutDashboard, ArrowLeft, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<'public' | 'restaurant' | 'ngo' | 'volunteer'>('public');
  const [selectedRole, setSelectedRole] = useState<UserRole>('restaurant');
  const [initialEmail, setInitialEmail] = useState('');

  // Realtime Reactive Donation & Notification Store
  const {
    donations,
    notifications,
    createDonation,
    reserveDonation,
    assignVolunteer,
    updateDonationStatus,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDonationStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync workspace with authenticated role when user logs in
  //test
  useEffect(() => {
    if (user && role) {
      if (role === 'restaurant' || role === 'ngo' || role === 'volunteer') {
        // If currently in public or another role, redirect to verified role dashboard
        if (activeWorkspace === 'public') {
          setActiveWorkspace(role);
          showToast(`Welcome! Directed to your verified ${role.toUpperCase()} dashboard.`);
        }
      }
    }
  }, [user, role]);

  const handleOpenOnboarding = (r: UserRole = 'restaurant', email: string = '') => {
    setSelectedRole(r);
    setInitialEmail(email);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (r: UserRole, orgName: string) => {
    showToast(`Account registered for ${orgName || r.toUpperCase()}! You can access your workspace.`);
    if (r === 'restaurant' || r === 'ngo' || r === 'volunteer') {
      setActiveWorkspace(r);
    }
  };

  const handleLoginSuccess = (r: UserRole, userEmail: string) => {
    showToast(`Signed in successfully as ${profile?.organization_name || profile?.full_name || userEmail}`);
    if (r === 'restaurant' || r === 'ngo' || r === 'volunteer') {
      setActiveWorkspace(r);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setActiveWorkspace('public');
    showToast('Signed out of session.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Determine current active organization display name
  const activeOrgName = profile?.organization_name || profile?.full_name || user?.email || 'Partner';
  const verifiedRole = role || (profile?.role as UserRole) || 'restaurant';

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-[#12261b] flex flex-col selection:bg-[#c8f34d] selection:text-[#12261b]">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#142e20] text-white shadow-forest border border-emerald-700/40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-[#bbf246] text-[#142e20] flex items-center justify-center font-bold text-xs shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Authenticated Role Banner */}
      {user && (
        <div className="bg-[#142e20] text-white text-xs py-2 px-4 sticky top-0 z-50 flex items-center justify-between border-b border-emerald-800 shadow-sm">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#bbf246] animate-pulse shrink-0" />
              <span className="truncate">
                Logged in: <strong className="text-[#bbf246]">{activeOrgName}</strong> ({verifiedRole.toUpperCase()})
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="text-[11px] text-gray-200 hover:text-white underline hidden sm:inline"
              >
                Profile & Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  if (verifiedRole === 'restaurant' || verifiedRole === 'ngo' || verifiedRole === 'volunteer') {
                    setActiveWorkspace(verifiedRole);
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#bbf246] hover:underline"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>My Dashboard</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        onOpenOnboarding={handleOpenOnboarding}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        activeWorkspaceView={activeWorkspace}
        onSelectWorkspace={(view) => {
          setActiveWorkspace(view);
          if (view !== 'public') {
            showToast(`Switched to ${view.toUpperCase()} Operations Workspace.`);
          }
        }}
        onLanguageChange={(lang) => {
          showToast(`Language preference set to ${lang}.`);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* PUBLIC LANDING VIEW (Default) */}
        {activeWorkspace === 'public' && (
          <>
            {/* Hero Section with 300 PNG Frames 3D Scroll Background */}
            <HeroSection
              onOpenOnboarding={handleOpenOnboarding}
              onOpenDemo={() => setIsDemoOpen(true)}
            />

            {/* How It Works Section with functional explore step buttons & AI simulation */}
            <HowItWorks
              onExploreStep={(stepIdx) => {
                if (stepIdx === 0) {
                  setActiveWorkspace('restaurant');
                  showToast('Navigated to Restaurant Kitchen Portal. Post your surplus batch below.');
                } else if (stepIdx === 1) {
                  const el = document.querySelector('#ngos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  showToast('Navigated to Hyperlocal NGO Discovery Map.');
                } else if (stepIdx === 2) {
                  setActiveWorkspace('volunteer');
                  showToast('Navigated to Volunteer Courier Operations. Track routes and live GPS.');
                } else if (stepIdx === 3) {
                  const el = document.querySelector('#impact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  showToast('Navigated to Verified Sustainability Impact Calculator.');
                }
              }}
            />

            {/* User Type Ecosystem (Restaurants, NGOs, Volunteers, Enterprises) */}
            <UserTypeCards
              onSelectRole={(r) => {
                if (r === 'restaurant' || r === 'ngo' || r === 'volunteer') {
                  setActiveWorkspace(r);
                  showToast(`Opened ${r.toUpperCase()} Operations Dashboard.`);
                } else {
                  handleOpenOnboarding(r);
                }
              }}
              onOpenRegister={(r) => {
                handleOpenOnboarding(r);
              }}
            />

            {/* Interactive NGO Discovery Map & Live Dispatch Tracking */}
            <NGOMapPreview />

            {/* Impact Mission & Interactive Surplus Calculator */}
            <ImpactSection />

            {/* Pilot Pricing Plans */}
            <PricingSection
              onSelectPlan={(planName) => {
                if (planName.toLowerCase().includes('ngo')) {
                  handleOpenOnboarding('ngo');
                } else if (planName.toLowerCase().includes('enterprise')) {
                  handleOpenOnboarding('enterprise');
                } else {
                  handleOpenOnboarding('restaurant');
                }
                showToast(`Selected "${planName}". Complete your registration.`);
              }}
            />

            {/* Mission & Newsletter Section */}
            <AboutSection />
          </>
        )}

        {/* ROLE WORKSPACES */}
        {activeWorkspace !== 'public' && (
          <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb / Return to Public View */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveWorkspace('public')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#142e20] bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Public Website</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span>Active Portal:</span>
                <span className="capitalize text-emerald-900 font-bold px-2.5 py-0.5 rounded-full bg-emerald-100">
                  {activeWorkspace} Operations
                </span>
              </div>
            </div>

            {/* Role Guard Notice if authenticated user browses a different role workspace */}
            {user && verifiedRole !== activeWorkspace && (
              <div className="mb-6 p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>
                    Your authenticated account is verified as <strong>{verifiedRole.toUpperCase()}</strong>. You are currently previewing the <strong>{activeWorkspace.toUpperCase()}</strong> portal.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (verifiedRole === 'restaurant' || verifiedRole === 'ngo' || verifiedRole === 'volunteer') {
                      setActiveWorkspace(verifiedRole);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-amber-800 text-white font-bold text-xs shrink-0 hover:bg-amber-900 shadow-xs"
                >
                  Go to My {verifiedRole.toUpperCase()} Dashboard
                </button>
              </div>
            )}

            {/* Restaurant Portal */}
            {activeWorkspace === 'restaurant' && (
              <RestaurantDashboard
                donations={donations}
                onCreateDonation={(d) => {
                  createDonation(d);
                  showToast('Surplus donation published successfully! Recommended NGOs notified.');
                }}
                restaurantName={profile?.organization_name || (user?.email ? user.email.split('@')[0] : 'The Golden Bistro')}
                userEmail={user?.email || 'bistro@resqfood.org'}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={() => setIsProfileModalOpen(true)}
                onLogout={handleLogout}
              />
            )}

            {/* NGO Portal */}
            {activeWorkspace === 'ngo' && (
              <NGODashboard
                donations={donations}
                onReserveDonation={reserveDonation}
                ngoName={profile?.organization_name || (user?.email ? user.email.split('@')[0] : 'Aasra Community Food Bank')}
                userEmail={user?.email || 'shelter@resqfood.org'}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={() => setIsProfileModalOpen(true)}
                onLogout={handleLogout}
                onShowToast={showToast}
              />
            )}

            {/* Volunteer Portal */}
            {activeWorkspace === 'volunteer' && (
              <VolunteerDashboard
                donations={donations}
                onAssignVolunteer={assignVolunteer}
                onUpdateStatus={updateDonationStatus}
                volunteerName={profile?.full_name || profile?.organization_name || 'Marcus S. (City Courier)'}
                userEmail={user?.email || 'volunteer@resqfood.org'}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={() => setIsProfileModalOpen(true)}
                onLogout={handleLogout}
                onShowToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPolicy={(p) => setSelectedPolicy(p)}
        onSelectWorkspace={(view) => {
          setActiveWorkspace(view);
          if (view !== 'public') {
            showToast(`Switched to ${view.toUpperCase()} Operations Workspace.`);
          }
        }}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
      />

      {/* Modals */}
      <PolicyModal
        isOpen={selectedPolicy !== null}
        type={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />

      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onOpenOnboarding={() => handleOpenOnboarding('restaurant')}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialRole={selectedRole}
        initialEmail={initialEmail}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        onSwitchToSignIn={() => {
          setIsOnboardingOpen(false);
          setIsSignInOpen(true);
        }}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccessLogin={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsSignInOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onShowToast={showToast}
      />

    </div>
  );
};

export default App;
