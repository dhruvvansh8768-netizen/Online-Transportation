import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Wallet, Banknote, Smartphone, Tag,
  ShieldCheck, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import FareEstimate from '../../components/ride/FareEstimate';
import Button from '../../components/common/Button';
import { RideContext } from '../../context/RideContext';
import { formatCurrency } from '../../utils/helpers';

const PAYMENT_OPTIONS = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', subtitle: 'Instant & zero fee', icon: Smartphone },
  { id: 'credit_card', label: 'Credit Card', subtitle: 'HDFC Visa •••• 4829', icon: CreditCard },
  { id: 'debit_card', label: 'Debit Card', subtitle: 'SBI RuPay •••• 9104', icon: CreditCard },
  { id: 'net_banking', label: 'Net Banking', subtitle: 'ICICI / SBI / HDFC', icon: Wallet },
  { id: 'wallet', label: 'RideGo Wallet', subtitle: 'Balance: ₹480.00', icon: Wallet },
  { id: 'cash', label: 'Cash', subtitle: 'Pay directly to driver', icon: Banknote },
];

const DEMO_PROMOS = {
  WELCOME10: { discount: 10, expiry: '2026-12-31' },
  RIDE20: { discount: 20, expiry: '2026-10-31' },
  FIRST50: { discount: 50, expiry: '2026-09-30' },
  SAVE15: { discount: 15, expiry: '2026-11-30' },
  FESTIVE25: { discount: 25, expiry: '2026-10-15' },
  RIDE100: { discount: 100, expiry: '2026-12-31' },
};

/**
 * ConfirmBooking — Final booking summary, promo code, payment selector, and Book CTA
 */
const ConfirmBooking = () => {
  const navigate = useNavigate();
  const {
    pickupAddress,
    destinationAddress,
    selectedVehicle,
    fareEstimate,
    promoCode,
    setPromoCode,
    paymentMethod,
    setPaymentMethod,
    bookRide,
    setActiveRide,
    setRideStatus,
  } = useContext(RideContext);

  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [promoStatus, setPromoStatus] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [passengers, setPassengers] = useState(2);
  const [contactNo, setContactNo] = useState('9876500005');
  const [bookingLoading, setBookingLoading] = useState(false);

  const estimate = fareEstimate || {
    baseFare: 35,
    distanceFare: 68,
    timeFare: 18,
    surcharge: 0,
    discount,
    tax: 6,
    total: Math.max(20, 127 - discount),
    distance: '5.4 km',
    duration: '16 min',
  };

  const finalEstimate = {
    ...estimate,
    discount,
    total: Math.max(20, (estimate.baseFare + estimate.distanceFare + estimate.timeFare + (estimate.tax || 0)) - discount),
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (DEMO_PROMOS[code]) {
      const promo = DEMO_PROMOS[code];
      setDiscount(promo.discount);
      setPromoCode(code);
      setPromoStatus({
        ok: true,
        msg: `Applied ${code}! Discount: ${formatCurrency(promo.discount)} (Valid till ${promo.expiry})`,
      });
    } else {
      setDiscount(0);
      setPromoStatus({ ok: false, msg: 'Invalid code. Try WELCOME10, FIRST50 or RIDE100' });
    }
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    try {
      await bookRide();
      navigate('/rider/finding-driver');
    } catch {
      // Fallback to interactive demo ride if backend isn't running yet
      setActiveRide({
        _id: `RIDE-${Math.floor(100000 + Math.random() * 900000)}`,
        pickup: { address: pickupAddress || 'MG Road, Bengaluru' },
        destination: { address: destinationAddress || 'Koramangala 4th Block' },
        vehicleType: selectedVehicle?.type || 'auto',
        fare: finalEstimate.total,
        distance: finalEstimate.distance,
        duration: finalEstimate.duration,
        paymentMethod,
        otp: String(Math.floor(1000 + Math.random() * 9000)),
        status: 'searching',
      });
      setRideStatus('searching');
      navigate('/rider/finding-driver');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-navy-800 border border-white/10 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Confirm Your Ride</h1>
            <p className="text-xs text-gray-400">
              {selectedVehicle?.name || 'Auto'} • {finalEstimate.distance} • {finalEstimate.duration}
            </p>
          </div>
        </div>

        {/* Route Card */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="flex flex-col items-center mt-1.5">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-0.5 h-8 bg-white/15 my-1" />
            <div className="w-3 h-3 rounded-sm bg-red-400" />
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400">Pickup</p>
              <p className="text-sm font-medium text-white truncate">
                {pickupAddress || 'Current Location (GPS)'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400">Drop-off</p>
              <p className="text-sm font-medium text-white truncate">
                {destinationAddress || 'Koramangala 4th Block'}
              </p>
            </div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <FareEstimate estimate={finalEstimate} />

        {/* Booking Details (Lab-2: No. of Passengers & Contact No) */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Number of Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} className="bg-navy-900">
                  {n} {n === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Ride Contact Number</label>
            <input
              type="tel"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder="9876500005"
              className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" /> Apply Promo Code
            </h3>
            <span className="text-xs text-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Try: FIRST50
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />
            <Button variant="outline" onClick={handleApplyPromo}>
              Apply
            </Button>
          </div>
          {promoStatus && (
            <p className={`text-xs flex items-center gap-1.5 ${promoStatus.ok ? 'text-accent' : 'text-red-400'}`}>
              {promoStatus.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {promoStatus.msg}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Payment Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = paymentMethod === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-accent bg-accent/10'
                      : 'border-white/10 bg-navy-900/50 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selected ? 'text-accent' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{opt.label}</p>
                    <p className="text-xs text-gray-400 truncate">{opt.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Notice & Confirm CTA */}
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Free cancellation within 2 minutes of driver assignment
        </div>

        <Button fullWidth size="lg" loading={bookingLoading} onClick={handleConfirmBooking}>
          Confirm & Book Ride • {formatCurrency(finalEstimate.total)}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmBooking;
