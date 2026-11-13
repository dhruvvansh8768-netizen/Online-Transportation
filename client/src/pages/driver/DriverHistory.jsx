import React from 'react';
import { Clock, MapPin, Star, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const DRIVER_TRIPS = [
  {
    id: 'BK-2026-001',
    date: '2026-08-01',
    time: '09:00 AM',
    rider: 'Rahul Kumar Patel',
    pickup: '25, MG Road, Navrangpura, Ahmedabad',
    drop: '10, Airport Road, Hansol, Ahmedabad',
    fare: 215,
    rating: 5,
    status: 'Ride Completed',
  },
  {
    id: 'BK-2026-004',
    date: '2026-08-04',
    time: '12:15 PM',
    rider: 'Krishna Raj Joshi',
    pickup: '404, Ashram Road, Usmanpura, Ahmedabad',
    drop: '505, University Road, Vastrapur, Ahmedabad',
    fare: 155,
    rating: 4,
    status: 'Ride Completed',
  },
  {
    id: 'BK-2026-008',
    date: '2026-08-08',
    time: '05:45 PM',
    rider: 'Riya Jay Shah',
    pickup: '808, Naroda Road, Naroda, Ahmedabad',
    drop: '909, Maninagar Road, Maninagar, Ahmedabad',
    fare: 260,
    rating: 5,
    status: 'Ride Completed',
  },
];

/**
 * DriverHistory — List of completed driver trips with earnings and ratings
 */
const DriverHistory = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" /> Driver Trip History
          </h1>
          <p className="text-sm text-gray-400">Completed rides and customer ratings</p>
        </div>

        <div className="space-y-3">
          {DRIVER_TRIPS.map((trip) => (
            <div key={trip.id} className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{trip.date}</span>
                  <span>•</span>
                  <span>{trip.time}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                  {trip.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" /> {trip.pickup}
                </p>
                <p className="text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" /> {trip.drop}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Rider: <strong className="text-white">{trip.rider}</strong></span>
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {trip.rating}.0
                  </span>
                </div>
                <span className="text-lg font-bold text-accent">{formatCurrency(trip.fare)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverHistory;

