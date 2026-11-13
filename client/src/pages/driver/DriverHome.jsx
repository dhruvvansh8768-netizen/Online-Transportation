import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Power, DollarSign, Car, Star, Navigation, Bell, Clock,
  TrendingUp, Award, ShieldCheck
} from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { SocketContext } from '../../context/SocketContext';
import driverService from '../../services/driver.service';
import { formatCurrency } from '../../utils/helpers';

/**
 * DriverHome — Driver duty toggle (Online/Offline), Ahmedabad GPS map, and earnings summary
 */
const DriverHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location } = useLocation();
  const { emit } = useContext(SocketContext) || {};

  const [isOnline, setIsOnline] = useState(true);
  const [toggling, setToggling] = useState(false);

  const center = location && location.lat !== 12.9716 ? [location.lat, location.lng] : [23.0365, 72.5611];

  const handleToggle = async () => {
    setToggling(true);
    try {
      await driverService.toggleStatus(!isOnline);
    } catch {
      // Demo fallback
    } finally {
      const next = !isOnline;
      setIsOnline(next);
      if (emit) emit('driver:status', { isOnline: next });
      setToggling(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      {/* Map Panel */}
      <div className="relative h-72 lg:h-auto lg:flex-1">
        <MapView center={center} zoom={14} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={center} label="Your Vehicle (GJ01AB1234)" type="driver" />
        </MapView>

        {/* Online/Offline Floating Toggle */}
        <div className="absolute top-4 left-4 right-4 lg:right-auto z-[400] flex items-center justify-between gap-4 bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-accent animate-pulse' : 'bg-gray-500'}`} />
            <div>
              <p className="text-xs text-gray-400">Duty Status</p>
              <p className={`text-sm font-bold ${isOnline ? 'text-accent' : 'text-gray-300'}`}>
                {isOnline ? 'ONLINE • Receiving Rides' : 'OFFLINE'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={isOnline ? 'danger' : 'primary'}
            loading={toggling}
            icon={Power}
            onClick={handleToggle}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      {/* Right Control Panel */}
      <div className="lg:w-[440px] p-5 space-y-5 bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10">
        {/* Driver Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.name || user?.full_name || 'Ramesh Patel'}
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-current" /> 4.80
              </span>
              <span>•</span>
              <span>8 yrs exp • Swift Dzire (GJ01AB1234)</span>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-accent/15 text-accent text-xs font-semibold">
            VH001
          </span>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 text-center">
            <DollarSign className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{formatCurrency(1480)}</p>
            <p className="text-[11px] text-gray-400">Today</p>
          </div>
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 text-center">
            <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">7</p>
            <p className="text-[11px] text-gray-400">Trips</p>
          </div>
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-4 text-center">
            <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">5.4h</p>
            <p className="text-[11px] text-gray-400">Online</p>
          </div>
        </div>

        {/* Simulate / View Incoming Ride Request */}
        {isOnline ? (
          <div className="bg-gradient-to-br from-accent/15 to-navy-800 border border-accent/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Bell className="w-4 h-4 animate-bounce" /> New Ride Nearby!
              </span>
              <span className="text-xs text-gray-300">Navrangpura</span>
            </div>
            <p className="text-sm text-white font-medium">
              Rahul Kumar Patel requested a Cab (2 passengers) to Airport Road, Hansol.
            </p>
            <Button fullWidth icon={Navigation} onClick={() => navigate('/driver/incoming')}>
              View Ride Request
            </Button>
          </div>
        ) : (
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 text-center space-y-2">
            <p className="text-sm font-medium text-gray-300">You are currently offline</p>
            <p className="text-xs text-gray-500">Toggle Online above to start receiving ride requests in Ahmedabad.</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/driver/earnings')}
            className="p-4 bg-navy-800 border border-white/10 hover:border-accent/40 rounded-2xl text-left transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-semibold text-white">Earnings</p>
            <p className="text-xs text-gray-400">Weekly breakdown</p>
          </button>
          <button
            onClick={() => navigate('/driver/history')}
            className="p-4 bg-navy-800 border border-white/10 hover:border-accent/40 rounded-2xl text-left transition-colors"
          >
            <Award className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-sm font-semibold text-white">Trip History</p>
            <p className="text-xs text-gray-400">Past rides & ratings</p>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Verified Driver • License & RC Active
        </div>
      </div>
    </div>
  );
};

export default DriverHome;

