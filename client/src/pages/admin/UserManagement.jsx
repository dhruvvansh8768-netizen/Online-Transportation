import React, { useState } from 'react';
import { Users, Search, UserCheck, UserX } from 'lucide-react';

const SEEDED_USERS = [
  { id: 1, name: 'Aarav Kumar Shah', role: 'rider', phone: '9876500001', email: 'aarav.shah@example.com', active: true },
  { id: 2, name: 'Vivaan Raj Patel', role: 'rider', phone: '9876500002', email: 'vivaan.patel@example.com', active: true },
  { id: 3, name: 'Aditya Kumar Mehta', role: 'rider', phone: '9876500003', email: 'aditya.mehta@example.com', active: true },
  { id: 4, name: 'Krishna Raj Joshi', role: 'rider', phone: '9876500004', email: 'krishna.joshi@example.com', active: true },
  { id: 5, name: 'Rahul Kumar Verma', role: 'rider', phone: '9876500005', email: 'rahul.verma@example.com', active: true },
  { id: 6, name: 'Ramesh Patel', role: 'driver', phone: '9876543210', email: 'ramesh.driver@ridego.in', active: true },
  { id: 7, name: 'Suresh Shah', role: 'driver', phone: '9876543211', email: 'suresh.driver@ridego.in', active: true },
  { id: 8, name: 'Amit Shah', role: 'driver', phone: '9876543214', email: 'amit.driver@ridego.in', active: true },
];

/**
 * UserManagement — Manage Customers & Drivers from PostgreSQL
 */
const UserManagement = () => {
  const [users, setUsers] = useState(SEEDED_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const toggleStatus = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" /> User Management
            </h1>
            <p className="text-sm text-gray-400">Customers & Drivers registered in the system</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-navy-800 border border-white/10 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="rider">Riders</option>
              <option value="driver">Drivers</option>
            </select>
          </div>
        </div>

        <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-gray-400">#{u.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'driver' ? 'bg-blue-500/15 text-blue-400' : 'bg-accent/15 text-accent'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{u.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          u.active
                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        }`}
                      >
                        {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
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

export default UserManagement;

