import React, { useState } from 'react';
import { DollarSign, TrendingUp, Car, Calendar, ArrowDownToLine } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/helpers';

const WEEKLY_DATA = [
  { day: 'Mon', earnings: 1240, trips: 6 },
  { day: 'Tue', earnings: 1580, trips: 8 },
  { day: 'Wed', earnings: 1120, trips: 5 },
  { day: 'Thu', earnings: 1890, trips: 9 },
  { day: 'Fri', earnings: 2240, trips: 11 },
  { day: 'Sat', earnings: 2650, trips: 13 },
  { day: 'Sun', earnings: 1480, trips: 7 },
];

/**
 * DriverEarnings — Daily/weekly earnings breakdown with Recharts bar chart
 */
const DriverEarnings = () => {
  const [period, setPeriod] = useState('weekly');
  const [withdrawn, setWithdrawn] = useState(false);

  const totalWeekly = WEEKLY_DATA.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = WEEKLY_DATA.reduce((sum, d) => sum + d.trips, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Driver Earnings</h1>
            <p className="text-sm text-gray-400">Track your payouts, incentives, and daily trips</p>
          </div>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize ${
                  period === p ? 'bg-accent text-navy-900' : 'bg-navy-800 text-gray-300 border border-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>{period === 'daily' ? "Today's Earnings" : period === 'monthly' ? 'Monthly Total' : 'This Week'}</span>
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent mt-2">
              {formatCurrency(period === 'daily' ? 1480 : period === 'monthly' ? 48600 : totalWeekly)}
            </p>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last {period}
            </p>
          </div>

          <div className="bg-navy-800 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Completed Trips</span>
              <Car className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {period === 'daily' ? 7 : period === 'monthly' ? 236 : totalTrips}
            </p>
            <p className="text-xs text-gray-400 mt-1">98% acceptance rate</p>
          </div>

          <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Available Payout</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{withdrawn ? '₹0.00' : formatCurrency(4250)}</p>
            <Button
              size="sm"
              className="mt-3"
              icon={ArrowDownToLine}
              disabled={withdrawn}
              onClick={() => setWithdrawn(true)}
            >
              {withdrawn ? 'Payout Requested' : 'Withdraw to Bank'}
            </Button>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Weekly Revenue Breakdown</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="earnings" fill="#00d09c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;

