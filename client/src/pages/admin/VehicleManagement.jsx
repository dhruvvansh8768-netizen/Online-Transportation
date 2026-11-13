import React, { useState } from 'react';
import { Car, CheckCircle, XCircle } from 'lucide-react';

const SEEDED_VEHICLES = [
  { id: 1, code: 'VH001', model: 'Swift Dzire', type: 'Sedan', color: 'White', plate: 'GJ01AB1234', driver: 'Ramesh Patel', status: 'Approved' },
  { id: 2, code: 'VH002', model: 'Honda City', type: 'Sedan', color: 'Black', plate: 'GJ01CD2345', driver: 'Suresh Shah', status: 'Approved' },
  { id: 3, code: 'VH003', model: 'Hyundai i20', type: 'Hatchback', color: 'Blue', plate: 'GJ01EF3456', driver: 'Mahesh Kumar', status: 'Approved' },
  { id: 4, code: 'VH004', model: 'Toyota Innova', type: 'SUV', color: 'Silver', plate: 'GJ01GH4567', driver: 'Rajesh Patel', status: 'Approved' },
  { id: 5, code: 'VH005', model: 'Maruti Ertiga', type: 'SUV', color: 'White', plate: 'GJ01IJ5678', driver: 'Amit Shah', status: 'Pending' },
  { id: 6, code: 'VH006', model: 'Tata Nexon', type: 'SUV', color: 'Red', plate: 'GJ01KL6789', driver: 'Vijay Parmar', status: 'Approved' },
];

/**
 * VehicleManagement — Manage registered vehicles (VEHICLE table from Lab-3)
 */
const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState(SEEDED_VEHICLES);

  const updateStatus = (id, status) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-accent" /> Vehicle Fleet Management
          </h1>
          <p className="text-sm text-gray-400">All vehicles from the VEHICLE table with license plates & approval status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent bg-accent/15 px-2.5 py-1 rounded-lg">
                  {v.code}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  v.status === 'Approved'
                    ? 'bg-green-500/15 text-green-400'
                    : v.status === 'Rejected'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {v.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{v.model}</h3>
                <p className="text-xs text-gray-400">{v.type} • {v.color}</p>
              </div>

              <div className="bg-navy-900/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Plate: <strong className="text-white font-mono">{v.plate}</strong></span>
                <span className="text-gray-300">{v.driver}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(v.id, 'Approved')}
                  className="flex-1 py-2 rounded-xl bg-accent/15 text-accent hover:bg-accent/25 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => updateStatus(v.id, 'Rejected')}
                  className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;

