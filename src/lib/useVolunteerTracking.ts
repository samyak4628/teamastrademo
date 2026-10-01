import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface VolunteerLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  updatedAt: string;
}

interface UseVolunteerTrackingProps {
  assignmentId?: string;
  donationId?: string;
  volunteerId?: string;
  onLocationUpdate?: (location: VolunteerLocationData) => void;
}

export const useVolunteerTracking = ({
  assignmentId,
  donationId,
  volunteerId,
  onLocationUpdate,
}: UseVolunteerTrackingProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<VolunteerLocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPushedAt, setLastPushedAt] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Calculate distance between two coordinates in meters (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const pushLocationToSupabase = useCallback(
    async (loc: VolunteerLocationData) => {
      if (!assignmentId || !donationId) return;

      // 1. Broadcast locally for immediate UI update
      try {
        localStorage.setItem(
          `resqfood_loc_${assignmentId}`,
          JSON.stringify(loc)
        );
      } catch {
        // ignore storage error
      }

      // 2. Push to Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const user = (await supabase.auth.getUser()).data.user;
          const vId = user?.id || volunteerId;

          if (vId) {
            await supabase.from('volunteer_locations').upsert(
              {
                assignment_id: assignmentId,
                volunteer_id: vId,
                donation_id: donationId,
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy,
                heading: loc.heading,
                speed: loc.speed,
                updated_at: loc.updatedAt,
              },
              { onConflict: 'assignment_id' }
            );
          }
        } catch (err) {
          console.warn('[Realtime GPS] Supabase location push notice:', err);
        }
      }

      setLastPushedAt(new Date());
    },
    [assignmentId, donationId, volunteerId]
  );

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError(null);
    setIsTracking(true);

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();

      const locationData: VolunteerLocationData = {
        latitude,
        longitude,
        accuracy: Math.round(accuracy * 10) / 10,
        heading: heading !== null ? Math.round(heading) : null,
        speed: speed !== null ? Math.round(speed * 3.6) : null, // Convert m/s to km/h
        updatedAt: new Date(position.timestamp).toISOString(),
      };

      setCurrentLocation(locationData);
      if (onLocationUpdate) onLocationUpdate(locationData);

      // Throttling logic: Send update if:
      // (a) First position
      // (b) At least 6 seconds have passed
      // (c) Courier has moved > 15 meters
      if (!lastCoordsRef.current) {
        lastCoordsRef.current = { lat: latitude, lng: longitude, time: now };
        pushLocationToSupabase(locationData);
        return;
      }

      const timeDiff = (now - lastCoordsRef.current.time) / 1000;
      const distanceMoved = calculateDistance(
        lastCoordsRef.current.lat,
        lastCoordsRef.current.lng,
        latitude,
        longitude
      );

      if (timeDiff >= 6 || distanceMoved >= 15) {
        lastCoordsRef.current = { lat: latitude, lng: longitude, time: now };
        pushLocationToSupabase(locationData);
      }
    };

    const handleError = (geoError: GeolocationPositionError) => {
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setError('Location permission denied. Please allow location access in your browser settings.');
          stopTracking();
          break;
        case geoError.POSITION_UNAVAILABLE:
          setError('Location signal unavailable. Verifying GPS hardware...');
          break;
        case geoError.TIMEOUT:
          setError('Location request timed out. Retrying GPS lock...');
          break;
        default:
          setError('Unable to acquire GPS position.');
          break;
      }
    };

    // Begin watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      }
    );
  }, [onLocationUpdate, pushLocationToSupabase, stopTracking]);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    currentLocation,
    error,
    lastPushedAt,
    startTracking,
    stopTracking,
  };
};
