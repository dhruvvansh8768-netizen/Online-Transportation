import React, { useState } from 'react';
import { Car, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const SEEDED_BOOKINGS = [
  { id: 21, date: '2026-08-01', time: '09:00:00', customer: 'Aarav Kumar Shah', driver: 'Ramesh Patel', type: 'Sedan', passengers: 2, pickup: 'CG Road, Navrangpura', drop: 'SG Highway, Bodakdev', status: 'Ride Completed', fare: 185 },
  { id: 22, date: '2026-08-02', time: '10:30:00', customer: 'Vivaan Raj Patel', driver: 'Suresh Shah', type: 'SUV', passengers: 4, pickup: 'SG Highway, Bodakdev', drop: 'Ring Road, Satellite', status: 'Ride Completed', fare: 240 },
  { id: 23, date: '2026-08-03', time: '11:00:00', customer: 'Aditya Kumar Mehta', driver: 'Mahesh Kumar', type: 'Hatchback', passengers: 1, pickup: 'Ring Road, Satellite', drop: 'Ashram Road, Usmanpura', status: 'Cancelled', fare: 0 },
  { id: 24, date: '2026-08-04', time: '12:15:00', customer: 'Krishna Raj Joshi', driver: 'Rajesh Patel', type: 'SUV', passengers: 5, pickup: 'Ashram Road, Usmanpura', drop: 'University Road, Vastrapur', status: 'Ride Completed', fare: 210 },
  { id: 25, date: '2026-08-05', time: '14:00:00', customer: 'Rahul Kumar Verma', driver: 'Amit Shah', type: 'Sedan', passengers: 3, pickup: 'University Road, Vastrapur', drop: 'Prahladnagar Road', status: 'In Progress', fare: 165 },
];

/**
 * RideManagement — Monitor all BOOKING records and RIDESTATUS transitions
 */
const RideManagement = () => {
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = SEEDED_BOOKINGS.filter(
    (b) => statusFilter === 'All' || b.status === statusFilter
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-accent" /> Ride & Booking Management
            </h1>
            <p className="text-sm text-gray-400">Live view of BOOKING & RIDESTATUS tables</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {['All', 'Ride Completed', 'In Progress', 'Cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  statusFilter === s ? 'bg-accent text-navy-900' : 'bg-navy-800 text-gray-300 border border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3.5">Booking ID</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Driver & Type</th>
                  <th className="px-4 py-3.5">Route (Ahmedabad)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 font-mono text-accent">#{b.id}</td>
                    <td className="px-4 py-4 text-xs text-gray-300">
                      <p>{b.date}</p>
                      <p className="text-gray-500">{b.time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{b.customer}</p>
                      <p className="text-xs text-gray-400">{b.passengers} passengers</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white">{b.driver}</p>
                      <p className="text-xs text-gray-400">{b.type}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-300">
                      <p className="text-accent">{b.pickup}</p>
                      <p className="text-gray-400">→ {b.drop}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'Ride Completed'
                          ? 'bg-green-500/15 text-green-400'
                          : b.status === 'Cancelled'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white">
                      {formatCurrency(b.fare)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideManagement;

