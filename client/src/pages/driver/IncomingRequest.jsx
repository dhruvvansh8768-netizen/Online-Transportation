import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Users, CreditCard, Clock, Check, X, Phone } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import Button from '../../components/common/Button';
import driverService from '../../services/driver.service';
import { formatCurrency } from '../../utils/helpers';

/**
 * IncomingRequest — Countdown popup for driver to accept or decline a ride booking
 */
const IncomingRequest = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(25);
  const [loading, setLoading] = useState(false);

  const pickup = [23.0365, 72.5611];
  const drop = [23.0734, 72.6266];

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/driver');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await driverService.acceptRide(1);
    } catch {
      // Demo fallback
    } finally {
      setLoading(false);
      navigate('/driver/navigate-pickup');
    }
  };

  const handleDecline = async () => {
    try {
      await driverService.rejectRide(1);
    } catch {
      // Demo fallback
    }
    navigate('/driver');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col">
      {/* Map */}
      <div className="relative h-64 sm:h-80">
        <MapView center={pickup} zoom={13} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={pickup} label="Pickup: 25, MG Road, Navrangpura" type="pickup" />
          <LocationMarker position={drop} label="Drop: 10, Airport Road, Hansol" type="destination" />
          <RouteDisplay coordinates={[pickup, drop]} />
        </MapView>

        <div className="absolute top-4 right-4 z-[400] bg-navy-900/90 border-2 border-accent rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-2xl">
          <span className="text-lg font-bold text-accent">{countdown}</span>
          <span className="text-[9px] text-gray-400 uppercase">sec</span>
        </div>
      </div>

      {/* Request Card */}
      <div className="flex-1 max-w-xl w-full mx-auto p-5">
        <div className="bg-navy-800 border border-accent/30 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Incoming Ride Request</span>
              <h1 className="text-2xl font-bold text-white mt-0.5">{formatCurrency(185)}</h1>
              <p className="text-xs text-gray-400">Est. 9.4 km • 22 min trip</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Rahul Kumar Patel</p>
              <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-accent" /> 2 Passengers
              </p>
            </div>
          </div>

          <div className="bg-navy-900/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Pickup (1.2 km away)</p>
                <p className="text-sm text-white font-medium">25, MG Road, Navrangpura, Ahmedabad 380009</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Drop-off</p>
                <p className="text-sm text-white font-medium">10, Airport Road, Hansol, Ahmedabad 382475</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-accent" /> Payment: <strong className="text-white">UPI</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-accent" /> 9876500005
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" /> 3 min away
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="danger" size="lg" icon={X} onClick={handleDecline}>
              Decline
            </Button>
            <Button size="lg" loading={loading} icon={Check} onClick={handleAccept}>
              Accept Ride
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingRequest;

