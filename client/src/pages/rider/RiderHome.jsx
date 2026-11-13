import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Home, Briefcase, Star, Clock, Navigation,
  ShieldCheck, Sparkles, ArrowRight, Bike, Car, Zap, Compass, BookOpen
} from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import { useLocation } from '../../hooks/useLocation';
import { RideContext } from '../../context/RideContext';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';

const SAVED_PLACES = [
  { id: 'home', label: 'Home (Navrangpura)', address: '25, MG Road, Navrangpura, Ahmedabad 380009', lat: 23.0365, lng: 72.5611, icon: Home },
  { id: 'work', label: 'Campus (Vastrapur)', address: '505, University Road, Vastrapur, Ahmedabad 380052', lat: 23.0350, lng: 72.5293, icon: Briefcase },
  { id: 'fav', label: 'Airport (Hansol)', address: '10, Airport Road, Hansol, Ahmedabad 382475', lat: 23.0734, lng: 72.6266, icon: Star },
];

const RECENT_DROPS = [
  { name: 'Sardar Vallabhbhai Patel Airport (Hansol)', area: '10, Airport Road, Hansol, Ahmedabad 382475', lat: 23.0734, lng: 72.6266, eta: '22 min' },
  { name: 'CG Road, Navrangpura', area: '101, CG Road, Navrangpura, Ahmedabad 380009', lat: 23.0305, lng: 72.5594, eta: '8 min' },
  { name: 'SG Highway, Bodakdev', area: '202, SG Highway, Bodakdev, Ahmedabad 380054', lat: 23.0402, lng: 72.5078, eta: '16 min' },
];

const QUICK_MODES = [
  { type: 'bike', name: 'Bike', eta: '2 min', fare: 45, icon: Bike, badge: 'Fastest' },
  { type: 'auto', name: 'Auto', eta: '3 min', fare: 75, icon: Compass, badge: 'Popular' },
  { type: 'mini', name: 'Hatchback', eta: '4 min', fare: 120, icon: Car, badge: null },
  { type: 'sedan', name: 'Cab / Sedan', eta: '5 min', fare: 165, icon: Zap, badge: 'Story' },
];

/**
 * RiderHome — Main Uber/Rapido-style rider dashboard with Ahmedabad map & floating booking sheet
 */
const RiderHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, refresh } = useLocation();
  const { setPickup, setPickupAddress, setDestination, setDestinationAddress, setSelectedVehicle } = useContext(RideContext);

  const [nearbyDrivers] = useState([
    { id: 1, lat: 23.0385, lng: 72.5641, label: 'Ramesh Patel • Swift Dzire (GJ01AB1234)' },
    { id: 2, lat: 23.0315, lng: 72.5572, label: 'Suresh Shah • Honda City (GJ01CD2345)' },
    { id: 3, lat: 23.0410, lng: 72.5530, label: 'Amit Shah • Maruti Ertiga (GJ01IJ5678)' },
  ]);

  const currentCenter = location && location.lat !== 12.9716 ? [location.lat, location.lng] : [23.0365, 72.5611];

  useEffect(() => {
    if (location) {
      setPickup({ lat: location.lat, lng: location.lng });
      setPickupAddress('Current Location (GPS)');
    }
  }, [location, setPickup, setPickupAddress]);

  const handleQuickDestination = (place) => {
    setPickup(location && location.lat !== 12.9716 ? { lat: location.lat, lng: location.lng } : { lat: 23.0365, lng: 72.5611 });
    setPickupAddress('Current Location (GPS)');
    setDestination({ lat: place.lat, lng: place.lng });
    setDestinationAddress(place.address || place.name);
    navigate('/rider/choose-ride');
  };

  const handleQuickVehicle = (mode) => {
    setSelectedVehicle(mode);
    navigate('/rider/search');
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-navy-900">
      {/* Full-bleed background map */}
      <div className="absolute inset-0 z-0">
        <MapView center={currentCenter} zoom={15} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={currentCenter} label="Your Pickup Location" type="pickup" />
          {nearbyDrivers.map((drv) => (
            <LocationMarker key={drv.id} position={[drv.lat, drv.lng]} label={drv.label} type="driver" />
          ))}
        </MapView>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy-900/80 to-transparent" />
      </div>

      {/* Top floating greeting & GPS recenter */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto glass-dark px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <div>
            <p className="text-xs text-gray-400">Good to see you,</p>
            <p className="text-sm font-semibold text-white">
              {user?.name || user?.full_name || 'Rider'}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/story-demo')}
            className="glass-dark px-3.5 py-2.5 rounded-2xl border border-accent/40 text-accent hover:bg-accent hover:text-navy-900 transition-colors shadow-xl text-xs font-bold flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Lab Story Mode
          </button>
          <button
            onClick={refresh}
            title="Recenter GPS"
            className="glass-dark p-3 rounded-2xl border border-white/10 text-accent hover:bg-navy-700 transition-colors shadow-xl"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Uber/Rapido-style Booking Sheet */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-6 pointer-events-none">
        <div className="max-w-2xl mx-auto bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 md:p-6 pointer-events-auto animate-slide-up">
          {/* Drag indicator */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

          {/* Where to? Search Trigger */}
          <button
            onClick={() => navigate('/rider/search')}
            className="w-full flex items-center gap-4 bg-navy-900/90 hover:bg-navy-900 border border-white/10 hover:border-accent/50 rounded-2xl p-4 transition-all group shadow-inner"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-white">Where are you going?</p>
              <p className="text-xs text-gray-400">Tap to enter drop location & get instant fares</p>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span>Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Quick Ride Modes */}
          <div className="grid grid-cols-4 gap-2.5 mt-4">
            {QUICK_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.type}
                  onClick={() => handleQuickVehicle(mode)}
                  className="relative bg-navy-900/60 hover:bg-navy-700/70 border border-white/10 hover:border-accent/40 rounded-2xl p-3 text-left transition-all group"
                >
                  {mode.badge && (
                    <span className="absolute -top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-navy-900">
                      {mode.badge}
                    </span>
                  )}
                  <Icon className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-white">{mode.name}</p>
                  <p className="text-[11px] text-gray-400">{mode.eta} • {formatCurrency(mode.fare)}</p>
                </button>
              );
            })}
          </div>

          {/* Saved Places Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 mt-2 no-scrollbar">
            {SAVED_PLACES.map((place) => {
              const Icon = place.icon;
              return (
                <button
                  key={place.id}
                  onClick={() => handleQuickDestination(place)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/40 text-xs font-medium text-gray-200 whitespace-nowrap transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  <span>{place.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent Destinations */}
          <div className="space-y-2 mt-1 max-h-36 overflow-y-auto pr-1">
            {RECENT_DROPS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickDestination(item)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 truncate">{item.area}</p>
                </div>
                <span className="text-xs text-accent font-medium">{item.eta}</span>
              </button>
            ))}
          </div>

          {/* Safety Banner */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              PIN-verified rides & live SOS
            </span>
            <span className="flex items-center gap-1 text-accent">
              <Sparkles className="w-3.5 h-3.5" /> Use code <strong className="font-bold">FIRST50</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderHome;
