import React, { useState } from 'react';
import { History, Filter, Search, MapPin, Star, Calendar, Download } from 'lucide-react';
import RideCard from '../../components/ride/RideCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate, getRideStatusInfo } from '../../utils/helpers';

// Sample rides matching Lab-2 & Lab-3 Ahmedabad story
const DEMO_RIDES = [
  {
    _id: 'BK-2026-001',
    createdAt: '2026-08-01T09:00:00',
    status: 'completed',
    pickup: { address: '25, MG Road, Navrangpura, Ahmedabad (380009)' },
    destination: { address: '10, Airport Road, Hansol, Ahmedabad (382475)' },
    duration: '22 min',
    distance: '9.4 km',
    fare: 215,
    rating: 5,
    vehicle: 'Swift Dzire (GJ01AB1234)',
    driverName: 'Ramesh Patel',
    paymentMode: 'UPI',
    promoCode: 'WELCOME10',
  },
  {
    _id: 'BK-2026-002',
    createdAt: '2026-08-02T10:30:00',
    status: 'cancelled',
    pickup: { address: '202, SG Highway, Bodakdev, Ahmedabad (380054)' },
    destination: { address: '303, Ring Road, Satellite, Ahmedabad (380015)' },
    duration: '—',
    distance: '4.1 km',
    fare: 0,
    vehicle: 'Honda City (GJ01CD2345)',
    driverName: 'Suresh Shah',
    paymentMode: 'Debit Card',
    promoCode: 'RIDE20',
  },
  {
    _id: 'BK-2026-003',
    createdAt: '2026-08-05T14:00:00',
    status: 'completed',
    pickup: { address: '505, University Road, Vastrapur, Ahmedabad (380052)' },
    destination: { address: '606, Prahladnagar Road, Ahmedabad (380015)' },
    duration: '15 min',
    distance: '5.2 km',
    fare: 140,
    rating: 5,
    vehicle: 'Maruti Ertiga (GJ01IJ5678)',
    driverName: 'Amit Shah',
    paymentMode: 'Google Pay',
    promoCode: 'FESTIVE25',
  },
];

/**
 * RideHistory — Filterable list of past bookings with receipt modal
 */
const RideHistory = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);

  const filteredRides = DEMO_RIDES.filter((ride) => {
    const matchesStatus = filter === 'all' || ride.status === filter;
    const matchesSearch =
      !search ||
      ride.pickup?.address?.toLowerCase().includes(search.toLowerCase()) ||
      ride.destination?.address?.toLowerCase().includes(search.toLowerCase()) ||
      ride.driverName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-accent" /> Ride History
            </h1>
            <p className="text-sm text-gray-400">Your past trips, receipts & booking statuses</p>
          </div>

          <div className="flex items-center gap-2 bg-navy-800 border border-white/10 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location or driver..."
              className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {['all', 'completed', 'cancelled', 'in-progress'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === status
                  ? 'bg-accent text-navy-900'
                  : 'bg-navy-800 text-gray-300 border border-white/10 hover:border-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Rides List */}
        <div className="space-y-3">
          {filteredRides.map((ride) => (
            <RideCard key={ride._id || ride.ride_id} ride={ride} onClick={() => setSelectedRide(ride)} />
          ))}

          {filteredRides.length === 0 && (
            <div className="bg-navy-800 border border-white/10 rounded-2xl p-10 text-center text-gray-400">
              No rides match your filter.
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        title={`Booking Receipt • ${selectedRide?._id || ''}`}
      >
        {selectedRide && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formatDate(selectedRide.createdAt)}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRideStatusInfo(selectedRide.status).bg} ${getRideStatusInfo(selectedRide.status).color}`}>
                {getRideStatusInfo(selectedRide.status).label}
              </span>
            </div>

            <div className="bg-navy-900 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-400">Pickup</p>
              <p className="text-white font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                {selectedRide.pickup?.address}
              </p>
              <p className="text-xs text-gray-400 pt-2">Drop-off</p>
              <p className="text-white font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                {selectedRide.destination?.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-navy-900 rounded-xl p-3">
                <p className="text-gray-400">Driver</p>
                <p className="text-white font-semibold mt-0.5">{selectedRide.driverName || 'Ramesh Patel'}</p>
              </div>
              <div className="bg-navy-900 rounded-xl p-3">
                <p className="text-gray-400">Vehicle</p>
                <p className="text-white font-semibold mt-0.5">{selectedRide.vehicle || 'Swift Dzire'}</p>
              </div>
              <div className="bg-navy-900 rounded-xl p-3">
                <p className="text-gray-400">Payment Mode</p>
                <p className="text-white font-semibold mt-0.5">{selectedRide.paymentMode || 'UPI'}</p>
              </div>
              <div className="bg-navy-900 rounded-xl p-3">
                <p className="text-gray-400">Total Fare</p>
                <p className="text-accent font-bold text-base mt-0.5">{formatCurrency(selectedRide.fare)}</p>
              </div>
            </div>

            {selectedRide.rating && (
              <div className="flex items-center justify-between bg-navy-900 rounded-xl p-3">
                <span className="text-gray-400 text-xs">Your Rating</span>
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Star className="w-4 h-4 fill-current" /> {selectedRide.rating}.0 / 5
                </span>
              </div>
            )}

            <Button fullWidth icon={Download} onClick={() => window.print()}>
              Download / Print Receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RideHistory;

