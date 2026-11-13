import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/**
 * LocationMarker — renders a map marker at given coordinates
 * Supports custom colors and drag events
 */
const LocationMarker = ({
  position,
  label = '',
  type = 'default', // 'pickup', 'destination', 'driver', 'default'
  draggable = false,
  onDragEnd,
  children,
}) => {
  // Custom icon based on type
  const icon = useMemo(() => {
    const colors = {
      pickup: '#d28b21',
      destination: '#ef4444',
      driver: '#3b82f6',
      default: '#d28b21',
    };

    const color = colors[type] || colors.default;

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, [type]);

  if (!position) return null;

  const pos = Array.isArray(position) ? position : [position.lat, position.lng];

  return (
    <Marker
      position={pos}
      icon={icon}
      draggable={draggable}
      eventHandlers={
        draggable && onDragEnd
          ? {
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onDragEnd({ lat, lng });
              },
            }
          : {}
      }
    >
      {(label || children) && (
        <Popup className="custom-popup">
          <div className="text-navy-900 font-medium text-sm">
            {label && <p>{label}</p>}
            {children}
          </div>
        </Popup>
      )}
    </Marker>
  );
};

export default LocationMarker;
