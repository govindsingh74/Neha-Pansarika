import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  address: AddressDetails | null;
}

interface AddressDetails {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoFetch?: boolean;
  cacheKey?: string;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoFetch = false,
    cacheKey = 'pansarika_last_location',
  } = options;

  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    address: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Check for cached location on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoFetch) {
      const cachedLocation = localStorage.getItem(cacheKey);
      if (cachedLocation) {
        try {
          const parsed = JSON.parse(cachedLocation);
          setLocation(prev => ({
            ...prev,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            address: parsed.address,
            loading: false,
          }));
        } catch (e) {
          console.error('Error parsing cached location:', e);
        }
      } else {
        getCurrentPosition();
      }
    }

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [autoFetch]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMountedRef.current) return;

        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        const newLocationState = {
          latitude,
          longitude,
          error: null,
          loading: false,
          address,
        };
        
        setLocation(newLocationState);
        
        // Cache the location
        if (address) {
          localStorage.setItem(cacheKey, JSON.stringify({
            latitude,
            longitude,
            address,
            timestamp: Date.now(),
          }));
        }
      },
      (error) => {
        if (!isMountedRef.current) return;
        
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access is required for delivery address. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter your address manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please check your connection.';
            break;
        }
        setLocation({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          address: null,
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge, cacheKey]);

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<AddressDetails | null> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      // For production, consider using Google Maps Geocoding API for better accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Pansarika Grocery Platform', // Required by Nominatim
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const postalCode = address.postcode || '';
        const country = address.country || 'India';
        
        // Format the address
        const formattedAddress = [
          address.road || '',
          address.suburb || '',
          city,
          state,
          postalCode,
          country,
        ]
          .filter(Boolean)
          .join(', ');
        
        return {
          address: formattedAddress,
          city,
          state,
          postalCode,
          country,
          formattedAddress,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          address: 'Sample Address, Sample City, Sample State 123456',
          city: 'Sample City',
          state: 'Sample State',
          postalCode: '123456',
          country: 'India',
          formattedAddress: 'Sample Address, Sample City, Sample State 123456, India',
        };
      }
      
      return null;
    }
  };

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        if (!isMountedRef.current) return;
        
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude,
          address,
          error: null,
        }));
      },
      (error) => {
        console.error('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearCachedLocation = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setLocation({
      latitude: null,
      longitude: null,
      error: null,
      loading: false,
      address: null,
    });
  }, [cacheKey]);

  const retry = useCallback(() => {
    clearCachedLocation();
    getCurrentPosition();
  }, [clearCachedLocation, getCurrentPosition]);

  return {
    ...location,
    getCurrentPosition,
    getAddressFromCoordinates,
    startWatching,
    stopWatching,
    clearCachedLocation,
    retry,
    isSupported: !!navigator.geolocation,
  };
};