import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Flag, Clock, Route, MapPin } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import Button from '../../components/common/Button';

/**
 * LiveNavigation — Active trip route from Navrangpura to Airport Road, Hansol
 */
const LiveNavigation = () => {
  const navigate = useNavigate();
  const pickup = [23.0365, 72.5611];
  const drop = [23.0734, 72.6266];
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 8));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const currentPos = [
    pickup[0] + ((drop[0] - pickup[0]) * progress) / 100,
    pickup[1] + ((drop[1] - pickup[1]) * progress) / 100,
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      <div className="relative h-80 lg:h-auto lg:flex-1">
        <MapView center={currentPos} zoom={13} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={pickup} label="Pickup: MG Road" type="pickup" />
          <LocationMarker position={drop} label="Drop: Airport Road, Hansol" type="destination" />
          <LocationMarker position={currentPos} label="Your Vehicle" type="driver" />
          <RouteDisplay coordinates={[pickup, drop]} />
        </MapView>

        <div className="absolute top-4 left-4 z-[400] bg-navy-800/95 border border-accent/40 rounded-2xl px-4 py-3 shadow-xl">
          <p className="text-[11px] uppercase text-accent font-semibold">Status: In Progress</p>
          <p className="text-sm font-bold text-white">Fastest Route via Airport Rd</p>
        </div>
      </div>

      <div className="lg:w-[420px] p-5 space-y-5 bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10">
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Trip Completion</span>
            <span className="font-bold text-accent">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-navy-900/70 rounded-xl p-2.5 text-center">
              <Route className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-gray-400">Remaining</p>
              <p className="text-sm font-bold text-white">{(((100 - progress) / 100) * 9.4).toFixed(1)} km</p>
            </div>
            <div className="bg-navy-900/70 rounded-xl p-2.5 text-center">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">ETA</p>
              <p className="text-sm font-bold text-white">{Math.max(1, Math.round(((100 - progress) / 100) * 22))} min</p>
            </div>
          </div>
        </div>

        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-xs text-gray-400 uppercase">Drop-off Location</p>
          <p className="text-sm font-medium text-white flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            House No. 10, Airport Road, Hansol, Ahmedabad, Gujarat 382475
          </p>
        </div>

        <Button fullWidth size="lg" icon={Flag} onClick={() => navigate('/driver/complete')}>
          Complete Ride
        </Button>
      </div>
    </div>
  );
};

export default LiveNavigation;

