import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  AlertCircle, 
  Activity 
} from 'lucide-react';

export interface LiveDeliveryMapProps {
  assignmentId: string;
  donationId: string;
  foodName: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCoords?: [number, number]; // [lat, lng]
  ngoName: string;
  ngoAddress: string;
  ngoCoords?: [number, number]; // [lat, lng]
  initialVolunteerCoords?: [number, number];
  onClose?: () => void;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  assignmentId,
  donationId: _donationId,
  foodName,
  restaurantName,
  restaurantAddress,
  restaurantCoords = [28.6289, 77.2065], // Default Connaught Place, New Delhi
  ngoName,
  ngoAddress,
  ngoCoords = [28.6415, 77.2201], // Default Daryaganj, New Delhi
  initialVolunteerCoords,
  onClose
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const volunteerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [volunteerPosition, setVolunteerPosition] = useState<[number, number] | null>(
    initialVolunteerCoords || null
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Custom Leaflet Icons
  const createCustomIcon = (bgColor: string, iconHtml: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          ${iconHtml}
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const volunteerIcon = createCustomIcon(
    '#142e20',
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbf246" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
  );

  const pickupIcon = createCustomIcon(
    '#d97706',
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"/><line x1="9" y1="17" x2="9" y2="21"/><line x1="15" y1="17" x2="15" y2="21"/></svg>`
  );

  const dropoffIcon = createCustomIcon(
    '#15803d',
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = volunteerPosition || restaurantCoords;
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
    });

    // OpenStreetMap Free Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add Pickup Pin
    L.marker(restaurantCoords, { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<strong>${restaurantName}</strong><br/>Pickup Address: ${restaurantAddress}`);

    // Add Drop-off Pin
    L.marker(ngoCoords, { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<strong>${ngoName}</strong><br/>Drop-off Address: ${ngoAddress}`);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [restaurantCoords, ngoCoords, restaurantName, restaurantAddress, ngoName, ngoAddress]);

  // Update volunteer marker on location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (volunteerPosition) {
      if (!volunteerMarkerRef.current) {
        volunteerMarkerRef.current = L.marker(volunteerPosition, { icon: volunteerIcon })
          .addTo(map)
          .bindPopup(`<strong>Courier On Duty</strong><br/>Moving towards ${ngoName}`);
      } else {
        volunteerMarkerRef.current.setLatLng(volunteerPosition);
      }

      // Accuracy radius
      if (accuracy) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle(volunteerPosition, {
            radius: Math.min(accuracy, 250),
            color: '#142e20',
            fillColor: '#bbf246',
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng(volunteerPosition);
          accuracyCircleRef.current.setRadius(Math.min(accuracy, 250));
        }
      }

      // Polyline to destination
      const routePoints: [number, number][] = [volunteerPosition, ngoCoords];
      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(routePoints, {
          color: '#15803d',
          dashArray: '6, 8',
          weight: 3,
          opacity: 0.8,
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(routePoints);
      }

      // Fit bounds nicely
      const group = L.featureGroup([
        volunteerMarkerRef.current,
        L.marker(restaurantCoords),
        L.marker(ngoCoords),
      ]);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [volunteerPosition, accuracy, ngoCoords, restaurantCoords, ngoName, volunteerIcon]);

  // Supabase Realtime Subscription & Polling Fallback
  useEffect(() => {
    let isCancelled = false;

    // 1. Initial fetch from Supabase
    const fetchLatestLocation = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from('volunteer_locations')
            .select('*')
            .eq('assignment_id', assignmentId)
            .maybeSingle();

          if (data && !isCancelled) {
            setVolunteerPosition([Number(data.latitude), Number(data.longitude)]);
            if (data.accuracy) setAccuracy(Number(data.accuracy));
            if (data.speed) setSpeed(Number(data.speed));
            setLastUpdated(new Date(data.updated_at));
          }
        } catch (err) {
          console.warn('[Realtime Map] Initial query error:', err);
        }
      } else {
        // Fallback: check local storage for local demo testing
        try {
          const localSaved = localStorage.getItem(`resqfood_loc_${assignmentId}`);
          if (localSaved && !isCancelled) {
            const parsed = JSON.parse(localSaved);
            setVolunteerPosition([parsed.latitude, parsed.longitude]);
            setAccuracy(parsed.accuracy);
            setSpeed(parsed.speed);
            setLastUpdated(new Date(parsed.updatedAt));
          } else if (!volunteerPosition && !isCancelled) {
            // Default halfway mock position between restaurant & NGO for demo visualization
            const midLat = (restaurantCoords[0] + ngoCoords[0]) / 2;
            const midLng = (restaurantCoords[1] + ngoCoords[1]) / 2;
            setVolunteerPosition([midLat, midLng]);
            setAccuracy(15);
            setSpeed(22);
            setLastUpdated(new Date());
          }
        } catch {
          // ignore
        }
      }
    };

    fetchLatestLocation();

    // 2. Setup Realtime WebSocket channel if Supabase is active
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (isSupabaseConfigured() && supabase) {
      channel = supabase
        .channel(`volunteer_gps:${assignmentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'volunteer_locations',
            filter: `assignment_id=eq.${assignmentId}`,
          },
          (payload) => {
            if (isCancelled) return;
            const row = payload.new as any;
            if (row && row.latitude && row.longitude) {
              setVolunteerPosition([Number(row.latitude), Number(row.longitude)]);
              if (row.accuracy) setAccuracy(Number(row.accuracy));
              if (row.speed) setSpeed(Number(row.speed));
              setLastUpdated(new Date(row.updated_at || Date.now()));
            }
          }
        )
        .subscribe((status) => {
          if (!isCancelled) {
            setIsSubscribed(status === 'SUBSCRIBED');
          }
        });
    }

    // 3. Storage event listener for cross-tab local testing
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === `resqfood_loc_${assignmentId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setVolunteerPosition([parsed.latitude, parsed.longitude]);
          setAccuracy(parsed.accuracy);
          setSpeed(parsed.speed);
          setLastUpdated(new Date(parsed.updatedAt));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      isCancelled = true;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [assignmentId, restaurantCoords, ngoCoords, volunteerPosition]);

  // Elapsed seconds timer to indicate freshness / stale status
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        setSecondsAgo(Math.max(0, diff));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isStale = secondsAgo > 35;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-forest border border-emerald-950/15 flex flex-col max-w-4xl w-full mx-auto">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-[#142e20] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-[#bbf246] animate-pulse" />
            <span>Live GPS Courier Dispatch • OpenStreetMap</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
            {foodName}
          </h3>
          <p className="text-xs text-gray-300">
            {restaurantName} → {ngoName}
          </p>
        </div>

        {/* Freshness / Stale Status Indicator */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isStale
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
          }`}>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {isStale
                ? `GPS Stale (${secondsAgo}s ago)`
                : `Live (${secondsAgo}s ago)`}
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              Close Map
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Telemetry HUD */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-emerald-950/15 max-w-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Courier Telemetry
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {isSubscribed ? 'WebSocket Active' : 'Polling Ready'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded-xl">
              <span className="text-gray-400 text-[10px] block">Speed</span>
              <strong className="text-gray-900">{speed !== null ? `${speed} km/h` : 'Moving in transit'}</strong>
            </div>

            <div className="p-2 bg-gray-50 rounded-xl">
              <span className="text-gray-400 text-[10px] block">Accuracy</span>
              <strong className="text-gray-900">{accuracy !== null ? `±${accuracy} m` : 'GPS Acquired'}</strong>
            </div>
          </div>

          {isStale && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Courier location hasn't refreshed in 35+ seconds. May be in transit tunnel or basement.</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Address Summary Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
            1
          </div>
          <div className="truncate">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Pickup Kitchen:</span>
            <span className="text-gray-800 font-semibold">{restaurantName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
            2
          </div>
          <div className="truncate">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Destination Shelter:</span>
            <span className="text-gray-800 font-semibold">{ngoName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
