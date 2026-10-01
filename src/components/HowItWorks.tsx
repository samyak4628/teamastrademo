import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Truck, 
  Award, 
  ArrowRight, 
  Check, 
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
  Zap,
  Building2,
  Users
} from 'lucide-react';
import type { HowItWorksStep } from '../types';

interface HowItWorksProps {
  onExploreStep?: (stepIndex: number) => void;
}

interface SimulationOption {
  id: string;
  name: string;
  category: string;
  quantity: string;
  urgency: 'high' | 'medium' | 'low';
  matchedNgo: {
    name: string;
    type: string;
    distance: string;
    transitTime: string;
    capacity: string;
    score: number;
    notes: string;
  };
}

const simulationPresets: SimulationOption[] = [
  {
    id: 'hot-meals',
    name: '🍲 Hot Buffet Meals (40 Servings - Curry & Rice)',
    category: 'Cooked Meals',
    quantity: '40 hot meals',
    urgency: 'high',
    matchedNgo: {
      name: 'Aasra Community Foodbank & Night Shelter',
      type: 'Immediate Night Shelter',
      distance: '1.4 km',
      transitTime: '6 mins',
      capacity: '60 meals current intake capacity',
      score: 98,
      notes: 'Matches hot-holding criteria. Courier dispatch notified within 3-min radius.'
    }
  },
  {
    id: 'bakery-bread',
    name: '🥖 Artisan Bakery & Fresh Breads (60 Loaves)',
    category: 'Bakery & Bread',
    quantity: '60 loaves & buns',
    urgency: 'medium',
    matchedNgo: {
      name: 'Mother Teresa Child Care & Relief Center',
      type: 'Children Welfare Center',
      distance: '2.8 km',
      transitTime: '11 mins',
      capacity: '120 meals intake capacity',
      score: 95,
      notes: 'Shelf-stable for morning breakfast service. Standard van pickup allocated.'
    }
  },
  {
    id: 'packaged-salads',
    name: '🥗 Banquet Cold Salads & Fruits (25 Trays)',
    category: 'Fresh Produce',
    quantity: '25 chilled trays',
    urgency: 'high',
    matchedNgo: {
      name: 'City Hope Homeless Recovery Center',
      type: 'Community Shelter',
      distance: '3.2 km',
      transitTime: '12 mins',
      capacity: '45 meals intake capacity',
      score: 92,
      notes: 'Cold storage refrigerator space verified available. Insulated cooler bags required.'
    }
  },
  {
    id: 'dairy-milk',
    name: '🥛 Pasteurized Milk & Yogurt (20 Liters)',
    category: 'Dairy & Refrigerated',
    quantity: '20 liters',
    urgency: 'high',
    matchedNgo: {
      name: 'Sneha Elderly & Nutrition Home',
      type: 'Senior Living Center',
      distance: '1.9 km',
      transitTime: '8 mins',
      capacity: '35 servings intake capacity',
      score: 97,
      notes: 'Immediate refrigerated intake confirmed. Strict expiry verification logged.'
    }
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onExploreStep }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(simulationPresets[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationState, setSimulationState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [currentMatch, setCurrentMatch] = useState<SimulationOption | null>(null);

  const steps: HowItWorksStep[] = [
    {
      number: '01',
      title: 'List Surplus Food',
      tag: 'For Kitchens & Donors',
      description: 'Restaurants post available surplus food with quantity, pickup deadline, packaging, and safety details in under 45 seconds.',
      iconName: 'ClipboardList'
    },
    {
      number: '02',
      title: 'Find Nearby NGOs',
      tag: 'Deterministic + AI Matching',
      description: 'The platform evaluates distance, storage capacity, operating hours, and diet requirements to recommend verified local shelters.',
      iconName: 'Search'
    },
    {
      number: '03',
      title: 'Pickup & Live Tracking',
      tag: 'Coordinated Logistics',
      description: 'Volunteers and NGO logistics drivers coordinate collections with real-time GPS tracking and food safety checklist sign-offs.',
      iconName: 'Truck'
    },
    {
      number: '04',
      title: 'Create Real Impact',
      tag: 'Verified Receipt',
      description: 'NGOs confirm food handover, issuing verifiable impact metrics, ESG audit reports, and heartfelt community gratitude.',
      iconName: 'Award'
    }
  ];

  const handleStepClick = (idx: number) => {
    setActiveTab(idx);
    if (onExploreStep) {
      onExploreStep(idx);
    } else {
      // Default fallbacks
      if (idx === 0) {
        const el = document.querySelector('#restaurants');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (idx === 1) {
        const el = document.querySelector('#ngos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (idx === 2) {
        const el = document.querySelector('#ngos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (idx === 3) {
        const el = document.querySelector('#impact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSimulateMatch = () => {
    setIsSimulating(true);
    setSimulationState('analyzing');
    setCurrentMatch(null);

    setTimeout(() => {
      const match = simulationPresets.find(p => p.id === selectedPresetId) || simulationPresets[0];
      setCurrentMatch(match);
      setIsSimulating(false);
      setSimulationState('done');
    }, 750);
  };

  const handleResetSimulation = () => {
    setSimulationState('idle');
    setCurrentMatch(null);
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-emerald-950/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6f2] border border-emerald-900/10 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Workflow & Reliability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142e20] mb-4">
            A Simple Journey. <span className="text-emerald-700">A Big Impact.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#52685c] leading-relaxed">
            From your kitchen to those who need it — in just a few steps with automated matching and zero hassle.
          </p>
        </div>

        {/* 4 Interactive Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const isSelected = activeTab === idx;
            return (
              <div
                key={step.number}
                className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-[#f4f8f1] border-emerald-600/50 shadow-soft scale-[1.02]' 
                    : 'bg-[#fafcf9] border-emerald-900/10 hover:border-emerald-900/25 hover:bg-white'
                }`}
              >
                {/* Step Top: Number and Icon */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-extrabold text-[#142e20]/25 group-hover:text-emerald-800/40 font-mono transition-colors">
                      {step.number}
                    </span>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-[#142e20] text-[#bbf246]' 
                        : 'bg-emerald-100/70 text-emerald-800 group-hover:bg-[#142e20] group-hover:text-[#bbf246]'
                    }`}>
                      {idx === 0 && <ClipboardList className="w-5 h-5" />}
                      {idx === 1 && <Search className="w-5 h-5" />}
                      {idx === 2 && <Truck className="w-5 h-5" />}
                      {idx === 3 && <Award className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                    {step.tag}
                  </div>

                  <h3 className="text-xl font-bold text-[#142e20] mb-3 group-hover:text-emerald-800 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#50665a] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Bottom Button */}
                <div className="mt-6 pt-4 border-t border-emerald-900/10">
                  <button
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#142e20] text-emerald-900 hover:text-white border border-emerald-900/15 text-xs font-bold transition-all flex items-center justify-between group/btn shadow-2xs"
                  >
                    <span>Explore Step {step.number}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover/btn:text-[#bbf246] group-hover/btn:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Step Preview Sandbox */}
        <div className="mt-12 rounded-3xl bg-[#f7f9f6] border border-emerald-900/10 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Interactive AI Dispatch Simulation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#142e20]">
                See how ResQFood matches surplus in under 3 seconds
              </h3>
              <p className="text-xs sm:text-sm text-[#50665a] mt-1 max-w-xl">
                Select a commercial surplus batch and trigger our algorithmic engine to find the closest certified recipient shelter with matching capacity.
              </p>
            </div>

            {/* Simulation Input Controls */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedPresetId}
                onChange={(e) => {
                  setSelectedPresetId(e.target.value);
                  if (simulationState === 'done') {
                    setSimulationState('idle');
                    setCurrentMatch(null);
                  }
                }}
                disabled={isSimulating}
                className="px-4 py-2.5 text-xs sm:text-sm rounded-full bg-white border border-emerald-900/20 text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              >
                {simulationPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSimulateMatch}
                disabled={isSimulating}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#142e20] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-75 shadow-sm"
              >
                {isSimulating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Matching via Gemini Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#bbf246]" />
                    <span>Simulate Match</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Animation State */}
          {simulationState === 'analyzing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-700 animate-bounce" />
              </div>
              <div className="text-xs font-bold text-[#142e20]">
                Running spatial routing & nutrition intake compatibility...
              </div>
              <p className="text-[11px] text-gray-500">
                Checking radius, storage temperatures, and recipient headcount.
              </p>
            </div>
          )}

          {/* Simulation Output Card */}
          {simulationState === 'done' && currentMatch && (
            <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-white border border-emerald-600/30 shadow-soft animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#bbf246] text-[#142e20] flex items-center justify-center font-bold text-sm shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        Algorithmic Match Success ({currentMatch.matchedNgo.score}% Match Score)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Demo Simulation
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#142e20] mt-0.5">
                      {currentMatch.matchedNgo.name}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold self-start sm:self-auto transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Run Again</span>
                </button>
              </div>

              {/* Match Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-bold">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    <span>Distance</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#142e20] mt-1">
                    {currentMatch.matchedNgo.distance}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    ~{currentMatch.matchedNgo.transitTime} drive
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-bold">
                    <Users className="w-3 h-3 text-emerald-700" />
                    <span>Recipient Capacity</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#142e20] mt-1">
                    {currentMatch.matchedNgo.capacity}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Surplus: {currentMatch.quantity}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-bold">
                    <Clock className="w-3 h-3 text-emerald-700" />
                    <span>Urgency Level</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-amber-700 capitalize mt-1">
                    {currentMatch.urgency} Urgency
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Rapid courier lock
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Compliance</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                    FSSAI Verified
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Temperature verified
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl text-xs text-[#2b4b39] flex items-start gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Routing Intelligence: </strong>
                  {currentMatch.matchedNgo.notes}
                </span>
              </div>
            </div>
          )}

          {/* Idle Prompt */}
          {simulationState === 'idle' && (
            <div className="mt-4 pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
              <span>Select an item above and click "Simulate Match" to test the AI engine.</span>
              <span className="font-semibold text-emerald-800">4 preset food batches ready</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

