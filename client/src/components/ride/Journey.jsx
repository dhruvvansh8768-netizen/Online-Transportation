import React, { useMemo } from 'react';
import { Check, Circle, MapPin } from 'lucide-react';
import MapView from '../map/MapView';
import LocationMarker from '../map/LocationMarker';
import RouteDisplay from '../map/RouteDisplay';
import { DEFAULT_MAP_CENTER } from '../../config/mapConfig';

export function JourneySteps({ stages, current }) {
  return (
    <ol className="rg-steps" aria-label="Ride progress" style={{ '--step-count': stages.length }}>
      {stages.map((label, index) => (
        <li key={label} aria-current={current === index ? 'step' : undefined} data-reached={index <= current}>
          <span>{index < current ? <Check size={13} /> : index + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}

export function RouteSummary({ pickup, dropoff }) {
  return (
    <div className="rg-route-summary">
      <div><Circle size={15} /><span><small>Pickup</small><strong>{pickup || 'Choose pickup'}</strong></span></div>
      <div><MapPin size={16} /><span><small>Drop-off</small><strong>{dropoff || 'Choose destination'}</strong></span></div>
    </div>
  );
}

export function ridePoint(ride, prefix) {
  const lat = ride?.[prefix + '_lat'];
  const lng = ride?.[prefix + '_lng'];
  return lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null;
}

export function JourneyMap({ pickup, dropoff, driver, onClick, children, label = 'Ride map' }) {
  const center = pickup ? [pickup.lat, pickup.lng] : DEFAULT_MAP_CENTER;
  const pickupLat = pickup?.lat;
  const pickupLng = pickup?.lng;
  const dropLat = dropoff?.lat;
  const dropLng = dropoff?.lng;
  const coordinates = useMemo(() => pickupLat != null && dropLat != null ? [[pickupLat, pickupLng], [dropLat, dropLng]] : [],
    [pickupLat, pickupLng, dropLat, dropLng]);
  return (
    <div className="rg-map" aria-label={label}>
      <MapView center={center} zoom={13} className="rg-map-view" scrollWheelZoom={false} onClick={onClick}>
        <LocationMarker position={pickup} type="pickup" label="Pickup" />
        <LocationMarker position={dropoff} type="destination" label="Drop-off" />
        <LocationMarker position={driver} type="driver" label="Driver position" />
        <RouteDisplay coordinates={coordinates} color="#d28b21" dashArray="6 8" />
      </MapView>
      {children}
    </div>
  );
}

