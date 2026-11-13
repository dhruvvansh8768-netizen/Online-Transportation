import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Phone, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import Button from '../../components/common/Button';

/**
 * NavigatePickup — Turn-by-turn route to rider's pickup location + "Arrived" button
 */
const NavigatePickup = () => {
  const navigate = useNavigate();

  const driverPos = [23.0305, 72.5594]; // CG Road
  const pickupPos = [23.0365, 72.5611]; // MG Road, Navrangpura

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      <div className="relative h-80 lg:h-auto lg:flex-1">
        <MapView center={driverPos} zoom={15} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={driverPos} label="You (Driver)" type="driver" />
          <LocationMarker position={pickupPos} label="Rahul Kumar Patel (Pickup)" type="pickup" />
          <RouteDisplay coordinates={[driverPos, pickupPos]} color="#3b82f6" />
        </MapView>

        <div className="absolute top-4 left-4 z-[400] bg-navy-800/95 border border-blue-500/40 rounded-2xl px-4 py-3 shadow-xl">
          <p className="text-[11px] text-blue-400 font-semibold uppercase">Status: Driver Assigned</p>
          <p className="text-sm font-bold text-white">3 mins (0.8 km) to Pickup</p>
        </div>
      </div>

      <div className="lg:w-[420px] p-5 space-y-5 bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-accent" /> Navigate to Pickup
          </h1>
          <p className="text-xs text-gray-400 mt-1">Head north on CG Road toward MG Road, Navrangpura</p>
        </div>

        <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Customer</p>
              <p className="text-base font-bold text-white">Rahul Kumar Patel</p>
              <p className="text-xs text-accent">2 Passengers • Cab (Sedan)</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert('Calling Rahul: 9876500005')}
                className="p-2.5 rounded-xl bg-accent/15 text-accent hover:bg-accent/25"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert('Chat opened')}
                className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-navy-900/80 rounded-xl flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-200">
              House No. 25, Street: MG Road, Locality: Navrangpura, Ahmedabad, Gujarat 380009
            </p>
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          icon={CheckCircle2}
          onClick={() => navigate('/driver/start-ride')}
        >
          Arrived at Pickup Point
        </Button>
      </div>
    </div>
  );
};

export default NavigatePickup;

