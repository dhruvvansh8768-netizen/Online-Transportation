import React from 'react';
import { MapPin, Clock, Calendar, Star, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getRideStatusInfo } from '../../utils/helpers';

/**
 * RideCard — displays ride information in a card format
 * Used in ride history lists and active ride views
 */
const RideCard = ({ ride, onClick, compact = false }) => {
  const statusInfo = getRideStatusInfo(ride?.status);

  if (!ride) return null;

  return (
    <div
      onClick={onClick}
      className={`
        bg-navy-800 border border-white/10 rounded-2xl p-4 transition-all duration-200
        hover:border-accent/30 hover:bg-navy-800/80 cursor-pointer
        ${compact ? '' : 'space-y-3'}
      `}
    >
      {/* Header — date and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(ride.createdAt)}</span>
          <span className="text-gray-600">•</span>
          <span>{formatTime(ride.createdAt)}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Pickup and Destination */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center mt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <div className="w-0.5 h-8 bg-white/10 my-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium text-white truncate">
              {ride.pickup?.address || 'Pickup Location'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate">
              {ride.destination?.address || 'Destination'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer — fare and details */}
      {!compact && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{ride.duration || '—'}</span>
            </div>
            {ride.rating && (
              <div className="flex items-center gap-1 text-sm text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{ride.rating}</span>
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-accent">
            {formatCurrency(ride.fare || ride.amount)}
          </p>
        </div>
      )}
    </div>
  );
};

export default RideCard;
