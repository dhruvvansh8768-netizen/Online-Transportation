import React, { useState } from 'react';
import { User, Phone, Car, Award, Star, Save, CheckCircle, Hash, Palette } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

/**
 * DriverProfile — Driver & Vehicle details aligned with Lab-3 DRIVER & VEHICLE tables
 */
const DriverProfile = () => {
  const { user } = useAuth();

  const [driverForm, setDriverForm] = useState({
    driverName: user?.name || user?.full_name || 'Ramesh Patel',
    contactNo: user?.phone || '9876543210',
    yearsOfExperience: '8',
    rating: '4.80',
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleCode: 'VH001',
    vehicleType: 'Sedan',
    vehicleModel: 'Swift Dzire',
    vehicleColor: 'White',
    licensePlateNo: 'GJ01AB1234',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent">
              {driverForm.driverName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{driverForm.driverName}</h1>
              <p className="text-sm text-gray-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" /> {driverForm.rating}
                </span>
                <span>•</span>
                <span>{driverForm.yearsOfExperience} Years Experience</span>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-accent/15 text-accent text-xs font-mono font-bold">
            {vehicleForm.vehicleCode}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Driver Table Info */}
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-accent" /> Driver Information
            </h2>
            <Input
              label="Driver Name"
              icon={User}
              value={driverForm.driverName}
              onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Driver Contact No"
                icon={Phone}
                value={driverForm.contactNo}
                onChange={(e) => setDriverForm({ ...driverForm, contactNo: e.target.value })}
              />
              <Input
                label="Years of Experience"
                type="number"
                icon={Award}
                value={driverForm.yearsOfExperience}
                onChange={(e) => setDriverForm({ ...driverForm, yearsOfExperience: e.target.value })}
              />
            </div>
          </div>

          {/* Vehicle Table Info */}
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-accent" /> Assigned Vehicle Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vehicle Code"
                value={vehicleForm.vehicleCode}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleCode: e.target.value })}
              />
              <Input
                label="Vehicle Type"
                value={vehicleForm.vehicleType}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
              />
              <Input
                label="Vehicle Model"
                value={vehicleForm.vehicleModel}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleModel: e.target.value })}
              />
              <Input
                label="Vehicle Color"
                icon={Palette}
                value={vehicleForm.vehicleColor}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleColor: e.target.value })}
              />
            </div>
            <Input
              label="License Plate Number"
              icon={Hash}
              value={vehicleForm.licensePlateNo}
              onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlateNo: e.target.value })}
            />
          </div>

          {saved && (
            <div className="p-3 rounded-xl bg-accent/15 text-accent text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Driver & Vehicle profile updated!
            </div>
          )}

          <Button type="submit" fullWidth size="lg" icon={Save}>
            Save Profile & Vehicle
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DriverProfile;

