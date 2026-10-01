import React, { useState } from 'react';
import { 
  Navigation, 
  Store, 
  Heart, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import type { NGOMarkerData } from '../types';
import { NGOMarker } from './NGOMarker';
import { DeliveryStatusCard } from './DeliveryStatusCard';

export const NGOMapPreview: React.FC = () => {
  const sampleNGOs: NGOMarkerData[] = [
    {
      id: 'ngo-1',
      name: 'Aasra Community Foodbank',
      type: 'Night Shelter & Community Kitchen',
      distance: '1.4 km (6 min drive)',
      capacity: '60 meals intake capacity',
      coordinates: { x: 68, y: 38 },
      status: 'available',
      verified: true
    },
    {
      id: 'ngo-2',
      name: 'Mother Teresa Relief Home',
      type: 'Children & Elderly Care',
      distance: '2.8 km (11 min drive)',
      capacity: '120 meals intake capacity',
      coordinates: { x: 32, y: 62 },
      status: 'urgent',
      verified: true
    },
    {
      id: 'ngo-3',
      name: 'City Hope Shelter',
      type: 'Homeless Recovery Center',
      distance: '3.5 km (14 min drive)',
      capacity: '45 meals intake capacity',
      coordinates: { x: 78, y: 76 },
      status: 'receiving',
      verified: true
    }
  ];

  const [selectedNGO, setSelectedNGO] = useState<NGOMarkerData>(sampleNGOs[0]);
  const [filterRadius, setFilterRadius] = useState<string>('5km');

  return (
    <section id="ngos" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-emerald-950/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6f2] border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Geofencing & Routing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20]">
              Hyperlocal NGO Discovery & <span className="text-emerald-700">Live Dispatch.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#52685c] mt-2 max-w-2xl">
              Don’t let food go cold. Our spatial matching algorithms connect restaurant kitchens with verified recipient shelters within minutes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#50665a]">Radius Filter:</span>
            <div className="inline-flex p-1 rounded-full bg-[#f0f4ee] border border-emerald-900/10">
              {['3km', '5km', '10km'].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setFilterRadius(radius)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    filterRadius === radius
                      ? 'bg-[#142e20] text-[#bbf246] shadow-xs'
                      : 'text-[#485c51] hover:text-[#142e20]'
                  }`}
                >
                  {radius}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interactive Map & Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map Preview Area */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-emerald-900/15 shadow-soft bg-[#edf3ea] relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-between">
            
            {/* Illustrative Stylized Vector Map Background */}
            <svg 
              className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" 
              viewBox="0 0 800 600" 
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5e4d2" strokeWidth="1" />
                </pattern>
              </defs>

              {/* River/Water Feature */}
              <path 
                d="M -50 250 C 150 220 280 340 450 300 C 600 270 700 380 900 330" 
                fill="none" 
                stroke="#cbe3d9" 
                strokeWidth="48" 
                strokeLinecap="round" 
              />
              
              {/* Park Zones */}
              <rect x="80" y="80" width="160" height="130" rx="20" fill="#d9ebd6" />
              <rect x="520" y="380" width="220" height="140" rx="25" fill="#d9ebd6" />
              <circle cx="680" cy="140" r="70" fill="#d9ebd6" />

              {/* Grid Roads */}
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Major Roads / Arteries */}
              <path d="M 0 160 L 800 160" stroke="#ffffff" strokeWidth="8" />
              <path d="M 0 440 L 800 440" stroke="#ffffff" strokeWidth="8" />
              <path d="M 240 0 L 240 600" stroke="#ffffff" strokeWidth="8" />
              <path d="M 560 0 L 560 600" stroke="#ffffff" strokeWidth="8" />

              {/* Active Delivery Route from Restaurant to Aasra NGO */}
              <path 
                d="M 180 220 L 240 220 L 240 160 L 420 160 L 544 228" 
                fill="none" 
                stroke="#246340" 
                strokeWidth="5" 
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>

            {/* Top Overlay Badge & Search Pill */}
            <div className="relative z-20 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-emerald-900/10 text-xs font-semibold text-[#142e20] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sector: Central Metro District</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-[#142e20] text-[#bbf246] text-xs font-semibold shadow-xs">
                3 Verified NGOs in {filterRadius}
              </div>
            </div>

            {/* Restaurant Donor Marker (Origin Point) */}
            <div 
              style={{ left: '22.5%', top: '36.6%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#142e20] text-white flex items-center justify-center shadow-soft border-2 border-white ring-4 ring-emerald-900/20">
                <Store className="w-5 h-5 text-[#bbf246]" />
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-md bg-[#142e20] text-white text-[10px] font-semibold whitespace-nowrap shadow-sm">
                Bistro Central (Donor)
              </div>
            </div>

            {/* Courier in Motion on the Route */}
            <div 
              style={{ left: '42%', top: '27%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div className="w-7 h-7 rounded-full bg-[#bbf246] text-[#142e20] flex items-center justify-center shadow-md border border-[#142e20] animate-bounce">
                <Navigation className="w-3.5 h-3.5 fill-current rotate-45" />
              </div>
            </div>

            {/* Recipient NGO Markers */}
            {sampleNGOs.map((ngo) => (
              <NGOMarker
                key={ngo.id}
                ngo={ngo}
                isSelected={selectedNGO.id === ngo.id}
                onSelect={(selected) => setSelectedNGO(selected)}
              />
            ))}

            {/* Bottom Overlay: Selected NGO Details Strip */}
            <div className="relative z-20 m-4 sm:m-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#142e20]">
                      {selectedNGO.name}
                    </h4>
                    {selectedNGO.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#596e62] mt-0.5">
                    {selectedNGO.type} • <strong className="text-emerald-900">{selectedNGO.distance}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-900/10 text-center flex-1 sm:flex-none">
                  {selectedNGO.capacity}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Live Dispatch Status Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DeliveryStatusCard />

            {/* Google Maps Integration Note Card */}
            <div className="rounded-3xl bg-[#f7f9f6] p-5 border border-emerald-900/10 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Google Maps Ready Component</span>
              </div>
              <p className="text-xs text-[#5a6f63] leading-relaxed">
                This preview renders via interactive SVG demo coordinates. When deployed to production, it seamlessly hooks into the Google Maps JavaScript API & Distance Matrix with zero architecture rework.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
