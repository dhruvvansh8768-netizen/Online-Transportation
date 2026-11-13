import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Car, LocateFixed, MapPin, Search } from 'lucide-react';
import { RideContext } from '../../context/RideContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { mapService } from '../../services/map.service';
import rideService from '../../services/ride.service';
import { BackLink, ErrorNotice, Loading, Panel, ResourceState, Workspace, money, messageFor, useResource } from '../../components/common/Workspace';
import { JourneyMap, JourneySteps, RouteSummary } from '../../components/ride/Journey';

const stages = ['Locations', 'Vehicle', 'Confirm'];
const loadRide = () => rideService.getActiveRide();
const vehicleNames = { bike: 'Bike', auto: 'Auto', mini: 'Hatchback', sedan: 'Sedan', suv: 'SUV', premium: 'Premium' };
const demoFares = { bike: 45, auto: 75, mini: 120, sedan: 165, suv: 220, premium: 285 };

export function riderRidePath(status) {
  if (status === 'requested') return '/rider/finding-driver';
  if (status === 'in_progress') return '/rider/tracking';
  if (status === 'completed') return '/rider/completed';
  return '/rider/driver-assigned';
}

function AddressSearch({ label, value, onSelect, mapActive, onMap, onGps }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const revision = useRef(0);
  const search = async (event) => {
    event.preventDefault();
    const request = ++revision.current;
    setSearching(true);
    const matches = await mapService.searchLocations(query);
    if (request !== revision.current) return;
    setResults(matches);
    setSearched(true);
    setSearching(false);
  };
  return (
    <div className="rg-address">
      <form onSubmit={search}>
        <label className="rg-field">
          <span>{label}</span>
          <span className="rg-input-action">
            <input value={query} placeholder={'Search ' + label.toLowerCase()} onChange={(event) => {
              revision.current += 1;
              setSearching(false);
              setSearched(false);
              setResults([]);
              setQuery(event.target.value);
            }} />
            <button className="rg-link rg-secondary rg-icon-button" type="submit" aria-label={'Search ' + label.toLowerCase()}><Search size={17} /></button>
          </span>
        </label>
      </form>
      <div className="rg-address-tools">
        <button type="button" aria-pressed={mapActive} className="rg-back" onClick={onMap}><MapPin size={15} /> {mapActive ? 'Tap the map to set pin' : 'Choose on map'}</button>
        {onGps && <button type="button" className="rg-back" onClick={onGps}><LocateFixed size={15} /> Use GPS</button>}
      </div>
      {value && <p className="rg-selected-address">{value}</p>}
      {searching && <Loading>Finding addresses…</Loading>}
      {searched && !results.length && <p className="rg-empty">No matching addresses. Choose a point on the map.</p>}
      {results.length > 0 && (
        <ul className="rg-results">
          {results.map(({ name, address, lat, lng }) => (
            <li key={lat + ',' + lng}><button type="button" onClick={() => {
              setQuery(name);
              setResults([]);
              setSearched(false);
              onSelect({ lat, lng }, address);
            }}><MapPin size={16} /><span><strong>{name}</strong><small>{address}</small></span></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RiderBooking({ step }) {
  const { token } = useAuth();
  const demo = token === 'demo-token';
  const navigate = useNavigate();
  const ride = useContext(RideContext);
  const { pickup, destination, pickupAddress, destinationAddress, setPickup, setDestination, setPickupAddress,
    setDestinationAddress, fareEstimate, setFareEstimate, selectedVehicle, setSelectedVehicle, setActiveRide } = ride;
  const resource = useResource(demo ? loadDemo : loadRide);
  const { location, error: gpsError, loading: locating, refresh } = useLocation();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [promo, setPromo] = useState('');
  const [choice, setChoice] = useState(selectedVehicle?.type || '');
  const mapRevision = useRef(0);
  const mapContainer = useRef(null);
  const choosePin = (type) => {
    setPin(type);
    if (matchMedia('(max-width: 767px)').matches) {
      mapContainer.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };
  const pendingRide = resource.data?.ride;
  const select = (type, point, address) => {
    mapRevision.current += 1;
    setFareEstimate(null);
    setSelectedVehicle(null);
    if (type === 'pickup') {
      setPickup(point);
      setPickupAddress(address);
    } else {
      setDestination(point);
      setDestinationAddress(address);
    }
  };
  const setMapPoint = async ({ latlng: { lat, lng } }) => {
    if (!pin) return;
    const type = pin;
    select(type, { lat, lng }, lat.toFixed(5) + ', ' + lng.toFixed(5));
    const revision = mapRevision.current;
    setPin('');
    const address = await mapService.reverseGeocode(lat, lng);
    if (revision === mapRevision.current) {
      (type === 'pickup' ? setPickupAddress : setDestinationAddress)(address);
    }
  };
  const coordinates = () => ({
    pickup_lat: pickup.lat, pickup_lng: pickup.lng,
    drop_lat: destination.lat, drop_lng: destination.lng,
  });
  const showFares = async () => {
    setError('');
    setBusy(true);
    try {
      const estimate = demo ? {
        distance_km: mapService.calculateDistanceKm(pickup, destination),
        estimates: Object.entries(demoFares).map(([vehicle_type, fare]) => ({ vehicle_type, fare })),
      } : (await rideService.getFareEstimate(coordinates())).data.data;
      setFareEstimate(estimate);
      navigate('/rider/choose-ride');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };
  const chosen = fareEstimate?.estimates.find((item) => item.vehicle_type === choice);
  const book = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const trip = demo ? {
        ...coordinates(), ride_id: 'demo', pickup_address: pickupAddress, drop_address: destinationAddress,
        fare: selectedVehicle.fare, status: 'requested', otp: '4829',
        driver_name: 'Ramesh Patel', vehicle_model: 'Swift Dzire', registration_number: 'GJ01AB1234',
      } : (await rideService.bookRide({
        ...coordinates(), pickup_address: pickupAddress, drop_address: destinationAddress,
        vehicle_type: selectedVehicle.type, promo_code: promo.trim() || undefined,
      })).data.data.ride;
      setActiveRide(trip);
      navigate(riderRidePath(trip.status));
    } catch (err) {
      const existing = err.response?.data?.data?.active_ride;
      if (existing) { setActiveRide(existing); navigate(riderRidePath(existing.status)); }
      else setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };
  const missing = (step >= 1 && !fareEstimate) || (step === 2 && !selectedVehicle);
  const heading = ['Where are you going?', 'Choose your ride', 'Confirm your booking'][step];
  return (
    <Workspace title={heading} description={step === 0 ? 'Set your pickup and drop-off to see available fares.' : undefined}
      action={step > 0 && <BackLink to={step === 2 ? '/rider/choose-ride' : '/rider/search'} />}>
      <div className="rg-map-layout">
        <div ref={mapContainer}>
          <JourneyMap pickup={pickup} dropoff={destination} onClick={pin ? setMapPoint : undefined}>
            {pin && <p className="rg-map-prompt">Choose {pin === 'pickup' ? 'a pickup' : 'a drop-off'} point on the map</p>}
          </JourneyMap>
        </div>
        <Panel className="rg-ride-sheet">
          <JourneySteps stages={stages} current={step} />
          <ErrorNotice>{error}</ErrorNotice>
          {pendingRide ? (
            <>
              <h2>You have an active ride</h2>
              <RouteSummary pickup={pendingRide.pickup_address} dropoff={pendingRide.drop_address} />
              <Link className="rg-link rg-primary" to={riderRidePath(pendingRide.status)}>Resume ride <ArrowRight size={17} /></Link>
            </>
          ) : !resource.data ? <ResourceState {...resource} /> : missing ? (
            <Link className="rg-link rg-primary" to="/rider/search">Set your route <ArrowRight size={17} /></Link>
          ) : step === 0 ? (
            <>
              <AddressSearch key={'pickup:' + pickupAddress} label="Pickup" value={pickupAddress} onSelect={(...args) => select('pickup', ...args)}
                mapActive={pin === 'pickup'} onMap={() => choosePin('pickup')} onGps={() => {
                  if (location && !gpsError) select('pickup', location, 'Current GPS location');
                  else refresh();
                }} />
              {locating && <small className="rg-muted">Finding GPS location…</small>}
              {gpsError && <small className="rg-muted">GPS unavailable. Search for an address or choose a point on the map.</small>}
              <AddressSearch key={'drop:' + destinationAddress} label="Drop-off" value={destinationAddress} onSelect={(...args) => select('drop', ...args)}
                mapActive={pin === 'drop'} onMap={() => choosePin('drop')} />
              <button className="rg-link rg-primary" type="button" disabled={!pickup || !destination || busy} onClick={showFares}>
                {busy ? 'Getting fares…' : 'Compare fares'} <ArrowRight size={18} />
              </button>
            </>
          ) : step === 1 ? (
            <>
              <RouteSummary pickup={pickupAddress} dropoff={destinationAddress} />
              <div className="rg-inline rg-muted">{fareEstimate.distance_km} km {fareEstimate.estimated_duration_min && '· About ' + fareEstimate.estimated_duration_min + ' min'}</div>
              <div className="rg-vehicle-list" role="group" aria-label="Vehicle options">
                {fareEstimate.estimates.map((item) => {
                  const type = item.vehicle_type;
                  const Icon = type === 'bike' ? Bike : Car;
                  return <button key={type} type="button" aria-pressed={type === choice} onClick={() => setChoice(type)}>
                    <Icon size={21} /><span>{vehicleNames[type] || type}</span><strong>{money(item.fare)}</strong>
                  </button>;
                })}
              </div>
              <button className="rg-link rg-primary" disabled={!chosen} onClick={() => {
                setSelectedVehicle({ type: choice, fare: chosen.fare });
                navigate('/rider/confirm');
              }}>Review booking <ArrowRight size={18} /></button>
            </>
          ) : (
            <form className="rg-stack" onSubmit={book}>
              <RouteSummary pickup={pickupAddress} dropoff={destinationAddress} />
              <dl className="rg-definition"><div><dt>Vehicle</dt><dd>{vehicleNames[selectedVehicle.type]}</dd></div>
                <div><dt>Estimated fare</dt><dd>{money(selectedVehicle.fare)}</dd></div></dl>
              {!demo && <label className="rg-field"><span>Promo code (optional)</span><input value={promo} onChange={(event) => setPromo(event.target.value)} maxLength={50} /></label>}
              <button className="rg-link rg-primary" disabled={busy}>{busy ? 'Requesting ride…' : 'Request ride'} <ArrowRight size={18} /></button>
            </form>
          )}
        </Panel>
      </div>
    </Workspace>
  );
}

const loadDemo = async () => ({ data: { data: {} } });

