import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, Cpu, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'safety' | 'specs';

interface PolicyModalProps {
  isOpen: boolean;
  type: PolicyType | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  type,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  const getPolicyContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy & Data Protection',
          badge: 'GDPR & DPDP Aligned',
          icon: <Lock className="w-5 h-5 text-emerald-700" />,
          sections: [
            {
              heading: '1. Information We Collect',
              text: 'ResQFood collects donor kitchen profiles, authorized personnel contact emails, shelter capacity profiles, and real-time GPS telemetry during active volunteer pickup runs.'
            },
            {
              heading: '2. Purpose of Geolocation Processing',
              text: 'Volunteer GPS coordinates are processed exclusively during active in-transit delivery tasks and broadcast via encrypted Supabase Realtime channels. Position tracking automatically terminates when the delivery run is confirmed.'
            },
            {
              heading: '3. Data Retention & Anonymization',
              text: 'Donation audit metrics and waste diversion summaries are retained for verifiable ESG impact certificates. Personal volunteer geolocation logs are purged after route completion.'
            }
          ]
        };

      case 'terms':
        return {
          title: 'Terms of Service & Donor Charter',
          badge: 'Platform Agreement',
          icon: <FileText className="w-5 h-5 text-emerald-700" />,
          sections: [
            {
              heading: '1. Eligibility & Food Hygiene Standards',
              text: 'All participating restaurants, caterers, and food service businesses warrant that all donated surplus food was prepared under licensed food safety conditions and handled hygienically.'
            },
            {
              heading: '2. Good Samaritan Protection',
              text: 'In alignment with international Food Rescue legislation and Indian Good Samaritan food donation guidelines, bona fide donors distributing wholesome food in good faith are protected from civil liability.'
            },
            {
              heading: '3. Community Fair-Use Policy',
              text: 'ResQFood is provided free forever to non-profit shelters and community soup kitchens. Commercial users agree to transparent reporting on surplus diversion metrics.'
            }
          ]
        };

      case 'safety':
        return {
          title: 'Food Safety & Cold-Chain Protocol',
          badge: 'FSSAI Guidance Aligned',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
          sections: [
            {
              heading: '1. Temperature Control Window',
              text: 'Hot foods must be packaged and maintained at ≥60°C or cooled rapidly to ≤5°C within 2 hours. High-perishability cooked food items have a strict maximum distribution window of 3 to 4 hours.'
            },
            {
              heading: '2. Hygienic Packaging & Tamper-Evident Seals',
              text: 'All donated items must be stored in clean, food-grade containers with clear labelling denoting dish name, allergens, preparation timestamp, and recommended consumption deadline.'
            },
            {
              heading: '3. Visual & Sensory Inspection Sign-Off',
              text: 'Couriers and shelter receivers conduct a standardized 3-point visual check (aroma, seal integrity, storage condition) prior to final distribution to shelter residents.'
            }
          ]
        };

      case 'specs':
        return {
          title: 'Supabase & Gemini Technical Specifications',
          badge: 'System Architecture',
          icon: <Cpu className="w-5 h-5 text-emerald-700" />,
          sections: [
            {
              heading: '1. Supabase Cloud Integration',
              text: 'PostgreSQL database backend with Row-Level Security (RLS) policies. Live WebSocket pub/sub for volunteer coordinates (volunteer_locations table) and reactive donation store updates.'
            },
            {
              heading: '2. Leaflet & OpenStreetMap Engine',
              text: 'Hardware-accelerated vector mapping with real-time polyline rendering, dynamic accuracy radius circles, and sub-second courier telemetry updates.'
            },
            {
              heading: '3. Gemini Engine Integration',
              text: 'Multi-criteria spatial and nutritional matching prioritizing proximity, shelter intake capacity, dietary restrictions, and urgent shelf-life constraints.'
            }
          ]
        };
    }
  };

  const content = getPolicyContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#f7f9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              {content.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-900/10">
                  {content.badge}
                </span>
              </div>
              <h3 id="policy-modal-title" className="text-base sm:text-lg font-bold text-[#142e20] mt-0.5">
                {content.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="font-bold text-sm text-[#142e20] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sec.heading}</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            ResQFood Global Operations & Governance Standard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#142e20] text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
