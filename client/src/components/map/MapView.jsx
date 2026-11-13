import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, getMapTileConfig } from '../../config/mapConfig';

function MapInteractions({ center, zoom, onClick }) {
  const map = useMapEvents({ click: (event) => onClick?.(event) });
  const [lat, lng] = center;
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: false });
  }, [lat, lng, zoom, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false, debounceMoveend: true }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MapView({
  center = DEFAULT_MAP_CENTER, zoom = DEFAULT_MAP_ZOOM, theme = 'voyager',
  children, className = '', style = {}, onClick, scrollWheelZoom = true,
}) {
  const [fallback, setFallback] = useState(false);
  const [imagery, setImagery] = useState('loading');
  const tiles = getMapTileConfig(fallback ? 'osm' : theme);
  useEffect(() => {
    setFallback(false);
    setImagery('loading');
  }, [theme]);
  return (
    <div className={'relative rounded-xl overflow-hidden ' + className} style={{ minHeight: 290, ...style }}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} scrollWheelZoom={scrollWheelZoom} style={{ width: '100%', height: '100%', minHeight: 290 }}>
        <MapInteractions center={center} zoom={zoom} onClick={onClick} />
        <TileLayer key={tiles.url} url={tiles.url} attribution={tiles.attribution} maxZoom={tiles.maxZoom || 20} eventHandlers={{
          tileerror: () => {
            if (fallback || theme === 'osm') setImagery((state) => state === 'ready' ? state : 'unavailable');
            else setFallback(true);
          },
          tileload: () => setImagery('ready'),
        }} />
        <ZoomControl position="bottomright" />
        {children}
      </MapContainer>
      {imagery !== 'ready' && <p className="rg-map-tile-status" role="status">{imagery === 'loading' ? 'Loading map imagery…' : 'Map imagery unavailable'}</p>}
    </div>
  );
}

