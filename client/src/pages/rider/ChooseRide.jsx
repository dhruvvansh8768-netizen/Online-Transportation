import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Clock, Route, Sparkles, ArrowRight } from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import RouteDisplay from '../../components/map/RouteDisplay';
import VehicleSelector from '../../components/ride/VehicleSelector';
import Button from '../../components/common/Button';
import { RideContext } from '../../context/RideContext';
import { haversineDistance, formatDistance, formatDuration, formatCurrency } from '../../utils/helpers';

/**
 * ChooseRide — Route preview map + Vehicle selection cards with live fare estimate
 */
const ChooseRide = () => {
  const navigate = useNavigate();
  const {
    pickup,
    destination,
    pickupAddress,
    destinationAddress,
    selectedVehicle,
    setSelectedVehicle,
    setFareEstimate,
  } = useContext(RideContext);

  const pCoords = pickup || { lat: 23.0365, lng: 72.5611 }; // 25 MG Road, Navrangpura
  const dCoords = destination || { lat: 23.0734, lng: 72.6266 }; // 10 Airport Road, Hansol

  const distanceMeters = haversineDistance(pCoords, dCoords);
  const distanceKm = Math.max(1.2, distanceMeters / 1000);
  const durationSec = Math.round(distanceKm * 180); // ~20 km/h city speed
  const baseFare = Math.round(30 + distanceKm * 12);

  const [currentType, setCurrentType] = useState(selectedVehicle?.type || 'auto');

  useEffect(() => {
    if (!selectedVehicle) {
      setSelectedVehicle({
        type: 'auto',
        name: 'Auto',
        multiplier: 1.3,
        eta: '3 min',
      });
    }
  }, [selectedVehicle, setSelectedVehicle]);

  const handleSelectVehicle = (vehicle) => {
    setCurrentType(vehicle.type);
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    const multiplier = selectedVehicle?.multiplier || 1.3;
    const distanceFare = Math.round(distanceKm * 10 * multiplier);
    const timeFare = Math.round((durationSec / 60) * 1.5);
    const base = Math.round(25 * multiplier);
    const tax = Math.round((base + distanceFare + timeFare) * 0.05);
    const total = base + distanceFare + timeFare + tax;

    setFareEstimate({
      baseFare: base,
      distanceFare,
      timeFare,
      surcharge: 0,
      discount: 0,
      tax,
      total,
      distance: formatDistance(distanceKm * 1000),
      duration: formatDuration(durationSec),
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMin: Math.round(durationSec / 60),
    });

    navigate('/rider/confirm');
  };

  const routeCoordinates = [
    [pCoords.lat, pCoords.lng],
    [(pCoords.lat + dCoords.lat) / 2 + 0.004, (pCoords.lng + dCoords.lng) / 2 - 0.004],
    [dCoords.lat, dCoords.lng],
  ];

  const estTotal = Math.round(baseFare * (selectedVehicle?.multiplier || 1.3));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col lg:flex-row">
      {/* Map Route Preview */}
      <div className="relative h-64 lg:h-auto lg:flex-1">
        <MapView center={[pCoords.lat, pCoords.lng]} zoom={13} className="w-full h-full rounded-none" style={{ height: '100%' }}>
          <LocationMarker position={[pCoords.lat, pCoords.lng]} label={pickupAddress || 'Pickup'} type="pickup" />
          <LocationMarker position={[dCoords.lat, dCoords.lng]} label={destinationAddress || 'Destination'} type="destination" />
          <RouteDisplay coordinates={routeCoordinates} />
        </MapView>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-[400] bg-navy-800/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-white hover:border-accent/50 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Trip metrics floating pill */}
        <div className="absolute bottom-4 left-4 right-4 lg:right-auto z-[400] glass-dark rounded-2xl px-4 py-3 border border-white/10 flex items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-2 text-sm">
            <Route className="w-4 h-4 text-accent" />
            <span className="text-white font-semibold">{formatDistance(distanceKm * 1000)}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-white font-semibold">{formatDuration(durationSec)}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Selection Panel */}
      <div className="lg:w-[460px] bg-navy-900 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10 bg-navy-800/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="truncate">{pickupAddress || 'Current Location'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white font-medium">
            <span className="w-2 h-2 rounded-sm bg-red-400" />
            <span className="truncate">{destinationAddress || 'Koramangala 4th Block'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <VehicleSelector
            selectedType={currentType}
            onSelect={handleSelectVehicle}
            baseFare={baseFare}
          />
        </div>

        {/* Sticky Bottom Confirm */}
        <div className="p-5 bg-navy-800 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-accent">
              <Sparkles className="w-3.5 h-3.5" /> Best fare guaranteed
            </span>
            <span>Estimated: <strong className="text-white">{formatCurrency(estTotal)}</strong></span>
          </div>
          <Button fullWidth size="lg" iconRight={ArrowRight} onClick={handleContinue}>
            Select {selectedVehicle?.name || 'Auto'} • {formatCurrency(estTotal)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChooseRide;

