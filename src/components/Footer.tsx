import React from 'react';
import { ArrowUp, Shield } from 'lucide-react';
import type { PolicyType } from './PolicyModal';

interface FooterProps {
  onOpenPolicy?: (type: PolicyType) => void;
  onSelectWorkspace?: (workspace: 'public' | 'restaurant' | 'ngo' | 'volunteer') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onSelectWorkspace }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (onSelectWorkspace) {
      onSelectWorkspace('public');
    }
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        scrollToTop();
      }
    }, 100);
  };

  return (
    <footer className="bg-[#102318] text-emerald-100/90 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          
          {/* Brand Info with Logo */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-emerald-900/20 overflow-hidden">
                <img 
                  src="/assets/resqfood-logo.png" 
                  alt="ResQFood Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                ResQ<span className="text-[#bbf246]">Food</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-200/70 max-w-sm leading-relaxed mb-6">
              An AI-powered coordination platform helping restaurants, caterers, and food businesses donate surplus meals to verified local shelters with zero food waste.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-[11px] text-emerald-300">
              <Shield className="w-3.5 h-3.5 text-[#bbf246]" />
              <span>Aligned with FSSAI Surplus Sharing Framework</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#bbf246] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#impact" onClick={(e) => handleNavClick(e, '#impact')} className="hover:text-white transition-colors">Impact & Mission</a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="hover:text-white transition-colors">Pilot Pricing</a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-white transition-colors">About Us</a>
              </li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#bbf246] mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectWorkspace && onSelectWorkspace('restaurant')}
                  className="hover:text-white transition-colors text-left"
                >
                  For Commercial Kitchens
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectWorkspace && onSelectWorkspace('ngo')}
                  className="hover:text-white transition-colors text-left"
                >
                  For NGOs & Foodbanks
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectWorkspace && onSelectWorkspace('volunteer')}
                  className="hover:text-white transition-colors text-left"
                >
                  Volunteer Couriers
                </button>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  onClick={(e) => handleNavClick(e, '#pricing')} 
                  className="hover:text-white transition-colors"
                >
                  Enterprise Hospitality
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#bbf246] mb-4">
              Governance
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('privacy')}
                  className="hover:text-[#bbf246] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('terms')}
                  className="hover:text-[#bbf246] transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('safety')}
                  className="hover:text-[#bbf246] transition-colors text-left"
                >
                  Food Safety Disclaimers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy && onOpenPolicy('specs')}
                  className="hover:text-[#bbf246] transition-colors text-left"
                >
                  Supabase & Gemini Specs
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar with copyright and back-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60">
          <p>
            © {new Date().getFullYear()} ResQFood. All rights reserved. Created for Hackathon demonstration.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs transition-colors border border-emerald-800/40"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#bbf246]" />
          </button>
        </div>

      </div>
    </footer>
  );
};
