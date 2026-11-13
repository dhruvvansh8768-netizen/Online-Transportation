import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import rideService from '../services/ride.service';
import { messageFor } from '../components/common/Workspace';

const rideEvents = ['ride_accepted', 'driver_arriving', 'ride_started', 'ride_completed', 'ride_cancelled'];

export function useTrip(rideId, enabled = true) {
  const { socket, isConnected } = useContext(SocketContext);
  const [state, setState] = useState({ ride: null, error: '', ready: false });

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    let request = 0;
    const update = async () => {
      const current = ++request;
      try {
        const response = await (rideId ? rideService.getRideById(rideId) : rideService.getActiveRide());
        if (mounted && current === request) setState({ ride: response.data.data.ride, error: '', ready: true });
      } catch (error) {
        if (mounted && current === request) {
          setState((previous) => ({ ...previous, error: messageFor(error), ready: true }));
        }
      }
    };
    update();
    const interval = setInterval(update, 10000);
    if (isConnected) rideEvents.forEach((event) => socket?.on(event, update));
    return () => {
      mounted = false;
      clearInterval(interval);
      rideEvents.forEach((event) => socket?.off(event, update));
    };
  }, [rideId, enabled, socket, isConnected]);

  return state;
}

