import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Thermometer, 
  RefreshCw
} from 'lucide-react';

export const DeliveryStatusCard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(2); // 0: Packed, 1: Picked Up, 2: In Transit, 3: Completed

  const steps = [
    { title: 'Food Packed', desc: 'The Golden Bistro • 11:20 AM' },
    { title: 'Volunteer Picked Up', desc: 'Courier Marcus S. • 11:32 AM' },
    { title: 'In Transit', desc: 'On Highway Ring • ETA 6 mins' },
    { title: 'Delivered & Confirmed', desc: 'Aasra Shelter • Verified' },
  ];

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft border border-emerald-900/10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#142e20] text-[#bbf246] flex items-center justify-center font-bold">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Live Dispatch #FR-8821
            </div>
            <div className="text-sm font-bold text-[#142e20]">
              40 Hot Nutritional Meal Boxes
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextStep}
          title="Click to simulate delivery progression"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-medium transition-colors border border-emerald-900/10"
        >
          <RefreshCw className="w-3 h-3 text-emerald-700" />
          <span>Simulate Next</span>
        </button>
      </div>

      {/* Stepper Progression */}
      <div className="py-4 space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#142e20] text-[#bbf246] ring-4 ring-emerald-100 animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-6 mt-1 ${
                      idx < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 -mt-0.5">
                <div className={`text-xs font-bold ${isCurrent ? 'text-[#142e20]' : isDone ? 'text-emerald-900' : 'text-gray-400'}`}>
                  {step.title}
                </div>
                <div className="text-[11px] text-[#63776b]">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Courier Info Pill */}
      <div className="mt-2 pt-3 border-t border-emerald-900/10 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 p-2 rounded-xl">
          <Thermometer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Food Temp: <strong className="text-emerald-950">64°C Safe</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 p-2 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>FSSAI Compliant</span>
        </div>
      </div>
    </div>
  );
};
