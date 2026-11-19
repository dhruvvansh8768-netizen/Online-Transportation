/**
 * Map Configuration & Carto Tile Integration
 * Reads API Key securely from environment variables (VITE_MAP_API_KEY)
 */

export const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY || '';
const keyParam = MAP_API_KEY ? `?key=${MAP_API_KEY}` : '';

// Default map center: Ahmedabad (Lab-2 / Lab-3 MG Road, Navrangpura)
export const DEFAULT_MAP_CENTER = [23.0365, 72.5611];
export const DEFAULT_MAP_ZOOM = 13;

// Map tile layer providers using Carto API key with parameter `key=`
export const MAP_STYLES = {
  // Official Carto Voyager raster tile as copied from Carto Dashboard
  voyager: {
    name: 'Carto Voyager (Day / Navigation)',
    url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${keyParam}`,
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Carto Dark Matter raster tile
  dark: {
    name: 'Carto Dark Matter (Night Mode)',
    url: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${keyParam}`,
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Carto Positron (Light)
  light: {
    name: 'Carto Positron (Light Mode)',
    url: `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png${keyParam}`,
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Standard OpenStreetMap fallback (no key needed)
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

/**
 * Get active tile configuration
 * Defaults to 'voyager' which matches the exact URL copied from Carto
 */
export const getMapTileConfig = (styleKey = 'voyager') => {
  return MAP_STYLES[styleKey] || MAP_STYLES.voyager;
};

export default {
  MAP_API_KEY,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_STYLES,
  getMapTileConfig,
};
