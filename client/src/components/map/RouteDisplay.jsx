import React, { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * RouteDisplay — renders a route polyline on the map
 * Accepts an array of coordinates and fits the map bounds to show the full route
 */
const RouteDisplay = ({
  coordinates = [], // Array of [lat, lng] pairs
  color = '#00d09c',
  weight = 4,
  opacity = 0.8,
  dashArray = null,
  fitBounds = true,
}) => {
  const map = useMap();

  // Fit map bounds to show full route
  useEffect(() => {
    if (fitBounds && coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: false });
    }
  }, [coordinates, fitBounds, map]);

  if (coordinates.length < 2) return null;

  return (
    <>
      {/* Shadow line for depth effect */}
      <Polyline
        positions={coordinates}
        pathOptions={{
          color: '#000000',
          weight: weight + 3,
          opacity: 0.2,
        }}
      />
      {/* Main route line */}
      <Polyline
        positions={coordinates}
        pathOptions={{
          color,
          weight,
          opacity,
          dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  );
};

export default RouteDisplay;
