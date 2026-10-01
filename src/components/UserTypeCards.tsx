import React from 'react';
import { 
  Building2, 
  Heart, 
  Bike, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import type { UserRole, UserGroup } from '../types';

interface UserTypeCardsProps {
  onSelectRole: (role: UserRole) => void;
  onOpenRegister?: (role: UserRole) => void;
}

export const UserTypeCards: React.FC<UserTypeCardsProps> = ({ onSelectRole, onOpenRegister }) => {
  const userGroups: UserGroup[] = [
    {
      id: 'restaurant',
      title: 'For Restaurants & Kitchens',
      badge: 'Food Donors',
      tagline: 'Zero Waste Kitchen Operations',
      description: 'Manage surplus food, connect with nearby NGOs, and coordinate donations more efficiently while earning tax & ESG certificates.',
      features: [
        'Post surplus batches in 45 seconds',
        'AI dietary & freshness classification',
        'Automated local shelter matching',
        'Digital tax & CSR impact records'
      ],
      ctaText: 'For Restaurants'
    },
    {
      id: 'ngo',
      title: 'For NGOs & Shelters',
      badge: 'Food Receivers',
      tagline: 'Reliable Meal Access',
      description: 'Discover available food, manage collections, and receive donations from local restaurants matched to your exact shelter capacity.',
      features: [
        'Real-time surplus alerts by radius',
        'Accept or decline with 1 click',
        'Cold-chain & safety verification',
        'Free forever for registered NGOs'
      ],
      ctaText: 'For NGOs'
    },
    {
      id: 'volunteer',
      title: 'For Volunteers & Couriers',
      badge: 'Community Heroes',
      tagline: 'Hands-on Food Rescue',
      description: 'Help collect and deliver food to communities that need it. Earn verified community service hours and community recognition.',
      features: [
        'Flexible on-demand pickup tasks',
        'Turn-by-turn route guidance',
        'Contactless safety confirmation',
        'Verified community service credits'
      ],
      ctaText: 'Become a Volunteer'
    },
    {
      id: 'enterprise',
      title: 'For Enterprises & Chains',
      badge: 'Multi-Location',
      tagline: 'Corporate Sustainability',
      description: 'Coordinate food recovery across nationwide locations, track waste diversion, and generate comprehensive CSR audit reports.',
      features: [
        'Centralized corporate dashboard',
        'Multi-branch franchise governance',
        'Scope 3 emissions reduction data',
        'Dedicated account management'
      ],
      ctaText: 'Explore Enterprise'
    }
  ];

  return (
    <section id="restaurants" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#f7f9f6] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tailored Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20] mb-4">
            Built for Everyone in the <span className="text-emerald-700">Food Rescue Chain.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#52685c] leading-relaxed">
            Whether you run a Michelin-starred kitchen, manage a city shelter, or ride a bicycle to distribute meals, ResQFood empowers you.
          </p>
        </div>

        {/* 4 User Type Cards Grid matching Reference Tall Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userGroups.map((group) => {
            const isRestaurant = group.id === 'restaurant';
            const isNGO = group.id === 'ngo';
            const isVolunteer = group.id === 'volunteer';

            return (
              <div
                key={group.id}
                className="rounded-3xl p-7 bg-white border border-emerald-900/10 shadow-xs hover:shadow-soft hover:border-emerald-600/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#f0f6f2] group-hover:bg-[#142e20] group-hover:text-[#bbf246] text-[#142e20] flex items-center justify-center transition-colors">
                      {isRestaurant && <Store className="w-6 h-6" />}
                      {isNGO && <Heart className="w-6 h-6" />}
                      {isVolunteer && <Bike className="w-6 h-6" />}
                      {!isRestaurant && !isNGO && !isVolunteer && <Building2 className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-900/10">
                      {group.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    {group.tagline}
                  </div>

                  <h3 className="text-xl font-bold text-[#142e20] mb-3">
                    {group.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#50665a] leading-relaxed mb-6">
                    {group.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-2.5 mb-8">
                    {group.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#394d42]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onSelectRole(group.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#f4f7f2] group-hover:bg-[#142e20] text-[#142e20] group-hover:text-white font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 border border-emerald-900/10 group-hover:border-[#142e20]"
                  >
                    <span>{group.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {onOpenRegister && (
                    <button
                      type="button"
                      onClick={() => onOpenRegister(group.id)}
                      className="w-full text-center text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline py-1 transition-colors"
                    >
                      New partner? Register here
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
