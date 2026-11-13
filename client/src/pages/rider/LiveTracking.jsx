import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation, Phone, MessageSquare, ShieldAlert, MapPin, Clock,
  CheckCircle2, Route, Radio
} from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { RideContext } from '../../context/RideContext';
import { SocketContext } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/helpers';

/**
 * LiveTracking — Real-time GPS tracker showing vehicle moving along Ahmedabad route
 */
const LiveTracking = () => {
  const navigate = useNavigate();
  const {
    pickup,
    destination,
    pickupAddress,
    destinationAddress,
    activeRide,
    setActiveRide,
    setRideStatus,
  } = useContext(RideContext);
  const { on, off } = useContext(SocketContext) || {};

  // Default Ahmedabad coordinates: Navrangpura -> Hansol Airport Road
  const pCoords = pickup || { lat: 23.0365, lng: 72.5611 };
  const dCoords = destination || { lat: 23.0734, lng: 72.6266 };

  const [progress, setProgress] = useState(15);
  const [driverPos, setDriverPos] = useState([pCoords.lat, pCoords.lng]);
  const [sosOpen, setSosOpen] = useState(false);

  // Socket listener for real driver location & ride completion
  useEffect(() => {
    if (!on) return;
    const handleLocation = (data) => {
      if (data?.lat && data?.lng) setDriverPos([data.lat, data.lng]);
    };
    const handleCompleted = (data) => {
      setActiveRide((prev) => ({ ...prev, ...data, status: 'Completed' }));
      setRideStatus('completed');
      navigate('/rider/completed');
    };
    on('ride:driver-location', handleLocation);
    on('ride:completed', handleCompleted);
    return () => {
      off && off('ride:driver-location', handleLocation);
      off && off('ride:completed', handleCompleted);
    };
  }, [on, off, navigate, setActiveRide, setRideStatus]);

  // Smooth GPS movement simulation along the route
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = Math.min(100, prev + 5);
        const ratio = next / 100;
        setDriverPos([
          pCoords.lat + (dCoords.lat - pCoords.lat) * ratio,
          pCoords.lng + (dCoords.lng - pCoords.lng) * ratio,
        ]);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng]);

  const remainingKm = Math.max(0.2, ((100 - progress) / 100) * 9.4).toFixed(1);
  const remainingMin = Math.max(1, Math.round(((100 - progress) / 100) * 22));

  const driver = activeRide?.driver || {
    driverId: 'DRV-01',
    name: 'Ramesh Patel',
    rating: 4.8,
    phone: '9876543210',
    experience: 8,
  };

  const vehicle = activeRide?.vehicle || {
    code: 'VH001',
    type: 'Sedan',
    model: 'Swift Dzire',
    color: 'White',
    plateNumber: 'GJ01AB1234',
  };

  const handleCompleteRide = () => {
    setActiveRide((prev) => ({
      ...prev,
      status: 'Completed',
      actualDistance: '9.4 km',
      actualDuration: '22 min',
      finalFare: prev?.fare || 185,
    }));
    setRideStatus('completed');
    navigate('/rider/completed');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      {/* Live GPS Map */}
      <div className="relative h-80 lg:h-auto lg:flex-1">
        <MapView center={driverPos} zoom={13} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={[pCoords.lat, pCoords.lng]} label="Pickup" type="pickup" />
          <LocationMarker position={[dCoords.lat, dCoords.lng]} label="Drop Location" type="destination" />
          <LocationMarker position={driverPos} label={`${driver.name} (${vehicle.plateNumber})`} type="driver" />
          <RouteDisplay
            coordinates={[
              [pCoords.lat, pCoords.lng],
              [(pCoords.lat + dCoords.lat) / 2 + 0.005, (pCoords.lng + dCoords.lng) / 2 - 0.004],
              [dCoords.lat, dCoords.lng],
            ]}
          />
        </MapView>

        {/* Live GPS Tracker Pill */}
        <div className="absolute top-4 left-4 right-4 lg:right-auto z-[400] flex items-center justify-between gap-4 bg-navy-800/95 backdrop-blur-md border border-accent/30 rounded-2xl px-4 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-accent animate-pulse" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-accent font-semibold">
                GPS Tracker Active • In Progress
              </p>
              <p className="text-sm font-bold text-white">
                {remainingKm} km left • {remainingMin} min ETA
              </p>
            </div>
          </div>
          <button
            onClick={() => setSosOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-colors"
          >
            <ShieldAlert className="w-4 h-4" /> SOS
          </button>
        </div>
      </div>

      {/* Right Trip Telemetry Panel */}
      <div className="lg:w-[440px] p-5 space-y-4 bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10">
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Trip Progress</span>
            <span className="text-xs font-bold text-accent">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5 text-accent" /> Fastest Route</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> Est. {formatCurrency(activeRide?.fare || 185)}</span>
          </div>
        </div>

        {/* Route Summary */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase">Pickup</p>
              <p className="text-sm text-white truncate">{pickupAddress || '25, MG Road, Navrangpura, Ahmedabad'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Navigation className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase">Drop-off</p>
              <p className="text-sm text-white truncate">{destinationAddress || '10, Airport Road, Hansol, Ahmedabad'}</p>
            </div>
          </div>
        </div>

        {/* Driver & Vehicle Details */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{driver.name}</p>
              <p className="text-xs text-gray-400">
                ★ {driver.rating} • {driver.experience || 8} yrs exp • {driver.phone}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert(`Calling ${driver.name}`)}
                className="p-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Chat opened')}
                className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-3 bg-navy-900/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-gray-300">
              {vehicle.color} {vehicle.model} ({vehicle.type})
            </span>
            <span className="font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded">
              {vehicle.plateNumber}
            </span>
          </div>
        </div>

        <Button fullWidth size="lg" icon={CheckCircle2} onClick={handleCompleteRide}>
          {progress >= 100 ? 'Arrived! View Fare & Pay' : 'Complete Ride Now'}
        </Button>
      </div>

      <Modal isOpen={sosOpen} onClose={() => setSosOpen(false)} title="Emergency SOS" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Sharing your live GPS coordinates & vehicle plate (<strong className="text-white">{vehicle.plateNumber}</strong>) with emergency contacts and local support.
          </p>
          <Button variant="danger" fullWidth onClick={() => { alert('Emergency alert dispatched!'); setSosOpen(false); }}>
            Trigger Emergency Alert (112)
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LiveTracking;

