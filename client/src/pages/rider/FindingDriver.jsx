import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Radio, XCircle, MapPin, Shield } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import Button from '../../components/common/Button';
import { RideContext } from '../../context/RideContext';
import { SocketContext } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/helpers';

/**
 * FindingDriver — Animated radar search screen while matching a nearby driver
 */
const FindingDriver = () => {
  const navigate = useNavigate();
  const {
    pickup,
    pickupAddress,
    destinationAddress,
    activeRide,
    setActiveRide,
    setRideStatus,
    cancelRide,
  } = useContext(RideContext);
  const { on, off } = useContext(SocketContext) || {};

  const [seconds, setSeconds] = useState(0);
  const [searchMessage, setSearchMessage] = useState('Scanning nearby verified drivers...');

  const center = pickup ? [pickup.lat, pickup.lng] : [23.0365, 72.5611]; // Ahmedabad MG Road

  // Listen for real-time driver assignment via Socket.io
  useEffect(() => {
    const handleDriverAssigned = (data) => {
      setActiveRide((prev) => ({
        ...prev,
        ...data.ride,
        driver: data.driver,
        vehicle: data.vehicle,
        otp: data.otp || prev?.otp || '4829',
        status: 'accepted',
      }));
      setRideStatus('accepted');
      navigate('/rider/driver-assigned');
    };

    if (on) {
      on('ride:driver-assigned', handleDriverAssigned);
      return () => off && off('ride:driver-assigned', handleDriverAssigned);
    }
  }, [on, off, navigate, setActiveRide, setRideStatus]);

  // Smooth simulated match progression for instant demo experience
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    const msgTimer = setTimeout(() => setSearchMessage('Contacting top-rated driver nearby...'), 2200);
    const matchTimer = setTimeout(() => {
      setActiveRide((prev) => ({
        ...prev,
        _id: prev?._id || 'RIDE-849201',
        otp: prev?.otp || '4829',
        status: 'accepted',
        driver: {
          name: 'Rajesh Kumar',
          rating: 4.9,
          totalRides: 1420,
          phone: '+91 98765 43210',
        },
        vehicle: {
          make: 'Maruti',
          model: 'Swift Dzire',
          color: 'Pearl White',
          plateNumber: 'KA-01-MJ-4821',
          type: prev?.vehicleType || 'Sedan',
        },
      }));
      setRideStatus('accepted');
      navigate('/rider/driver-assigned');
    }, 4500);

    return () => {
      clearInterval(timer);
      clearTimeout(msgTimer);
      clearTimeout(matchTimer);
    };
  }, [navigate, setActiveRide, setRideStatus]);

  const handleCancel = async () => {
    try {
      await cancelRide(activeRide?._id);
    } catch {
      // ignore if demo mode
    }
    navigate('/rider');
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-navy-900">
      <MapView center={center} zoom={15} className="w-full h-full rounded-none" style={{ height: '100%' }}>
        <LocationMarker position={center} label="Pickup" type="pickup" />
      </MapView>

      {/* Radar pulse overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
        <div className="relative flex items-center justify-center">
          <div className="w-56 h-56 rounded-full bg-accent/10 border border-accent/30 animate-ping-slow absolute" />
          <div className="w-36 h-36 rounded-full bg-accent/15 border border-accent/40 animate-pulse absolute" />
          <div className="w-16 h-16 rounded-full bg-navy-800 border-2 border-accent flex items-center justify-center shadow-2xl">
            <Car className="w-8 h-8 text-accent animate-bounce-slow" />
          </div>
        </div>
      </div>

      {/* Bottom Searching Card */}
      <div className="absolute inset-x-0 bottom-0 z-[500] p-4 md:p-6">
        <div className="max-w-lg mx-auto bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Finding your driver</h2>
                <p className="text-xs text-gray-400">{searchMessage}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
              00:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(95, 20 + seconds * 18)}%` }}
            />
          </div>

          <div className="bg-navy-900/70 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span className="truncate">{pickupAddress || 'Current Location'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="truncate">{destinationAddress || 'Koramangala 4th Block'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Est. Fare: <strong className="text-white">{formatCurrency(activeRide?.fare || 127)}</strong>
            </span>
            <Button variant="danger" size="sm" icon={XCircle} onClick={handleCancel}>
              Cancel Ride
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingDriver;

