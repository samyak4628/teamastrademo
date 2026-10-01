import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Leaf,
  Globe2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AboutSection: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#bbf246', '#22c55e', '#142e20']
      });
    } catch {
      // ignore
    }
  };

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#f7f9f6]">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission & Core Standards */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Our Purpose & Standards</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20] mb-6">
              Turning Commercial Surplus into <span className="text-emerald-700">Daily Dignity.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#4e6356] leading-relaxed mb-6">
              ResQFood was born out of a stark paradox: while quality food is discarded daily from buffets, banquets, and commercial kitchens, nearby shelters struggle to secure sufficient nutrition.
            </p>

            <p className="text-xs sm:text-sm text-[#5a6f63] leading-relaxed mb-8">
              By combining AI-driven classification, strict food safety parameters (inspired by FSSAI's Indian Food Sharing Alliance), and hyper-local volunteer routing, we make surplus donation faster and safer than throwing food away.
            </p>

            {/* 3 Value Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-sm font-bold text-[#142e20]">Safety-First Protocol</h4>
                <p className="text-xs text-[#5f7468] mt-1">
                  Enforces temperature tracking, packaging seals, and strict consumption deadlines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
                <Globe2 className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-sm font-bold text-[#142e20]">Transparent Data</h4>
                <p className="text-xs text-[#5f7468] mt-1">
                  Every gram rescued is cryptographically verified to generate honest ESG reports.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
                <Lock className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-sm font-bold text-[#142e20]">Donor Protection</h4>
                <p className="text-xs text-[#5f7468] mt-1">
                  Adheres to Good Samaritan surplus redistribution guidelines and secure role permissions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Lime Accent Card matching reference image ("Stay Inspired. Stay Informed.") */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#c6f135] p-8 sm:p-10 text-[#142e20] shadow-soft border border-[#aedf1a] relative overflow-hidden">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Community Updates</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Stay Inspired. <br />Stay Informed.
              </h3>

              <p className="text-xs sm:text-sm text-[#274619] leading-relaxed mb-6 font-medium">
                Subscribe to our newsletter and get the latest updates on food rescue routes, partner stories, and platform release notes.
              </p>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/95 p-1.5 rounded-2xl sm:rounded-full shadow-sm border border-black/10 focus-within:ring-2 focus-within:ring-[#142e20]">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 text-xs sm:text-sm bg-transparent text-[#142e20] placeholder-[#5c7057] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#142e20] hover:bg-black text-white text-xs font-semibold whitespace-nowrap transition-colors"
                    >
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#bbf246]" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#2c4e1b] ml-2">
                    We respect your privacy. Zero spam, unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-white/90 text-[#142e20] text-xs sm:text-sm font-semibold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>You're on the list! Welcome to the ResQFood movement.</span>
                </div>
              )}

              {/* Social Proof Mini Cluster (matching reference) */}
              <div className="mt-8 pt-6 border-t border-[#142e20]/15 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full border-2 border-[#c6f135] bg-[#142e20] text-white flex items-center justify-center text-[10px] font-bold">
                    SM
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-[#c6f135] bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                    AL
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-[#c6f135] bg-teal-800 text-white flex items-center justify-center text-[10px] font-bold">
                    PT
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1e3e13]">
                  Join thousands of change-makers worldwide
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
