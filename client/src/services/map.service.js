import { MAP_API_KEY, DEFAULT_MAP_CENTER } from '../config/mapConfig';

/**
 * Map & Geocoding Service
 * Uses the integrated MAP_API_KEY for tile layers, geocoding, and distance calculations
 */

// Popular Lab-2 / Lab-3 Preset Locations (Ahmedabad)
const AHMEDABAD_PRESETS = [
  { name: '25, MG Road, Navrangpura', address: 'House No. 25, MG Road, Navrangpura, Ahmedabad, Gujarat 380009', lat: 23.0365, lng: 72.5611 },
  { name: '10, Airport Road, Hansol', address: 'House No. 10, Airport Road, Hansol, Ahmedabad, Gujarat 382475', lat: 23.0734, lng: 72.6266 },
  { name: '101, CG Road, Navrangpura', address: '101, CG Road, Navrangpura, Ahmedabad, Gujarat 380009', lat: 23.0305, lng: 72.5594 },
  { name: '202, SG Highway, Bodakdev', address: '202, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054', lat: 23.0402, lng: 72.5078 },
  { name: '303, Ring Road, Satellite', address: '303, Ring Road, Satellite, Ahmedabad, Gujarat 380015', lat: 23.0262, lng: 72.5170 },
  { name: '404, Ashram Road, Usmanpura', address: '404, Ashram Road, Usmanpura, Ahmedabad, Gujarat 380013', lat: 23.0462, lng: 72.5698 },
  { name: '505, University Road, Vastrapur', address: '505, University Road, Vastrapur, Ahmedabad, Gujarat 380052', lat: 23.0350, lng: 72.5293 },
  { name: '606, Prahladnagar Road, Prahladnagar', address: '606, Prahladnagar Road, Prahladnagar, Ahmedabad, Gujarat 380015', lat: 23.0120, lng: 72.5105 },
  { name: '707, Bopal Road, Bopal', address: '707, Bopal Road, Bopal, Ahmedabad, Gujarat 380058', lat: 23.0338, lng: 72.4634 },
  { name: '909, Maninagar Road, Maninagar', address: '909, Maninagar Road, Maninagar, Ahmedabad, Gujarat 380008', lat: 22.9962, lng: 72.6020 },
  { name: '1001, Chandkheda Road, Chandkheda', address: '1001, Chandkheda Road, Chandkheda, Ahmedabad, Gujarat 382424', lat: 23.1095, lng: 72.5872 },
  { name: 'Adani University Campus, Shantigram', address: 'Adani Shantigram, SG Highway, Ahmedabad 382421', lat: 23.1537, lng: 72.5489 },
];

export const mapService = {
  getApiKey: () => MAP_API_KEY,

  /**
   * Search locations by query string
   */
  searchLocations: async (query) => {
    if (!query || query.trim().length === 0) return AHMEDABAD_PRESETS;
    const lower = query.toLowerCase().trim();

    // 1. Filter local curated locations first
    const localMatches = AHMEDABAD_PRESETS.filter(
      (loc) => loc.name.toLowerCase().includes(lower) || loc.address.toLowerCase().includes(lower)
    );

    if (localMatches.length > 0) return localMatches;

    // 2. Try online geocoding if online and query doesn't match presets
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Ahmedabad, Gujarat'
      )}&limit=5`;
      const res = await fetch(endpoint, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.map((item) => ({
          name: item.display_name.split(',')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
      }
    } catch {
      // Graceful fallback to presets
    }

    return [];
  },

  /**
   * Reverse geocode coordinates to human-readable address
   */
  reverseGeocode: async (lat, lng) => {
    try {
      const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(endpoint, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
    } catch {
      // Fallback
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  },

  /**
   * Calculate distance between two coordinates in kilometers (Haversine)
   */
  calculateDistanceKm: (coord1, coord2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  },
};

export default mapService;

