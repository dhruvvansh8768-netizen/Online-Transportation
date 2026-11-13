import React, { createContext, useState, useCallback } from 'react';
import rideService from '../services/ride.service';

/**
 * RideContext — manages ride booking state across the app
 * Tracks pickup/destination, selected vehicle, fare estimates, and active ride
 */
export const RideContext = createContext(null);

export const RideProvider = ({ children }) => {
  // Location state
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // Ride configuration state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Active ride state
  const [activeRide, setActiveRide] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  // Loading / error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get fare estimate from backend
  const getFareEstimate = useCallback(async (pickupCoords, destCoords) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rideService.getFareEstimate({
        pickup: pickupCoords,
        destination: destCoords,
      });
      setFareEstimate(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to get fare estimate';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Book a ride
  const bookRide = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rideData = {
        pickup: { coordinates: pickup, address: pickupAddress },
        destination: { coordinates: destination, address: destinationAddress },
        vehicleType: selectedVehicle?.type,
        paymentMethod,
        promoCode: promoCode || undefined,
      };
      const response = await rideService.bookRide(rideData);
      setActiveRide(response.data.ride || response.data);
      setRideStatus('searching');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to book ride';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [pickup, destination, pickupAddress, destinationAddress, selectedVehicle, paymentMethod, promoCode]);

  // Cancel a ride
  const cancelRide = useCallback(async (rideId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rideService.cancelRide(rideId || activeRide?._id);
      setActiveRide(null);
      setRideStatus(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel ride';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [activeRide]);

  // Rate a ride
  const rateRide = useCallback(async (rideId, rating, feedback) => {
    try {
      setLoading(true);
      const response = await rideService.rateRide(rideId, { rating, feedback });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit rating';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset ride state for a fresh booking
  const resetRide = useCallback(() => {
    setPickup(null);
    setDestination(null);
    setPickupAddress('');
    setDestinationAddress('');
    setSelectedVehicle(null);
    setFareEstimate(null);
    setPromoCode('');
    setPaymentMethod('cash');
    setActiveRide(null);
    setRideStatus(null);
    setDriverLocation(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    pickup, setPickup,
    destination, setDestination,
    pickupAddress, setPickupAddress,
    destinationAddress, setDestinationAddress,
    selectedVehicle, setSelectedVehicle,
    fareEstimate, setFareEstimate,
    promoCode, setPromoCode,
    paymentMethod, setPaymentMethod,
    activeRide, setActiveRide,
    rideStatus, setRideStatus,
    driverLocation, setDriverLocation,
    loading, error,
    getFareEstimate,
    bookRide,
    cancelRide,
    rateRide,
    resetRide,
    clearError,
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};
