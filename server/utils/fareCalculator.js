// ============================================
// utils/fareCalculator.js — Fare Calculator
// ============================================
// Calculates ride fares based on distance,
// duration, vehicle type, and surge pricing.
// ============================================

require('dotenv').config();

// Base fare configuration (can be overridden by env variables)
const FARE_CONFIG = {
  // Base fares by vehicle type (in currency units)
  base_fare: {
    auto: parseFloat(process.env.BASE_FARE) || 25,
    bike: 15,
    mini: parseFloat(process.env.BASE_FARE) || 25,
    sedan: 40,
    suv: 60,
    premium: 80
  },
  // Cost per kilometer by vehicle type
  cost_per_km: {
    auto: 10,
    bike: 8,
    mini: parseFloat(process.env.COST_PER_KM) || 12,
    sedan: 15,
    suv: 20,
    premium: 25
  },
  // Cost per minute by vehicle type
  cost_per_min: {
    auto: 1,
    bike: 0.5,
    mini: parseFloat(process.env.COST_PER_MIN) || 2,
    sedan: 2.5,
    suv: 3,
    premium: 4
  },
  // Minimum fare by vehicle type
  minimum_fare: {
    auto: 30,
    bike: 20,
    mini: parseFloat(process.env.MINIMUM_FARE) || 50,
    sedan: 80,
    suv: 120,
    premium: 150
  }
};

/**
 * Calculate the fare for a ride.
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationMin - Duration in minutes
 * @param {string} vehicleType - Type of vehicle (auto, bike, mini, sedan, suv, premium)
 * @param {number} surgeMultiplier - Surge pricing multiplier (default 1.0)
 * @returns {object} - { fare, base_fare, distance_charge, time_charge, surge_charge, breakdown }
 */
const calculateFare = (distanceKm, durationMin, vehicleType = 'mini', surgeMultiplier = 1.0) => {
  // Normalize vehicle type; default to 'mini' if unknown
  const type = FARE_CONFIG.base_fare[vehicleType] ? vehicleType : 'mini';

  // Get fare components for the vehicle type
  const baseFare = FARE_CONFIG.base_fare[type];
  const costPerKm = FARE_CONFIG.cost_per_km[type];
  const costPerMin = FARE_CONFIG.cost_per_min[type];
  const minimumFare = FARE_CONFIG.minimum_fare[type];

  // Calculate individual charges
  const distanceCharge = distanceKm * costPerKm;
  const timeCharge = durationMin * costPerMin;

  // Calculate subtotal before surge
  const subtotal = baseFare + distanceCharge + timeCharge;

  // Apply surge multiplier
  const surgeCharge = subtotal * (surgeMultiplier - 1);
  let totalFare = subtotal + surgeCharge;

  // Ensure minimum fare
  totalFare = Math.max(totalFare, minimumFare);

  // Round to 2 decimal places
  totalFare = Math.round(totalFare * 100) / 100;

  return {
    fare: totalFare,
    base_fare: baseFare,
    distance_charge: Math.round(distanceCharge * 100) / 100,
    time_charge: Math.round(timeCharge * 100) / 100,
    surge_charge: Math.round(surgeCharge * 100) / 100,
    surge_multiplier: surgeMultiplier,
    vehicle_type: type,
    breakdown: {
      base: `₹${baseFare}`,
      distance: `₹${costPerKm}/km × ${distanceKm} km = ₹${Math.round(distanceCharge * 100) / 100}`,
      time: `₹${costPerMin}/min × ${durationMin} min = ₹${Math.round(timeCharge * 100) / 100}`,
      surge: surgeMultiplier > 1
        ? `${surgeMultiplier}x surge = +₹${Math.round(surgeCharge * 100) / 100}`
        : 'No surge',
      total: `₹${totalFare}`
    }
  };
};

/**
 * Estimate distance between two lat/lng points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
};

/**
 * Estimate ride duration based on distance.
 * Uses average speed assumptions for urban areas.
 * @param {number} distanceKm
 * @returns {number} Estimated duration in minutes
 */
const estimateDuration = (distanceKm) => {
  // Assume average speed of 25 km/h in urban traffic
  const avgSpeedKmH = 25;
  const durationHours = distanceKm / avgSpeedKmH;
  const durationMinutes = durationHours * 60;

  // Add a 5-minute buffer for pickup
  return Math.round(durationMinutes + 5);
};

/**
 * Get fare estimates for all vehicle types.
 * @param {number} distanceKm
 * @param {number} durationMin
 * @param {number} surgeMultiplier
 * @returns {Array} Array of fare estimates for each vehicle type
 */
const getAllFareEstimates = (distanceKm, durationMin, surgeMultiplier = 1.0) => {
  const vehicleTypes = ['bike', 'auto', 'mini', 'sedan', 'suv', 'premium'];
  return vehicleTypes.map(type => calculateFare(distanceKm, durationMin, type, surgeMultiplier));
};

// Helper: Convert degrees to radians
function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  calculateFare,
  calculateDistance,
  estimateDuration,
  getAllFareEstimates,
  FARE_CONFIG
};
