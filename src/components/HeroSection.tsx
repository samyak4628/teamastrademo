import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { ScrollFrameBackground } from './ScrollFrameBackground';
import type { UserRole } from '../types';

interface HeroSectionProps {
  onOpenOnboarding: (role?: UserRole, initialEmail?: string) => void;
  onOpenDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onOpenOnboarding,
  onOpenDemo: _onOpenDemo
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setInputError('Please enter a valid email address');
      return;
    }
    setInputError('');
    onOpenOnboarding('restaurant', emailInput.trim());
  };

  const stats = [
    { value: '45,000+', label: 'Meals Rescued', note: 'Verified donations' },
    { value: '380+', label: 'Restaurant Donors', note: 'Kitchens & caterers' },
    { value: '190+', label: 'NGO Partners', note: 'Shelters & foodbanks' },
    { value: '100%', label: 'Zero Food Waste', note: 'Target mission' },
  ];

  return (
    <section 
      id="home" 
      ref={containerRef}
      className="relative min-h-[220vh] sm:min-h-[250vh] bg-transparent"
    >
      {/* 
        LAYER 1: STICKY 3D SCROLL STAGE
        Pins the 3D frame animation to the viewport for the entire scroll duration.
        Zero <video> tags. Zero continuous loop. Strictly controlled by user scroll wheel or touch.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        <ScrollFrameBackground containerRef={containerRef} />
      </div>

      {/* 
        LAYER 2: FOREGROUND CONTENT TRACK
        Layered above the 3D frame animation (z-10).
        Negative top margin aligns Screen 1 with the initial viewport.
      */}
      <div className="relative z-10 -mt-[100vh] pointer-events-auto">
        
        {/* Screen 1: Hero Header & Quick Actions */}
        <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Glassmorphic Hero Box: Ensures 100% text contrast while showcasing 3D background */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left bg-white/85 backdrop-blur-md p-6 sm:p-7 xl:p-8 rounded-3xl border border-white/80 shadow-soft max-w-xl">
              
              {/* Top pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-emerald-900/10 shadow-2xs mb-3.5 text-[11px] sm:text-xs font-semibold tracking-wider text-[#1e4633] uppercase">
                <img src="/assets/resqfood-logo.png" alt="ResQFood Icon" className="w-3.5 h-3.5 object-contain" />
                <span>ResQFood • Food Rescue Coordination</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold tracking-tight text-[#142e20] leading-[1.12] mb-3">
                From <span className="text-[#246340] underline decoration-[#bbf246] decoration-4 underline-offset-4">Surplus</span> to <span className="text-[#246340]">Smiles.</span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#32493b] font-medium leading-relaxed max-w-lg mb-5">
                An AI-powered platform connecting restaurants with nearby NGOs to rescue surplus food through smart matching, seamless coordination, and live delivery tracking.
              </p>

              {/* Interactive Quick Join Input Form */}
              <form onSubmit={handleQuickJoin} className="w-full max-w-md mb-5">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center p-1 sm:p-1.5 rounded-2xl sm:rounded-full bg-white shadow-soft border border-emerald-950/15 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all duration-200">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    placeholder="Enter your email to join ResQFood"
                    aria-label="Email address for ResQFood pilot"
                    className="w-full px-4 py-2 sm:py-2 text-xs sm:text-sm bg-transparent text-[#142e20] placeholder-[#6d8376] focus:outline-none rounded-full"
                  />
                  <button
                    type="submit"
                    className="mt-1.5 sm:mt-0 flex items-center justify-center gap-1.5 bg-[#142e20] hover:bg-[#1f4230] text-white px-4 sm:px-5 py-2 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:shadow transition-all duration-200 active:scale-95 shrink-0"
                  >
                    <span>Join Us</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#bbf246]" />
                  </button>
                </div>
                {inputError && (
                  <p className="text-xs text-rose-600 mt-1 ml-3 font-medium">{inputError}</p>
                )}
              </form>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => onOpenOnboarding()}
                  className="inline-flex items-center gap-2 bg-[#bbf246] hover:bg-[#a8e632] text-[#142e20] font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Social Proof Row */}
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    RK
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-lime-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    HF
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    CC
                  </div>
                </div>
                <p className="text-xs text-[#465b4f] font-medium">
                  Join <span className="font-extrabold text-[#142e20]">380+</span> restaurants and NGOs fighting food waste.
                </p>
              </div>

            </div>

            {/* Right Area: Clean unobstructed space showcasing the 3D animated basket */}
            <div className="lg:col-span-6 hidden lg:block pointer-events-none" />

          </div>

          <div className="h-6" />

        </div>

        {/* 
          Screen 2: Real-Time Verified Impact (appears as user scrolls down and 3D basket rotates!)
        */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 pt-28 sm:pt-36">
          <div className="mb-6 max-w-xl bg-white/85 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Real-Time Verified Impact
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#142e20] mt-0.5">
              Surplus Diverted into Daily Smiles
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white/60 shadow-soft hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142e20] group-hover:text-emerald-700 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#304439] mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#6d8174] mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{stat.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-[#63796d]">
              * Illustrative platform metrics. Verification compliant with safe surplus food sharing guidance.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};
