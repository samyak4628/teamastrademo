import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  Sliders,
  RotateCw
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'3d-scrubber' | 'ai-parser'>('3d-scrubber');
  const [scrubberFrame, setScrubberFrame] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalImagesRef = useRef<Map<number, HTMLImageElement>>(new Map());

  const [promptText, setPromptText] = useState(
    'We have 50 warm meal trays of Vegetable Pulao and Dal from our lunch buffet, prepared at 1:30 PM, vegetarian, hygienically sealed. Pickup available until 5:00 PM at Connaught Place kitchen.'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    foodItem: string;
    quantity: string;
    dietary: string;
    packaging: string;
    prepTime: string;
    expiryTime: string;
    matchedShelters: string[];
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load and render frame on canvas in modal
  useEffect(() => {
    if (!isOpen || activeTab !== '3d-scrubber') return;

    const frameUrl = `/frames/ezgif-frame-${String(scrubberFrame).padStart(3, '0')}.png`;
    
    const draw = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);

      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const drawX = (canvas.width - drawWidth) / 2;
      const drawY = (canvas.height - drawHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    if (modalImagesRef.current.has(scrubberFrame)) {
      draw(modalImagesRef.current.get(scrubberFrame)!);
    } else {
      const img = new Image();
      img.src = frameUrl;
      img.onload = () => {
        modalImagesRef.current.set(scrubberFrame, img);
        draw(img);
      };
    }
  }, [isOpen, activeTab, scrubberFrame]);

  if (!isOpen) return null;

  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    setExtractedData(null);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedData({
        foodItem: 'Vegetable Pulao & Dal (Cooked Meal Trays)',
        quantity: '50 Servings / Trays (~22 kg)',
        dietary: 'Pure Vegetarian (Halal / Jain Compatible)',
        packaging: 'Hygienically sealed food-grade containers',
        prepTime: 'Today, 1:30 PM (Freshly Prepared)',
        expiryTime: 'Best before 5:00 PM (3.5 hr safe consumption window)',
        matchedShelters: [
          'Aasra Community Foodbank (1.4 km - Capacity: 60 meals)',
          'Mother Teresa Relief Home (2.8 km - Capacity: 120 meals)'
        ]
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-emerald-900/10 bg-[#f7f9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center border border-emerald-900/10 shadow-xs overflow-hidden">
              <img src="/assets/resqfood-logo.png" alt="ResQFood Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 id="demo-modal-title" className="text-base sm:text-lg font-bold text-[#142e20]">
                ResQFood Interactive Demo
              </h3>
              <p className="text-xs text-[#52685b]">
                Explore the 3D frame animation and test the AI donation parser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#4a5f52] hover:text-[#142e20] hover:bg-gray-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-emerald-900/10 px-6 pt-3 bg-white gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('3d-scrubber')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === '3d-scrubber'
                ? 'border-[#142e20] text-[#142e20]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3D Frame Scrubber</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai-parser')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'ai-parser'
                ? 'border-[#142e20] text-[#142e20]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Natural Language Parser</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === '3d-scrubber' ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-[#112419] aspect-video relative flex items-center justify-center border border-emerald-900/20 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
                
                {/* Frame Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md text-xs font-mono">
                  Frame {scrubberFrame} / 300
                </div>
              </div>

              {/* Interactive Frame Slider */}
              <div className="space-y-2 p-3 rounded-2xl bg-[#f7f9f6] border border-emerald-900/10">
                <div className="flex items-center justify-between text-xs font-bold text-[#142e20]">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Rotate 3D Food Basket (Drag Slider)</span>
                  </span>
                  <span className="text-emerald-800 font-mono">
                    {Math.round((scrubberFrame / 300) * 100)}% Angle
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={scrubberFrame}
                  onChange={(e) => setScrubberFrame(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-[#142e20]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h4 className="text-sm font-bold text-[#142e20]">
                    Hands Holding Food Basket — 300 Sequential PNG Frames
                  </h4>
                  <p className="text-xs text-[#52665a] mt-0.5">
                    Rendered frame-by-frame on HTML5 Canvas. Zero continuous video playback.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#142e20] hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Start Live Pilot</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#bbf246]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#142e20] uppercase tracking-wider mb-2">
                  Kitchen Speech / Free Text Input (Simulating Gemini API)
                </label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#f7f9f6] border border-emerald-900/15 text-xs sm:text-sm text-[#142e20] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Type any surplus description..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSimulateExtraction}
                  disabled={isExtracting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#142e20] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {isExtracting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Extracting Structured Fields...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-[#bbf246]" />
                      <span>Run Gemini Extraction</span>
                    </>
                  )}
                </button>
              </div>

              {extractedData && (
                <div className="p-4 rounded-2xl bg-[#f3f8f1] border border-emerald-600/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Schema Validated — Structured Donation Created</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-900/10">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Food Item</div>
                      <div className="font-semibold text-[#142e20]">{extractedData.foodItem}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-900/10">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Quantity & Weight</div>
                      <div className="font-semibold text-[#142e20]">{extractedData.quantity}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-900/10">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Dietary & Packaging</div>
                      <div className="font-semibold text-[#142e20]">{extractedData.dietary} • {extractedData.packaging}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-900/10">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Consumption Window</div>
                      <div className="font-semibold text-emerald-800">{extractedData.expiryTime}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-900/10 text-xs">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 mb-1">
                      Deterministic Candidate NGOs Ready For Immediate Auto-Dispatch:
                    </div>
                    <ul className="space-y-1">
                      {extractedData.matchedShelters.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[#142e20]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#f7f9f6] border-t border-emerald-900/10 flex items-center justify-between text-xs text-[#63796d]">
          <span>Production Ready Architecture • Supabase & Gemini SDK</span>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-900 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
