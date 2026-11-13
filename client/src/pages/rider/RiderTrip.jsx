import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { RideContext } from '../../context/RideContext';
import rideService from '../../services/ride.service';
import paymentService from '../../services/payment.service';
import { ErrorNotice, Loading, Panel, Workspace, money, messageFor } from '../../components/common/Workspace';
import { JourneyMap, JourneySteps, RouteSummary, ridePoint } from '../../components/ride/Journey';
import { riderRidePath } from './RiderBooking';

const stages = ['Matching', 'Pickup', 'On trip', 'Payment', 'Rating'];
const titles = { requested: 'Finding a driver', accepted: 'Meet your driver', arriving: 'Your driver is on the way', in_progress: 'Ride in progress', cancelled: 'Ride cancelled' };
const indexes = { requested: 0, accepted: 1, arriving: 1, in_progress: 2, cancelled: 0 };

export default function RiderTrip() {
  const { token } = useAuth();
  const { activeRide, setActiveRide, resetRide } = useContext(RideContext);
  const demo = token === 'demo-token';
  const { search } = useLocation();
  const rideId = new URLSearchParams(search).get('ride');
  const current = useTrip(rideId || activeRide?.ride_id, !demo);
  const trip = demo ? activeRide : current.ride || (!rideId || String(activeRide?.ride_id) === rideId ? activeRide : null);
  const navigate = useNavigate();
  const [method, setMethod] = useState('upi');
  const [paid, setPaid] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip?.ride_id && !activeRide) setActiveRide(trip);
  }, [trip, activeRide, setActiveRide]);

  useEffect(() => {
    if (trip?.status && trip.status !== 'cancelled') navigate(riderRidePath(trip.status) + (!demo ? '?ride=' + trip.ride_id : ''), { replace: true });
  }, [trip?.status, trip?.ride_id, demo, navigate]);

  useEffect(() => {
    if (demo || trip?.status !== 'completed') return;
    let active = true;
    paymentService.getHistory().then(({ data }) => {
      if (active && data.data.payments.some((payment) => payment.ride_id === trip.ride_id && payment.payment_status === 'completed')) setPaid(true);
    }).catch(() => {});
    return () => { active = false; };
  }, [demo, trip?.status, trip?.ride_id]);

  useEffect(() => {
    if (!demo || trip?.status !== 'requested') return;
    const timer = setTimeout(() => setActiveRide({ ...trip, status: 'accepted' }), 2600);
    return () => clearTimeout(timer);
  }, [demo, trip, setActiveRide]);

  if (!trip) {
    return <Workspace title="Your ride"><Panel>
      {current.error ? <ErrorNotice>{current.error}</ErrorNotice> : !demo && !current.ready ? <Loading /> : <p>No active ride.</p>}
      <Link className="rg-link rg-secondary" to="/rider">Back to booking</Link>
    </Panel></Workspace>;
  }

  const completed = trip.status === 'completed';
  const leave = () => { resetRide(); navigate('/rider'); };
  const perform = async (action) => {
    setBusy(true);
    setError('');
    try { await action(); } catch (err) { setError(messageFor(err)); } finally { setBusy(false); }
  };

  return (
    <Workspace title={completed ? paid ? 'Rate your ride' : 'Trip complete' : titles[trip.status]} description={demo ? 'Demo ride' : 'Ride #' + trip.ride_id}>
      <div className="rg-map-layout">
        <JourneyMap pickup={ridePoint(trip, 'pickup')} dropoff={ridePoint(trip, 'drop')} driver={ridePoint(trip, 'driver')} />
        <Panel className="rg-ride-sheet">
          <JourneySteps stages={stages} current={completed ? paid ? 4 : 3 : indexes[trip.status]} />
          <ErrorNotice>{error || current.error}</ErrorNotice>
          <RouteSummary pickup={trip.pickup_address} dropoff={trip.drop_address} />
          <dl className="rg-definition"><div><dt>{completed ? 'Final fare' : 'Fare'}</dt><dd>{money(trip.fare)}</dd></div>
            {trip.driver_name && trip.status !== 'requested' && <div><dt>Driver</dt><dd>{trip.driver_name}</dd></div>}
            {trip.registration_number && trip.status !== 'requested' && <div><dt>Vehicle</dt><dd>{trip.vehicle_model} · {trip.registration_number}</dd></div>}
          </dl>
          {trip.status === 'requested' && <Loading>Waiting for a driver to accept…</Loading>}
          {['accepted', 'arriving'].includes(trip.status) && <div className="rg-otp"><span>Share at pickup</span><strong>{trip.otp || '—'}</strong></div>}
          {trip.status === 'in_progress' && <p className="rg-muted">Your trip is underway. This page updates when your driver completes the ride.</p>}
          {demo && trip.status === 'accepted' && <button className="rg-link rg-primary" onClick={() => setActiveRide({ ...trip, status: 'in_progress' })}>Simulate trip start</button>}
          {demo && trip.status === 'in_progress' && <button className="rg-link rg-primary" onClick={() => setActiveRide({ ...trip, status: 'completed' })}>Simulate drop-off</button>}
          {['requested', 'accepted', 'arriving'].includes(trip.status) && (
            <button className="rg-link rg-secondary" disabled={busy} onClick={() => perform(async () => {
              if (!demo) await rideService.cancelRide(trip.ride_id);
              leave();
            })}>Cancel ride</button>
          )}
          {trip.status === 'cancelled' && <button className="rg-link rg-primary" onClick={leave}>Back to booking</button>}
          {completed && !paid && (
            <>
              <label className="rg-field"><span>Payment method</span><select value={method} onChange={(event) => setMethod(event.target.value)}>
                <option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option>
                <option value="net_banking">Net banking</option><option value="wallet">Wallet</option>
              </select></label>
              <p className="rg-muted">Simulated payment. No money is charged.</p>
              <button className="rg-link rg-primary" disabled={busy} onClick={() => perform(async () => {
                if (!demo) await paymentService.processPayment({ ride_id: trip.ride_id, amount: Number(trip.fare), payment_method: method });
                setPaid(true);
              })}><CreditCard size={18} /> {busy ? 'Saving payment…' : 'Record payment'}</button>
            </>
          )}
          {completed && paid && !done && (
            <>
              <p className="rg-inline rg-muted"><Check size={16} /> Payment recorded</p>
              <div className="rg-stars" role="group" aria-label="Rate from one to five stars">
                {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-label={value + ' stars'} aria-pressed={rating === value}
                  onClick={() => setRating(value)}><Star size={25} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}
              </div>
              <label className="rg-field"><span>Review (optional)</span><textarea rows={3} value={review} onChange={(event) => setReview(event.target.value)} /></label>
              <button className="rg-link rg-primary" disabled={busy || !rating} onClick={() => perform(async () => {
                if (!demo) { 
                  try { await rideService.rateRide(trip.ride_id, { rating, review }); } 
                  catch (err) { if (err.response?.status !== 409) throw err; }
                }
                setDone(true);
              })}>Submit rating</button>
              <button className="rg-link rg-secondary" onClick={leave}>Skip rating</button>
            </>
          )}
          {done && <><p role="status" className="rg-inline"><Check size={18} /> Rating submitted.</p><button className="rg-link rg-primary" onClick={leave}>Back to booking</button></>}
        </Panel>
      </div>
    </Workspace>
  );
}

