import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Navigation, Search, Clock, Home, Briefcase,
  CheckCircle2, ArrowUpDown, Crosshair
} from 'lucide-react';
import MapView from '../../components/map/MapView';
import LocationMarker from '../../components/map/LocationMarker';
import Button from '../../components/common/Button';
import { RideContext } from '../../context/RideContext';
import { useLocation } from '../../hooks/useLocation';

const POPULAR_LOCATIONS = [
  { name: '25, MG Road, Navrangpura', address: 'House No. 25, MG Road, Navrangpura, Ahmedabad, Gujarat 380009, India', lat: 23.0365, lng: 72.5611 },
  { name: '10, Airport Road, Hansol', address: 'House No. 10, Airport Road, Hansol, Ahmedabad, Gujarat 382475, India', lat: 23.0734, lng: 72.6266 },
  { name: '101, CG Road, Navrangpura', address: '101, CG Road, Navrangpura, Ahmedabad, Gujarat 380009, India', lat: 23.0305, lng: 72.5594 },
  { name: '202, SG Highway, Bodakdev', address: '202, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054, India', lat: 23.0402, lng: 72.5078 },
  { name: '303, Ring Road, Satellite', address: '303, Ring Road, Satellite, Ahmedabad, Gujarat 380015, India', lat: 23.0262, lng: 72.5170 },
  { name: '404, Ashram Road, Usmanpura', address: '404, Ashram Road, Usmanpura, Ahmedabad, Gujarat 380013, India', lat: 23.0462, lng: 72.5698 },
  { name: '505, University Road, Vastrapur', address: '505, University Road, Vastrapur, Ahmedabad, Gujarat 380052, India', lat: 23.0350, lng: 72.5293 },
  { name: '606, Prahladnagar Road, Prahladnagar', address: '606, Prahladnagar Road, Prahladnagar, Ahmedabad, Gujarat 380015, India', lat: 23.0120, lng: 72.5105 },
  { name: '707, Bopal Road, Bopal', address: '707, Bopal Road, Bopal, Ahmedabad, Gujarat 380058, India', lat: 23.0338, lng: 72.4634 },
  { name: '909, Maninagar Road, Maninagar', address: '909, Maninagar Road, Maninagar, Ahmedabad, Gujarat 380008, India', lat: 22.9962, lng: 72.6020 },
  { name: '1001, Chandkheda Road, Chandkheda', address: '1001, Chandkheda Road, Chandkheda, Ahmedabad, Gujarat 382424, India', lat: 23.1095, lng: 72.5872 },
  { name: 'Adani University Campus, Shantigram', address: 'Adani Shantigram, SG Highway, Ahmedabad, Gujarat 382421, India', lat: 23.1537, lng: 72.5489 },
];

/**
 * SearchDestination — Pickup & Drop-off search with interactive map pin picker
 */
const SearchDestination = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const {
    pickup, setPickup,
    destination, setDestination,
    pickupAddress, setPickupAddress,
    destinationAddress, setDestinationAddress,
  } = useContext(RideContext);

  const [pickupQuery, setPickupQuery] = useState(pickupAddress || 'Current Location (GPS)');
  const [destQuery, setDestQuery] = useState(destinationAddress || '');
  const [activeField, setActiveField] = useState('destination'); // 'pickup' | 'destination'
  const [pickOnMap, setPickOnMap] = useState(false);

  const defaultCenter = pickup
    ? [pickup.lat, pickup.lng]
    : location
    ? [location.lat, location.lng]
    : [23.0365, 72.5611]; // Ahmedabad (MG Road, Navrangpura)

  const activeQuery = activeField === 'pickup' ? pickupQuery : destQuery;

  const filteredLocations = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(activeQuery.toLowerCase())
  );

  const handleSelectPlace = (place) => {
    if (activeField === 'pickup') {
      setPickup({ lat: place.lat, lng: place.lng });
      setPickupAddress(place.name);
      setPickupQuery(place.name);
      setActiveField('destination');
    } else {
      setDestination({ lat: place.lat, lng: place.lng });
      setDestinationAddress(place.name);
      setDestQuery(place.name);
    }
  };

  const handleUseCurrentLocation = () => {
    const coords = location && location.lat !== 12.9716 ? { lat: location.lat, lng: location.lng } : { lat: 23.0365, lng: 72.5611 };
    setPickup(coords);
    setPickupAddress('Current Location (GPS)');
    setPickupQuery('Current Location (GPS)');
  };

  const handleSwapLocations = () => {
    const tempCoords = pickup;
    const tempAddr = pickupQuery;
    setPickup(destination);
    setPickupAddress(destQuery);
    setPickupQuery(destQuery);
    setDestination(tempCoords);
    setDestinationAddress(tempAddr);
    setDestQuery(tempAddr);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const label = `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    if (activeField === 'pickup') {
      setPickup({ lat, lng });
      setPickupAddress(label);
      setPickupQuery(label);
    } else {
      setDestination({ lat, lng });
      setDestinationAddress(label);
      setDestQuery(label);
    }
  };

  const handleContinue = () => {
    if (!pickup) {
      setPickup({ lat: defaultCenter[0], lng: defaultCenter[1] });
      setPickupAddress(pickupQuery || 'Current Location (GPS)');
    }
    if (!destination && destQuery.trim()) {
      // Fallback coordinates if user typed a custom address
      setDestination({ lat: defaultCenter[0] + 0.032, lng: defaultCenter[1] + 0.025 });
      setDestinationAddress(destQuery);
    }
    navigate('/rider/choose-ride');
  };

  const canProceed = (destQuery.trim().length > 0 || destination) && (pickupQuery.trim().length > 0 || pickup);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex flex-col">
      {/* Top Search Header */}
      <div className="bg-navy-800 border-b border-white/10 p-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Plan your ride</span>
            </button>
            <button
              onClick={() => setPickOnMap(!pickOnMap)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                pickOnMap
                  ? 'bg-accent text-navy-900 border-accent'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-accent/40'
              }`}
            >
              {pickOnMap ? 'Hide Map Picker' : 'Pick on Map'}
            </button>
          </div>

          {/* Dual Input Box */}
          <div className="relative bg-navy-900 border border-white/10 rounded-2xl p-3 space-y-2">
            {/* Pickup Input */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0 ml-1" />
              <input
                type="text"
                value={pickupQuery}
                onFocus={() => setActiveField('pickup')}
                onChange={(e) => setPickupQuery(e.target.value)}
                placeholder="Enter pickup location"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none py-1.5"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                title="Use GPS location"
                className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t border-white/10 ml-7 relative">
              <button
                type="button"
                onClick={handleSwapLocations}
                title="Swap pickup & destination"
                className="absolute right-1 -top-3.5 p-1.5 rounded-full bg-navy-800 border border-white/10 text-gray-300 hover:text-accent transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-red-400 flex-shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                value={destQuery}
                onFocus={() => setActiveField('destination')}
                onChange={(e) => setDestQuery(e.target.value)}
                placeholder="Where to? Search landmark, mall, station..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none py-1.5"
              />
              {destQuery && (
                <button
                  onClick={() => {
                    setDestQuery('');
                    setDestination(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Map Picker or Suggestions */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-4">
        {pickOnMap && (
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <div className="bg-navy-800 px-4 py-2 text-xs text-gray-300 flex items-center justify-between">
              <span>
                Tap map to set <strong className="text-accent uppercase">{activeField}</strong> pin
              </span>
              <span className="text-gray-400">Drag markers to fine-tune</span>
            </div>
            <MapView center={defaultCenter} zoom={13} onClick={handleMapClick} style={{ height: '300px' }}>
              {pickup && (
                <LocationMarker
                  position={[pickup.lat, pickup.lng]}
                  label="Pickup"
                  type="pickup"
                  draggable
                  onDragEnd={(coords) => {
                    setPickup(coords);
                    setPickupQuery(`Pinned (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
                  }}
                />
              )}
              {destination && (
                <LocationMarker
                  position={[destination.lat, destination.lng]}
                  label="Destination"
                  type="destination"
                  draggable
                  onDragEnd={(coords) => {
                    setDestination(coords);
                    setDestQuery(`Pinned (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
                  }}
                />
              )}
            </MapView>
          </div>
        )}

        {/* Saved Shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              handleSelectPlace({ name: 'Indiranagar Home', address: '12th Main, Indiranagar', lat: 12.9784, lng: 77.6408 })
            }
            className="flex items-center gap-3 p-3.5 bg-navy-800 border border-white/10 hover:border-accent/40 rounded-2xl text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Home</p>
              <p className="text-xs text-gray-400 truncate">Indiranagar 12th Main</p>
            </div>
          </button>

          <button
            onClick={() =>
              handleSelectPlace({ name: 'Bagmane Tech Park', address: 'CV Raman Nagar', lat: 12.9817, lng: 77.6631 })
            }
            className="flex items-center gap-3 p-3.5 bg-navy-800 border border-white/10 hover:border-accent/40 rounded-2xl text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Work</p>
              <p className="text-xs text-gray-400 truncate">Bagmane Tech Park</p>
            </div>
          </button>
        </div>

        {/* Location Suggestions List */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-accent" />
              Suggested Locations
            </span>
            <span className="text-xs text-gray-500">Tap to set {activeField}</span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredLocations.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPlace(loc)}
                className="w-full flex items-center gap-3.5 p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{loc.name}</p>
                  <p className="text-xs text-gray-400 truncate">{loc.address}</p>
                </div>
                <Clock className="w-4 h-4 text-gray-600" />
              </button>
            ))}

            {filteredLocations.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                No matching preset places — you can still continue with &ldquo;{activeQuery}&rdquo; or pick on map.
              </div>
            )}
          </div>
        </div>

        {/* Confirm Route CTA */}
        <div className="sticky bottom-20 md:bottom-4 pt-2">
          <Button
            fullWidth
            size="lg"
            disabled={!canProceed}
            icon={CheckCircle2}
            onClick={handleContinue}
          >
            Confirm Locations & View Fares
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchDestination;
