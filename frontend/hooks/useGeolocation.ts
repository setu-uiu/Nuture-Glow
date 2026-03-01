import { useCallback, useRef, useState } from 'react';

type Location = { lat: number; lng: number };

type GeoState = {
  location: Location | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  getLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
};

const toErrorMessage = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Location permission denied. Please enable it in your browser settings.';
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Location unavailable. Try again later.';
  }
  if (error.code === error.TIMEOUT) {
    return 'Location request timed out. Please try again.';
  }
  return 'Unable to retrieve your location.';
};

export const useGeolocation = (): GeoState => {
  const [location, setLocation] = useState<Location | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = (position: GeolocationPosition) => {
    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    setAccuracy(position.coords.accuracy);
    setError(null);
    setLoading(false);
  };

  const handleError = (err: GeolocationPositionError) => {
    setError(toErrorMessage(err));
    setLoading(false);
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLoading(false);
  }, []);

  return {
    location,
    accuracy,
    loading,
    error,
    getLocation,
    watchLocation,
    stopWatching
  };
};
