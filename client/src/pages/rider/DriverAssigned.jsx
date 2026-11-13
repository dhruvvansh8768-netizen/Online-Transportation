import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Navigation, ShieldAlert, XCircle, CheckCircle } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import DriverInfo from '../../components/ride/DriverInfo';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { RideContext } from '../../context/RideContext';

/**
 * DriverAssigned — Shows matched driver details, vehicle plate, OTP PIN, and arrival ETA
 */
const DriverAssigned = () => {
  const navigate = useNavigate();
  const { pickup, activeRide, cancelRide, setRideStatus } = useContext(RideContext);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const pCoords = pickup || { lat: 23.0365, lng: 72.5611 }; // 25 MG Road, Navrangpura
  const driverCoords = { lat: pCoords.lat + 0.008, lng: pCoords.lng - 0.006 };

  const driver = activeRide?.driver || {
    name: 'Ramesh Patel',
    rating: 4.9,
    totalRides: 1420,
    phone: '+91 98765 43210',
  };

  const vehicle = activeRide?.vehicle || {
    make: 'Maruti',
    model: 'Swift Dzire',
    color: 'Pearl White',
    plateNumber: 'GJ01AB1234',
    type: 'Sedan',
  };

  const otp = activeRide?.otp || '4829';

  const handleStartLiveTracking = () => {
    setRideStatus('in-progress');
    navigate('/rider/tracking');
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelRide(activeRide?._id);
    } catch {
      // demo fallback
    }
    setShowCancelModal(false);
    navigate('/rider');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      {/* Map showing driver coming to pickup */}
      <div className="relative h-72 lg:h-auto lg:flex-1">
        <MapView center={[pCoords.lat, pCoords.lng]} zoom={14} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={[pCoords.lat, pCoords.lng]} label="Your Pickup" type="pickup" />
          <LocationMarker position={[driverCoords.lat, driverCoords.lng]} label={driver.name} type="driver" />
          <RouteDisplay
            coordinates={[
              [driverCoords.lat, driverCoords.lng],
              [pCoords.lat, pCoords.lng],
            ]}
            color="#3b82f6"
            dashArray="6, 8"
          />
        </MapView>

        <div className="absolute top-4 left-4 z-[400] bg-navy-800/95 backdrop-blur-md border border-accent/30 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
          <div>
            <p className="text-xs text-gray-400">Driver arriving in</p>
            <p className="text-sm font-bold text-accent">3 mins • 0.8 km away</p>
          </div>
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="lg:w-[460px] p-5 space-y-4 bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Driver Assigned</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-accent" /> Meet at pickup point
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent">
            On the way
          </span>
        </div>

        <DriverInfo
          driver={driver}
          vehicle={vehicle}
          otp={otp}
          onCall={() => alert(`Calling ${driver.name} at ${driver.phone || '+91 98765 43210'}`)}
          onMessage={() => alert('In-app chat opened with driver.')}
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="danger" icon={XCircle} onClick={() => setShowCancelModal(true)}>
            Cancel
          </Button>
          <Button icon={Navigation} onClick={handleStartLiveTracking}>
            Track Live Ride
          </Button>
        </div>
      </div>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel this ride?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-300 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            Your driver is already on the way. Are you sure you want to cancel?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowCancelModal(false)}>
              Keep Ride
            </Button>
            <Button variant="danger" fullWidth onClick={handleConfirmCancel}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriverAssigned;

