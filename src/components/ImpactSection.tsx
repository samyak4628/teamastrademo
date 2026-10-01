import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Clock3, 
  Users, 
  Calculator, 
  Leaf, 
  Droplets, 
  HeartHandshake
} from 'lucide-react';

export const ImpactSection: React.FC = () => {
  const [weeklyMeals, setWeeklyMeals] = useState<number>(120);

  // Environmental calculations based on UN FAO metrics
  const annualMeals = weeklyMeals * 52;
  const co2AvoidedKg = Math.round(annualMeals * 1.8);
  const waterSavedLiters = Math.round(annualMeals * 850);
  const familiesSupported = Math.round(annualMeals / 120);

  return (
    <section id="impact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#f7f9f6]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Planetary & Social Mission</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20] mb-4">
            Every Meal Deserves a Chance. <br />
            <span className="text-emerald-700">Real Actions. Real Impact.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#52685c] leading-relaxed">
            One-third of all food produced globally is wasted, while millions face daily hunger. ResQFood bridges this gap with algorithmic speed and dignified logistics.
          </p>
        </div>

        {/* 3 Impact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div className="rounded-3xl p-8 bg-white border border-emerald-900/10 shadow-xs hover:shadow-soft transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#142e20] mb-3">
              1. Drastically Less Waste
            </h3>
            <p className="text-xs sm:text-sm text-[#50665a] leading-relaxed">
              Diverting commercial surplus from methane-producing landfills directly into safe refrigerated storage and immediate consumption.
            </p>
          </div>

          <div className="rounded-3xl p-8 bg-white border border-emerald-900/10 shadow-xs hover:shadow-soft transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6">
              <Clock3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#142e20] mb-3">
              2. Seamless Coordination
            </h3>
            <p className="text-xs sm:text-sm text-[#50665a] leading-relaxed">
              Replacing chaotic phone calls and WhatsApp groups with automated matching, route dispatch, and cold-chain compliance tracking.
            </p>
          </div>

          <div className="rounded-3xl p-8 bg-white border border-emerald-900/10 shadow-xs hover:shadow-soft transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#142e20] mb-3">
              3. Dignified Access
            </h3>
            <p className="text-xs sm:text-sm text-[#50665a] leading-relaxed">
              Empowering grassroots shelters and community feeding programs with high-quality, hot, nutritious meals on predictable schedules.
            </p>
          </div>

        </div>

        {/* Interactive Impact Calculator Card */}
        <div className="rounded-3xl bg-[#142e20] text-white p-7 sm:p-10 shadow-forest border border-emerald-800/40 relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#bbf246]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Calculator Controls */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/40 text-xs font-semibold text-[#bbf246] mb-4">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Sustainability Calculator</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Estimate Your Kitchen's Annual Impact
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/80 mb-6">
                Adjust your estimated surplus meals per week to calculate environmental savings and lives nourished.
              </p>

              {/* Slider Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-emerald-200">Average Surplus Meals / Week</span>
                  <span className="text-xl font-bold text-[#bbf246]">{weeklyMeals} meals</span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={weeklyMeals}
                  onChange={(e) => setWeeklyMeals(Number(e.target.value))}
                  className="w-full h-2.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#bbf246]"
                  aria-label="Surplus meals per week slider"
                />

                <div className="flex justify-between text-[11px] text-emerald-300/60 font-mono">
                  <span>20 meals (Small Cafe)</span>
                  <span>500 meals (Hotel)</span>
                  <span>1,000+ (Convention)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Pillars */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/60 backdrop-blur-md border border-emerald-700/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-[#bbf246] flex items-center justify-center mb-2">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {annualMeals.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-emerald-200/90 mt-0.5">
                  Meals Saved / Year
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/60 backdrop-blur-md border border-emerald-700/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-[#bbf246] flex items-center justify-center mb-2">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#bbf246]">
                  {co2AvoidedKg.toLocaleString()} kg
                </div>
                <div className="text-xs font-medium text-emerald-200/90 mt-0.5">
                  CO₂e Diverted
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/60 backdrop-blur-md border border-emerald-700/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-[#bbf246] flex items-center justify-center mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {(waterSavedLiters / 1000).toFixed(0)}k L
                </div>
                <div className="text-xs font-medium text-emerald-200/90 mt-0.5">
                  Freshwater Conserved
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/60 backdrop-blur-md border border-emerald-700/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-[#bbf246] flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {familiesSupported}
                </div>
                <div className="text-xs font-medium text-emerald-200/90 mt-0.5">
                  Families Sustained
                </div>
              </div>

            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-emerald-800/60 text-[11px] text-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
            <span>* Illustrative environmental impact estimation derived from UN FAO & WRI food loss conversion factors.</span>
            <span className="font-semibold text-[#bbf246]">Zero Greenwashing Guarantee</span>
          </div>

        </div>

      </div>
    </section>
  );
};
