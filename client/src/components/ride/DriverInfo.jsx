import React from 'react';
import { Phone, Star, Car, MessageSquare, Shield } from 'lucide-react';
import { formatRating, getInitials } from '../../utils/helpers';

/**
 * DriverInfo — displays assigned driver information card
 */
const DriverInfo = ({ driver, vehicle, otp, onCall, onMessage, className = '' }) => {
  if (!driver) return null;

  return (
    <div className={`bg-navy-800 border border-white/10 rounded-2xl p-5 ${className}`}>
      {/* Driver header */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
          {driver.avatar ? (
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-accent">
              {getInitials(driver.name)}
            </span>
          )}
        </div>

        {/* Name and rating */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white truncate">{driver.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-yellow-400">
                {formatRating(driver.rating)}
              </span>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400">{driver.totalRides || 0} rides</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {onCall && (
            <button
              onClick={onCall}
              className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          {onMessage && (
            <button
              onClick={onMessage}
              className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Vehicle info */}
      {vehicle && (
        <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center gap-3">
          <Car className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-xs text-gray-400">
              {vehicle.color} • {vehicle.plateNumber}
            </p>
          </div>
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
            {vehicle.type || 'Car'}
          </span>
        </div>
      )}

      {/* OTP */}
      {otp && (
        <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Ride OTP
            </span>
          </div>
          <div className="flex justify-center gap-2">
            {otp.split('').map((digit, i) => (
              <span
                key={i}
                className="w-12 h-14 bg-navy-900 border-2 border-accent rounded-xl flex items-center justify-center text-2xl font-bold text-accent"
              >
                {digit}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Share this OTP with your driver</p>
        </div>
      )}
    </div>
  );
};

export default DriverInfo;
