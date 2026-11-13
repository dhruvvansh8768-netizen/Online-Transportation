import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Trash2, Save, CheckCircle, Home, Briefcase } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

/**
 * RiderProfile — Customer profile with structured First/Middle/Last name & saved Ahmedabad addresses
 */
const RiderProfile = () => {
  const { user } = useAuth();

  const fullNameParts = (user?.name || user?.full_name || 'Rahul Kumar Patel').split(' ');
  const [form, setForm] = useState({
    firstName: fullNameParts[0] || 'Rahul',
    middleName: fullNameParts.length === 3 ? fullNameParts[1] : 'Kumar',
    lastName: fullNameParts[fullNameParts.length - 1] || 'Patel',
    email: user?.email || 'rahul.patel@adaniuni.ac.in',
    phone: user?.phone || '9876500005',
  });

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', full: '25, MG Road, Navrangpura, Ahmedabad, Gujarat - 380009, India' },
    { id: 2, label: 'University', full: '505, University Road, Vastrapur, Ahmedabad, Gujarat - 380052, India' },
  ]);
  const [newAddress, setNewAddress] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    setAddresses((prev) => [...prev, { id: Date.now(), label: 'Saved', full: newAddress.trim() }]);
    setNewAddress('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Hero */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-2xl font-bold text-accent">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {form.firstName} {form.middleName} {form.lastName}
            </h1>
            <p className="text-sm text-gray-400">{form.email} • Verified Rider</p>
          </div>
        </div>

        {/* Customer Details Form */}
        <form onSubmit={handleSave} className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-accent" /> Customer Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Middle Name"
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={form.email}
            disabled
            helperText="Email cannot be changed"
          />

          <Input
            label="Contact Number"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          {savedToast && (
            <div className="p-3 rounded-xl bg-accent/15 text-accent text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          <Button type="submit" icon={Save}>
            Save Changes
          </Button>
        </form>

        {/* Saved Locations */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" /> Saved Locations
          </h2>

          <div className="space-y-2.5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-navy-900/70 border border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {addr.label === 'Home' ? (
                    <Home className="w-4 h-4 text-accent flex-shrink-0" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-accent">{addr.label}</p>
                    <p className="text-sm text-gray-200 truncate">{addr.full}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Add address (House No, Street, Locality, Ahmedabad)"
              className="flex-1 bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />
            <Button variant="outline" icon={Plus} onClick={handleAddAddress}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;

