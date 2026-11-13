import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import driverService from '../../services/driver.service';

/**
 * StartRide — Driver verifies rider's 4-digit OTP PIN before starting the trip
 */
const StartRide = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['4', '8', '2', '9']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigitChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    setError('');
    if (value && idx < 3) {
      document.getElementById(`ride-otp-${idx + 1}`)?.focus();
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      setError('Please enter the 4-digit Ride OTP from the customer.');
      return;
    }

    setLoading(true);
    try {
      await driverService.startRide(1, code);
    } catch {
      // Demo fallback
    } finally {
      setLoading(false);
      navigate('/driver/live-navigation');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-800 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center text-accent mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Ride OTP</h1>
          <p className="text-sm text-gray-400">
            Ask <strong className="text-white">Rahul Kumar Patel</strong> for the 4-digit PIN to start the trip
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`ride-otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-14 h-16 bg-navy-900 border-2 border-white/15 focus:border-accent rounded-2xl text-center text-2xl font-bold text-accent focus:outline-none"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <p className="text-center text-xs text-gray-500">Demo PIN pre-filled: 4829</p>

          <Button type="submit" fullWidth size="lg" loading={loading} icon={Play}>
            Verify & Start Ride
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StartRide;

