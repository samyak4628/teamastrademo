import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Globe, 
  ChevronDown, 
  Check, 
  LogIn, 
  ArrowRight,
  Bell,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Building,
  Heart,
  Bike
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../types';

interface NavbarProps {
  onOpenOnboarding: (role?: UserRole) => void;
  onOpenSignIn: () => void;
  onOpenDemo?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  activeWorkspaceView?: 'public' | 'restaurant' | 'ngo' | 'volunteer';
  onSelectWorkspace?: (view: 'public' | 'restaurant' | 'ngo' | 'volunteer') => void;
  onLanguageChange?: (lang: string) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
];

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenOnboarding, 
  onOpenSignIn,
  onOpenDemo: _onOpenDemo,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  activeWorkspaceView = 'public',
  onSelectWorkspace,
  onLanguageChange,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { user, profile, role, signOut } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  // Detect scroll to adjust navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#language-dropdown-container')) {
        setIsLangOpen(false);
      }
      if (!target.closest('#profile-dropdown-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Focused 4 core navigation links (Impact & Pricing removed as requested)
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'For Restaurants', href: '#restaurants' },
    { name: 'For NGOs', href: '#ngos' },
  ];

  const handleSelectLang = (langLabel: string) => {
    const short = langLabel.split(' ')[0];
    setSelectedLang(short);
    setIsLangOpen(false);
    if (onLanguageChange) {
      onLanguageChange(langLabel);
    }
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (activeWorkspaceView !== 'public' && onSelectWorkspace) {
      onSelectWorkspace('public');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayName = profile?.full_name || profile?.organization_name || user?.email?.split('@')[0] || 'Member';
  const displayRole = role || (profile?.role as UserRole) || 'restaurant';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('') || 'RQ';

  const handleNavigateToDashboard = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectWorkspace) {
      if (displayRole === 'restaurant' || displayRole === 'ngo' || displayRole === 'volunteer') {
        onSelectWorkspace(displayRole);
      } else {
        onSelectWorkspace('restaurant');
      }
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    await signOut();
    if (onSelectWorkspace) {
      onSelectWorkspace('public');
    }
  };

  const getRoleIcon = () => {
    switch (displayRole) {
      case 'ngo':
        return <Heart className="w-3 h-3 text-lime-800" />;
      case 'volunteer':
        return <Bike className="w-3 h-3 text-teal-800" />;
      default:
        return <Building className="w-3 h-3 text-emerald-800" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-5 lg:px-8 pt-2.5 pb-2">
      <div 
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 px-3.5 sm:px-5 lg:px-6 py-2 flex items-center justify-between gap-2 lg:gap-3 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-soft border border-emerald-950/10' 
            : 'bg-white/90 backdrop-blur-sm border border-emerald-900/10 shadow-xs'
        }`}
      >
        {/* ========================================================================= */}
        {/* SECTION 1: LEFT — ResQFood Logo and Brand Name (Protected & Never Compressed) */}
        {/* ========================================================================= */}
        <div className="flex items-center shrink-0 min-w-fit">
          <a 
            href="#home" 
            onClick={(e) => handleScrollTo(e, '#home')}
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-xl py-0.5 pr-1 sm:pr-2"
            aria-label="ResQFood Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-0.5 shadow-2xs border border-emerald-900/10 group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0">
              <img 
                src="/assets/resqfood-logo.png" 
                alt="ResQFood Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#142e20] shrink-0 whitespace-nowrap">
              ResQ<span className="text-[#246340]">Food</span>
            </span>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: CENTER — Workspace Switcher & 4 Core Links (Clearly Separated) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-center gap-2 xl:gap-3.5 flex-1 min-w-0 px-2">
          
          {/* Workspace Mode Switcher (Public, Restaurant, NGO, Volunteer) */}
          {onSelectWorkspace && (
            <div className="flex items-center bg-gray-100/90 p-0.5 rounded-full border border-gray-200/80 text-[11px] font-semibold shrink-0">
              <button
                type="button"
                onClick={() => onSelectWorkspace('public')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeWorkspaceView === 'public'
                    ? 'bg-white text-[#142e20] shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => onSelectWorkspace('restaurant')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeWorkspaceView === 'restaurant'
                    ? 'bg-[#142e20] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => onSelectWorkspace('ngo')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeWorkspaceView === 'ngo'
                    ? 'bg-[#142e20] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                NGO
              </button>
              <button
                type="button"
                onClick={() => onSelectWorkspace('volunteer')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeWorkspaceView === 'volunteer'
                    ? 'bg-[#142e20] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Volunteer
              </button>
            </div>
          )}

          {/* Core Desktop Navigation Links (Home, How It Works, For Restaurants, For NGOs) */}
          {activeWorkspaceView === 'public' && (
            <nav className="flex items-center gap-0.5 xl:gap-1 shrink-0">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-xs font-medium text-[#465b4f] hover:text-[#142e20] hover:bg-emerald-500/10 px-2.5 py-1 rounded-full transition-colors duration-150 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}

        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: RIGHT — Notifications, 3D Demo, Language, Sign In, Get Started */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 xl:gap-2 shrink-0 min-w-fit">
          
          {/* Functional Notification Center Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-900 transition-colors shrink-0"
              aria-label="Open notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}


          {/* Language Selector */}
          <div className="relative hidden md:block shrink-0" id="language-dropdown-container">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 text-xs font-medium text-[#465b4f] hover:text-[#142e20] hover:bg-emerald-500/10 px-2 py-1.5 rounded-full transition-colors duration-150 whitespace-nowrap"
              aria-expanded={isLangOpen}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden xl:inline">{selectedLang}</span>
              <span className="xl:hidden">{selectedLang.slice(0, 2).toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-[#465b4f]" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-soft border border-emerald-900/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-semibold text-emerald-900/60 uppercase tracking-wider">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLang(lang.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#142e20] hover:bg-[#f2f7ef] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {selectedLang.startsWith(lang.label.split(' ')[0]) && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile or Guest Auth Actions */}
          {user ? (
            <div className="relative shrink-0" id="profile-dropdown-container">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-900/15 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 shrink-0"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center font-bold text-[11px] shadow-2xs shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-[#142e20] max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {getRoleIcon()}
                    <span className="text-[9px] font-semibold uppercase text-emerald-800 tracking-wider">
                      {displayRole}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-500 ml-0.5" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-3xl bg-white shadow-2xl border border-emerald-900/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-3 bg-[#f7f9f6] border-b border-emerald-900/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-[#142e20] truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {user.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-extrabold capitalize">
                          {getRoleIcon()}
                          <span>{displayRole} Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-[#142e20] hover:bg-emerald-50 rounded-xl transition-colors text-left"
                      role="menuitem"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNavigateToDashboard}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-[#142e20] hover:bg-emerald-50 rounded-xl transition-colors text-left"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenSettings) onOpenSettings();
                        else if (onOpenProfile) onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-[#142e20] hover:bg-emerald-50 rounded-xl transition-colors text-left"
                      role="menuitem"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Account Settings</span>
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Sign In */}
              <button
                type="button"
                onClick={onOpenSignIn}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#142e20] hover:text-emerald-800 px-2.5 py-1.5 rounded-full hover:bg-emerald-50/80 transition-colors shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign In</span>
              </button>

              {/* Get Started Button (100% Inside Container, Perfectly Spaced) */}
              <button
                type="button"
                onClick={() => onOpenOnboarding()}
                className="inline-flex items-center justify-center gap-1.5 bg-[#bbf246] hover:bg-[#a8e632] active:scale-95 text-[#142e20] font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xs hover:shadow transition-all duration-200 shrink-0 whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Button (< 1024px) */}
          <div className="flex lg:hidden items-center ml-0.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-full text-[#142e20] hover:bg-emerald-500/10 focus:outline-none transition-colors"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATION DROPDOWN MENU (< 1024px) */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-soft border border-emerald-950/10 animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* User Profile Card on Mobile if Logged In */}
          {user && (
            <div className="mb-3 p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142e20]">{displayName}</h4>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold capitalize mt-0.5">
                    {displayRole} Role
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-[#142e20] hover:bg-emerald-50 rounded-xl transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-emerald-900/10 flex flex-col gap-2.5">
            {/* Mobile Workspace Switcher */}
            {onSelectWorkspace && (
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 px-1">
                  Switch Operations Workspace
                </span>
                <div className="grid grid-cols-4 gap-1 text-center text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSelectWorkspace('public');
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[11px] ${activeWorkspaceView === 'public' ? 'bg-[#142e20] text-white shadow-2xs' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSelectWorkspace('restaurant');
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[11px] ${activeWorkspaceView === 'restaurant' ? 'bg-[#142e20] text-white shadow-2xs' : 'bg-emerald-50 text-emerald-900'}`}
                  >
                    Restaurant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSelectWorkspace('ngo');
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[11px] ${activeWorkspaceView === 'ngo' ? 'bg-[#142e20] text-white shadow-2xs' : 'bg-emerald-50 text-emerald-900'}`}
                  >
                    NGO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSelectWorkspace('volunteer');
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[11px] ${activeWorkspaceView === 'volunteer' ? 'bg-[#142e20] text-white shadow-2xs' : 'bg-emerald-50 text-emerald-900'}`}
                  >
                    Volunteer
                  </button>
                </div>
              </div>
            )}

            {/* Language on Mobile */}
            <div className="pt-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="w-full py-2 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Language: {selectedLang}</span>
                </button>
              </div>
            </div>

            {/* Mobile Actions: Profile shortcuts or Sign In/Up */}
            {user ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#142e20] bg-emerald-50 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-900/10"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleNavigateToDashboard}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#142e20] bg-[#bbf246] rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSignIn();
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#142e20] bg-gray-100 hover:bg-gray-200 rounded-full text-center transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold text-[#142e20] bg-[#bbf246] hover:bg-[#a8e632] rounded-full text-center shadow-xs transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
