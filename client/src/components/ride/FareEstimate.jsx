import React from 'react';
import { Receipt, Percent, CreditCard, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/**
 * FareEstimate — displays a breakdown of the ride fare
 */
const FareEstimate = ({ estimate, className = '' }) => {
  if (!estimate) return null;

  const {
    baseFare = 0,
    distanceFare = 0,
    timeFare = 0,
    surcharge = 0,
    discount = 0,
    tax = 0,
    total = 0,
    distance,
    duration,
  } = estimate;

  const fareItems = [
    { label: 'Base Fare', value: baseFare, icon: Receipt },
    { label: 'Distance Fare', value: distanceFare, icon: Receipt },
    { label: 'Time Fare', value: timeFare, icon: Receipt },
    ...(surcharge > 0 ? [{ label: 'Surge Pricing', value: surcharge, icon: Info, highlight: true }] : []),
    ...(discount > 0 ? [{ label: 'Promo Discount', value: -discount, icon: Percent, isDiscount: true }] : []),
    ...(tax > 0 ? [{ label: 'Tax & Fees', value: tax, icon: CreditCard }] : []),
  ];

  return (
    <div className={`bg-navy-800 border border-white/10 rounded-2xl p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-accent" />
        Fare Breakdown
      </h3>

      {/* Trip info */}
      {(distance || duration) && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-xl">
          {distance && (
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="text-sm font-semibold text-white">{distance}</p>
            </div>
          )}
          {duration && (
            <div className="text-center flex-1 border-l border-white/10">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-semibold text-white">{duration}</p>
            </div>
          )}
        </div>
      )}

      {/* Fare line items */}
      <div className="space-y-3">
        {fareItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.isDiscount ? 'text-green-400' : 'text-gray-400'}`} />
                <span className={`text-sm ${item.highlight ? 'text-orange-400' : item.isDiscount ? 'text-green-400' : 'text-gray-300'}`}>
                  {item.label}
                </span>
              </div>
              <span className={`text-sm font-medium ${item.isDiscount ? 'text-green-400' : 'text-white'}`}>
                {item.isDiscount ? `- ${formatCurrency(Math.abs(item.value))}` : formatCurrency(item.value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-4" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">Total Fare</span>
        <span className="text-xl font-bold text-accent">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default FareEstimate;
