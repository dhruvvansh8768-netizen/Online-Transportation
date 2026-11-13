import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Car, DollarSign, Activity, TrendingUp, Tag, ShieldCheck, BookOpen
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import adminService from '../../services/admin.service';
import { formatCurrency } from '../../utils/helpers';

const REVENUE_SERIES = [
  { date: 'Aug 01', revenue: 3200, rides: 18 },
  { date: 'Aug 02', revenue: 4100, rides: 22 },
  { date: 'Aug 03', revenue: 3850, rides: 20 },
  { date: 'Aug 04', revenue: 5120, rides: 27 },
  { date: 'Aug 05', revenue: 6400, rides: 33 },
  { date: 'Aug 06', revenue: 5900, rides: 30 },
  { date: 'Aug 07', revenue: 7250, rides: 38 },
];

/**
 * AdminDashboard — System-wide KPIs, revenue charts, and quick links to all 9 DBMS tables
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_riders: 10,
    total_drivers: 10,
    total_rides: 10,
    active_rides: 3,
    total_revenue: 35820,
    available_drivers: 8,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.data?.data?.stats) {
          setStats(res.data.data.stats);
        }
      } catch {
        // Use Lab-3 seeded fallback stats
      }
    };
    loadStats();
  }, []);

  const kpis = [
    { label: 'Total Customers', value: stats.total_riders, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15', link: '/admin/users' },
    { label: 'Registered Drivers', value: stats.total_drivers, icon: ShieldCheck, color: 'text-accent', bg: 'bg-accent/15', link: '/admin/vehicles' },
    { label: 'Total Bookings', value: stats.total_rides, icon: Car, color: 'text-purple-400', bg: 'bg-purple-500/15', link: '/admin/rides' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/15', link: '/admin/payments' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
            <p className="text-sm text-gray-400">Online Transportation Management • Ahmedabad Operations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/story-demo"
              className="px-4 py-2 rounded-xl bg-accent text-navy-900 text-xs font-bold flex items-center gap-1.5 hover:bg-accent-light transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Lab-2/3 Story & SQL View
            </Link>
            <Link
              to="/admin/promos"
              className="px-4 py-2 rounded-xl bg-navy-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 hover:border-accent/40"
            >
              <Tag className="w-4 h-4 text-accent" /> Manage Promos
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2 rounded-xl bg-navy-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 hover:border-accent/40"
            >
              <TrendingUp className="w-4 h-4 text-accent" /> Analytics
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={kpi.label}
                to={kpi.link}
                className="bg-navy-800 border border-white/10 hover:border-accent/40 rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{kpi.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-3 group-hover:text-accent transition-colors">
                  {kpi.value}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Revenue & Rides Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" /> Revenue Overview (Aug 2026)
              </h2>
              <span className="text-xs text-accent font-semibold">+18.4% growth</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_SERIES}>
                  <defs>
                    <linearGradient id="accentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d09c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00d09c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00d09c" strokeWidth={2.5} fill="url(#accentFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white mb-2">System Modules</h2>
            {[
              { title: 'User & Customer Table', desc: '10 Customers & 10 Drivers', to: '/admin/users' },
              { title: 'Booking & Ride Status', desc: 'Track Requested → Completed', to: '/admin/rides' },
              { title: 'Vehicles & Drivers', desc: 'GJ01 Fleet & Ratings', to: '/admin/vehicles' },
              { title: 'Payments Ledger', desc: 'UPI, Cards, Net Banking, Cash', to: '/admin/payments' },
              { title: 'Promo Codes', desc: 'WELCOME10, FIRST50, RIDE100', to: '/admin/promos' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block p-3.5 rounded-xl bg-navy-900/70 border border-white/5 hover:border-accent/40 transition-colors"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

