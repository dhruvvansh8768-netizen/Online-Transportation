import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Star, Receipt, Clock, Route, Calendar,
  CreditCard, Sparkles, ArrowRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import { RideContext } from '../../context/RideContext';
import { formatCurrency } from '../../utils/helpers';

/**
 * RideCompleted — Actual fare/distance/duration summary + Payment confirmation + 1-5 Star Customer Feedback
 */
const RideCompleted = () => {
  const navigate = useNavigate();
  const { activeRide, rateRide, resetRide, paymentMethod } = useContext(RideContext);

  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('Excellent ride and friendly driver!');
  const [tip, setTip] = useState(0);
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const baseTotal = activeRide?.finalFare || activeRide?.fare || 185;
  const totalWithTip = baseTotal + tip;
  const feedbackDate = new Date().toISOString().split('T')[0];

  const handlePayNow = () => {
    setPaid(true);
  };

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    try {
      if (activeRide?._id) {
        await rateRide(activeRide._id, rating, review);
      }
    } catch {
      // Demo fallback
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        resetRide();
        navigate('/rider');
      }, 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Completion Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">Ride Completed!</h1>
          <p className="text-sm text-gray-400">
            Thank you for riding with RideGo • Status: <span className="text-accent font-semibold">Completed</span>
          </p>
        </div>

        {/* Actual Trip Metrics */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-navy-900/80 rounded-xl p-3">
              <Receipt className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Actual Fare</p>
              <p className="text-base font-bold text-accent">{formatCurrency(totalWithTip)}</p>
            </div>
            <div className="bg-navy-900/80 rounded-xl p-3">
              <Route className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Actual Distance</p>
              <p className="text-base font-bold text-white">{activeRide?.actualDistance || '9.4 km'}</p>
            </div>
            <div className="bg-navy-900/80 rounded-xl p-3">
              <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Ride Duration</p>
              <p className="text-base font-bold text-white">{activeRide?.actualDuration || '22 min'}</p>
            </div>
          </div>

          {/* Tip Driver */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Add a tip for {activeRide?.driver?.name || 'Ramesh Patel'}?</p>
            <div className="flex gap-2">
              {[0, 10, 20, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTip(amt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    tip === amt
                      ? 'bg-accent text-navy-900 border-accent'
                      : 'bg-navy-900 text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  {amt === 0 ? 'No Tip' : `+₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>Mode: <strong className="uppercase text-white">{paymentMethod || 'UPI'}</strong></span>
            </div>
            {paid ? (
              <span className="px-3 py-1.5 rounded-xl bg-green-500/15 text-green-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Paid {formatCurrency(totalWithTip)}
              </span>
            ) : (
              <Button size="sm" onClick={handlePayNow}>
                Pay {formatCurrency(totalWithTip)}
              </Button>
            )}
          </div>
        </div>

        {/* Customer Feedback Section */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Customer Feedback
            </h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {feedbackDate}
            </span>
          </div>

          {/* 1-5 Star Rating */}
          <div className="flex justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoveredStar || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 ${
                      active ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-accent font-medium">
            {rating === 5 ? 'Excellent Ride!' : rating === 4 ? 'Good Experience' : rating === 3 ? 'Average' : 'Needs Improvement'}
          </p>

          <textarea
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your feedback about the driver & vehicle..."
            className="w-full bg-navy-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          />

          {submitted ? (
            <div className="p-3 rounded-xl bg-accent/15 text-accent text-center text-sm font-semibold">
              Feedback saved! Redirecting to home...
            </div>
          ) : (
            <Button
              fullWidth
              size="lg"
              loading={submitting}
              iconRight={ArrowRight}
              onClick={handleSubmitFeedback}
            >
              Submit Rating & Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideCompleted;

