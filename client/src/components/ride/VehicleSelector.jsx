import React from 'react';
import { Car, Bike, Truck, Zap, Users, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/**
 * VehicleSelector — vehicle type selection cards for ride booking
 */

// Vehicle type configurations
const vehicleTypes = [
  {
    type: 'bike',
    name: 'Bike',
    icon: Bike,
    description: 'Quick & affordable',
    capacity: '1 rider',
    eta: '2 min',
    multiplier: 1,
  },
  {
    type: 'auto',
    name: 'Auto',
    icon: Truck,
    description: 'Comfortable 3-wheeler',
    capacity: '3 riders',
    eta: '3 min',
    multiplier: 1.3,
  },
  {
    type: 'mini',
    name: 'Mini',
    icon: Car,
    description: 'Compact car',
    capacity: '4 riders',
    eta: '4 min',
    multiplier: 1.5,
  },
  {
    type: 'sedan',
    name: 'Sedan',
    icon: Car,
    description: 'Spacious & comfy',
    capacity: '4 riders',
    eta: '5 min',
    multiplier: 2,
  },
  {
    type: 'suv',
    name: 'SUV',
    icon: Truck,
    description: 'Premium ride',
    capacity: '6 riders',
    eta: '6 min',
    multiplier: 2.5,
  },
  {
    type: 'electric',
    name: 'Electric',
    icon: Zap,
    description: 'Eco-friendly',
    capacity: '4 riders',
    eta: '7 min',
    multiplier: 1.8,
  },
];

const VehicleSelector = ({
  selectedType,
  onSelect,
  baseFare = 50,
  className = '',
  availableTypes = null,
}) => {
  // Filter to only available types, or show all
  const vehicles = availableTypes
    ? vehicleTypes.filter((v) => availableTypes.includes(v.type))
    : vehicleTypes;

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Car className="w-5 h-5 text-accent" />
        Choose your ride
      </h3>

      <div className="space-y-2">
        {vehicles.map((vehicle) => {
          const Icon = vehicle.icon;
          const isSelected = selectedType === vehicle.type;
          const estimatedFare = Math.round(baseFare * vehicle.multiplier);

          return (
            <button
              key={vehicle.type}
              onClick={() => onSelect(vehicle)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                    : 'border-white/10 bg-navy-800 hover:border-white/20 hover:bg-navy-800/80'
                }
              `}
            >
              {/* Vehicle icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-accent/20' : 'bg-white/5'
                }`}
              >
                <Icon
                  className={`w-7 h-7 ${isSelected ? 'text-accent' : 'text-gray-400'}`}
                />
              </div>

              {/* Vehicle info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${isSelected ? 'text-accent' : 'text-white'}`}>
                    {vehicle.name}
                  </h4>
                  {vehicle.type === 'electric' && (
                    <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                      ECO
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{vehicle.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {vehicle.capacity}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {vehicle.eta}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${isSelected ? 'text-accent' : 'text-white'}`}>
                  {formatCurrency(estimatedFare)}
                </p>
                <p className="text-[10px] text-gray-500">est. fare</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleSelector;
