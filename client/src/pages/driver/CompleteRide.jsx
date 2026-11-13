import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, Receipt, Clock, Route, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import driverService from '../../services/driver.service';
import { formatCurrency } from '../../utils/helpers';

/**
 * CompleteRide — End ride summary, earnings collected, and rider rating
 */
const CompleteRide = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await driverService.completeRide(1);
      await driverService.rateRider(1, { rating });
    } catch {
      // Demo fallback
    } finally {
      setLoading(false);
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-800 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-accent" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Trip Completed!</h1>
          <p className="text-sm text-gray-400 mt-1">Status updated to <span className="text-accent font-semibold">Ride Completed</span></p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-navy-900/80 rounded-xl p-3">
            <Receipt className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-[11px] text-gray-400">Fare Earned</p>
            <p className="text-base font-bold text-accent">{formatCurrency(185)}</p>
          </div>
          <div className="bg-navy-900/80 rounded-xl p-3">
            <Route className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-[11px] text-gray-400">Distance</p>
            <p className="text-base font-bold text-white">9.4 km</p>
          </div>
          <div className="bg-navy-900/80 rounded-xl p-3">
            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-[11px] text-gray-400">Duration</p>
            <p className="text-base font-bold text-white">22 min</p>
          </div>
        </div>

        <div className="bg-navy-900/60 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-white">Rate Customer (Rahul Kumar Patel)</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)} className="p-1">
                <Star className={`w-8 h-8 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" loading={loading} iconRight={ArrowRight} onClick={handleFinish}>
          Back to Driver Home
        </Button>
      </div>
    </div>
  );
};

export default CompleteRide;

