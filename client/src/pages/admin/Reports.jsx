import React from 'react';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

const VEHICLE_SHARE = [
  { name: 'Sedan (Swift Dzire / City)', value: 42 },
  { name: 'SUV (Innova / Ertiga / Creta)', value: 35 },
  { name: 'Hatchback (i20 / Baleno)', value: 23 },
];

const LOCALITY_DEMAND = [
  { area: 'Navrangpura', rides: 48 },
  { area: 'Bodakdev', rides: 39 },
  { area: 'Satellite', rides: 34 },
  { area: 'Vastrapur', rides: 42 },
  { area: 'Airport Hansol', rides: 51 },
  { area: 'Prahladnagar', rides: 31 },
];

const COLORS = ['#00d09c', '#3b82f6', '#a855f7'];

/**
 * Reports — Visual analytics by Ahmedabad locality & vehicle type
 */
const Reports = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" /> Reports & Analytics
          </h1>
          <p className="text-sm text-gray-400">Ahmedabad demand hotspots & fleet utilization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Popular Ahmedabad Localities</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LOCALITY_DEMAND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="area" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="rides" fill="#00d09c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-accent" /> Ride Type Distribution
            </h2>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VEHICLE_SHARE}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {VEHICLE_SHARE.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

