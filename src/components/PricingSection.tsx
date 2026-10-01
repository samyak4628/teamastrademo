import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import type { PricingPlan } from '../types';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Pilot',
      badge: 'Community Donors',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for independent cafes, bakeries, and kitchens beginning their surplus recovery journey.',
      features: [
        'Unlimited surplus food listings',
        'Direct local NGO discovery',
        'Basic pickup coordination',
        'Monthly donation receipt summary',
        'Free forever for registered NGOs & volunteers'
      ],
      cta: 'Join Free Pilot'
    },
    {
      id: 'pro',
      name: 'Pro Kitchen',
      badge: 'Most Popular',
      popular: true,
      priceMonthly: 999,
      priceAnnual: 799,
      description: 'For active restaurants, hotels, and banquet caterers managing frequent food donations.',
      features: [
        'All Starter features included',
        'Priority algorithmic NGO dispatch',
        'Real-time courier GPS tracking',
        'Automated FSSAI-compliant food logs',
        'Downloadable ESG & tax certificates',
        'Dedicated WhatsApp & phone support'
      ],
      cta: 'Start Pro Pilot'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Network',
      badge: 'Hospitality Chains',
      priceMonthly: 4999,
      priceAnnual: 3999,
      description: 'For multi-location restaurant chains, food courts, and corporate cafeteria operations.',
      features: [
        'All Pro features included',
        'Multi-branch centralized dashboard',
        'Role-based staff permissions',
        'Scope 3 carbon offset audit data',
        'Custom ERP / POS API integrations',
        'Dedicated enterprise account manager'
      ],
      cta: 'Contact Enterprise'
    }
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-emerald-950/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6f2] border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparent Pilot Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20] mb-4">
            Invest in Sustainability, <span className="text-emerald-700">Not Waste.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#52685c] leading-relaxed">
            Free forever for non-profit shelters and volunteers. Transparent pricing for commercial food donors.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-[#f0f4ee] border border-emerald-900/10">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                !isAnnual 
                  ? 'bg-white text-[#142e20] shadow-xs' 
                  : 'text-[#506558] hover:text-[#142e20]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isAnnual 
                  ? 'bg-[#142e20] text-[#bbf246] shadow-xs' 
                  : 'text-[#506558] hover:text-[#142e20]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bbf246] text-[#142e20] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-[#f4f8f1] border-2 border-emerald-600/60 shadow-soft scale-100 md:-translate-y-2'
                    : 'bg-[#fafcf9] border border-emerald-900/10 hover:border-emerald-900/25 hover:bg-white'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#142e20] text-[#bbf246] text-xs font-bold uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#142e20]">
                      {plan.name}
                    </h3>
                    {!plan.popular && plan.badge && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-900/10">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#50665a] mb-6 min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Price display */}
                  <div className="mb-6 pb-6 border-b border-emerald-900/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#142e20]">
                        {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs font-medium text-[#65796e]">
                          / month
                        </span>
                      )}
                    </div>
                    {isAnnual && price > 0 && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        Billed annually (₹{(price * 12).toLocaleString()}/yr)
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2f4337]">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan CTA */}
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.name)}
                    className={`w-full py-3 px-4 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
                      plan.popular
                        ? 'bg-[#142e20] hover:bg-emerald-900 text-white shadow-sm hover:shadow'
                        : 'bg-white hover:bg-emerald-50 text-[#142e20] border border-emerald-900/15'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <p className="text-[10px] text-center text-[#788e81] mt-2">
                    {price === 0 ? 'No credit card required' : '14-day risk-free pilot evaluation'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Non-Profit & Volunteer Exemption Banner */}
        <div className="mt-12 p-5 rounded-2xl bg-[#f0f6f2] border border-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#142e20]">
                Are you a Non-Profit, Orphanage, or Night Shelter?
              </h4>
              <p className="text-xs text-[#52665a]">
                ResQFood is completely free for verified charities and volunteers, backed by CSR donor contributions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('NGO Free Access')}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-900/10 shrink-0 transition-colors"
          >
            Claim NGO Free License
          </button>
        </div>

      </div>
    </section>
  );
};
