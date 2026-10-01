import React from 'react';
import { MapPin } from 'lucide-react';
import type { NGOMarkerData } from '../types';

interface NGOMarkerProps {
  ngo: NGOMarkerData;
  isSelected: boolean;
  onSelect: (ngo: NGOMarkerData) => void;
}

export const NGOMarker: React.FC<NGOMarkerProps> = ({ 
  ngo, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div
      style={{
        left: `${ngo.coordinates.x}%`,
        top: `${ngo.coordinates.y}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
      onClick={() => onSelect(ngo)}
    >
      {/* Pulse effect if selected or urgent */}
      {ngo.status === 'urgent' && (
        <span className="absolute -inset-1.5 rounded-full bg-amber-400 animate-ping opacity-60 pointer-events-none" />
      )}
      {isSelected && (
        <span className="absolute -inset-2 rounded-full bg-[#bbf246] animate-pulse opacity-50 pointer-events-none" />
      )}

      {/* Pin Badge */}
      <div 
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-soft transition-all duration-200 border-2 ${
          isSelected 
            ? 'bg-[#142e20] text-[#bbf246] border-[#bbf246] scale-110' 
            : 'bg-white text-emerald-900 border-emerald-700/30 group-hover:scale-105'
        }`}
      >
        <MapPin className="w-5 h-5 fill-current" />
      </div>

      {/* Mini Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
        <div className="bg-[#142e20] text-white text-[11px] py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap font-medium flex items-center gap-1.5">
          <span>{ngo.name}</span>
          <span className="text-[#bbf246]">({ngo.distance})</span>
        </div>
        <div className="w-2 h-2 bg-[#142e20] rotate-45 -mt-1" />
      </div>
    </div>
  );
};
