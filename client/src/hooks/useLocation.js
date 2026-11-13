import { useState, useEffect, useCallback } from 'react';

/**
 * useLocation hook — provides browser geolocation tracking
 * Returns current coordinates, loading state, and error info
 */
export const useLocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { watch = false, enableHighAccuracy = true } = options;

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        // Fall back to a default location (Ahmedabad, India - Lab-2 / Lab-3 MG Road)
        setLocation({ lat: 23.0365, lng: 72.5611, accuracy: 0, heading: null, speed: null });
      },
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [enableHighAccuracy]);

  // Watch position for real-time updates
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          });
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        {
          enableHighAccuracy,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      getCurrentPosition();
    }
  }, [watch, enableHighAccuracy, getCurrentPosition]);

  return {
    location,
    error,
    loading,
    refresh: getCurrentPosition,
  };
};

export default useLocation;
