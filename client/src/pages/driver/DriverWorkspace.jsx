import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Power } from 'lucide-react';
import { RideContext } from '../../context/RideContext';
import { SocketContext } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { useLocation } from '../../hooks/useLocation';
import driverService from '../../services/driver.service';
import rideService from '../../services/ride.service';
import { ErrorNotice, Loading, Panel, ResourceState, Workspace, money, messageFor, useResource } from '../../components/common/Workspace';
import { JourneyMap, JourneySteps, RouteSummary, ridePoint } from '../../components/ride/Journey';

const loadProfile = () => driverService.getProfile();
const loadRequests = () => rideService.getPendingRides();
const exampleTrip = {
  ride_id: 'demo-driver', rider_name: 'Rahul Kumar Patel', status: 'requested',
  pickup_address: 'MG Road, Navrangpura', drop_address: 'Airport Road, Hansol',
  pickup_lat: 23.0365, pickup_lng: 72.5611, drop_lat: 23.0734, drop_lng: 72.6266, fare: 185,
};
const demoProfile = async () => ({ data: { data: {
  driver: { full_name: 'Ramesh Patel', is_available: true, current_lat: 23.0365, current_lng: 72.5611 },
} } });
const demoRequests = async () => ({ data: { data: { rides: [exampleTrip] } } });

function tripPath(status) {
  return status === 'in_progress' ? '/driver/live-navigation' : '/driver/navigate-pickup';
}

export function DriverWorkspace({ requests = false }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const demo = token === 'demo-token';
  const profile = useResource(demo ? demoProfile : loadProfile);
  const incoming = useResource(demo ? demoRequests : loadRequests);
  const live = useTrip(undefined, !demo);
  const { socket, isConnected } = useContext(SocketContext);
  const { activeRide, setActiveRide } = useContext(RideContext);
  const active = demo ? { ride: activeRide } : live;
  const [available, setAvailable] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState([]);
  const retry = React.useRef(incoming.retry);
  retry.current = incoming.retry;
  const online = available ?? profile.data?.driver.is_available;

  useEffect(() => {
    if (demo || !online || active.ride) return;
    const refresh = () => retry.current();
    const interval = setInterval(refresh, 20000);
    if (isConnected) socket?.on('new_ride_request', refresh);
    return () => {
      clearInterval(interval);
      socket?.off('new_ride_request', refresh);
    };
  }, [demo, online, active.ride?.ride_id, isConnected, socket]);

  const act = async (action) => {
    setBusy(true);
    setError('');
    try { await action(); } catch (err) { setError(messageFor(err)); } finally { setBusy(false); }
  };

  return (
    <Workspace title={requests ? 'Ride requests' : 'Driver dashboard'} description={profile.data?.driver.full_name}
      action={<Link to="/driver/earnings" className="rg-link rg-secondary">View earnings <ArrowRight size={16} /></Link>}>
      <div className="rg-map-layout">
        <JourneyMap driver={ridePoint(profile.data?.driver, 'current')} />
        <Panel className="rg-ride-sheet">
          <ResourceState {...profile} />
          <ErrorNotice>{error || active.error}</ErrorNotice>
          {profile.data && (
            <div className="rg-duty">
              <div><span className="rg-kicker"><i data-online={!!online} /> {online ? 'Online' : 'Offline'}</span><h2>Availability</h2></div>
              <button className={'rg-link ' + (online ? 'rg-secondary' : 'rg-primary')} disabled={busy || !!active.ride}
                onClick={() => act(async () => {
                  const next = demo ? !online : (await driverService.toggleStatus(!online)).data.data.is_available;
                  setAvailable(next);
                  if (next) incoming.retry();
                })}><Power size={17} /> {online ? 'Go offline' : 'Go online'}</button>
            </div>
          )}
          {active.ride ? (
            <>
              <h2>Active ride</h2>
              <RouteSummary pickup={active.ride.pickup_address} dropoff={active.ride.drop_address} />
              <Link className="rg-link rg-primary" to={tripPath(active.ride.status)}>Resume trip <ArrowRight size={16} /></Link>
            </>
          ) : online ? (
            <>
              <div className="rg-duty"><h2 className="rg-inline"><Bell size={18} /> Incoming requests</h2><button className="rg-back" onClick={incoming.retry}>Refresh</button></div>
              <ResourceState {...incoming} />
              {incoming.data && !incoming.data.rides.some((ride) => !dismissed.includes(ride.ride_id)) && <p className="rg-empty">No open requests. Keep this screen open to receive updates.</p>}
              {incoming.data?.rides.filter((ride) => !dismissed.includes(ride.ride_id)).map((ride) => (
                <article className="rg-request" key={ride.ride_id}>
                  <div className="rg-duty"><strong>{ride.rider_name}</strong><strong>{money(ride.fare)}</strong></div>
                  <RouteSummary pickup={ride.pickup_address} dropoff={ride.drop_address} />
                  <div className="rg-actions">
                    <button className="rg-link rg-primary" disabled={busy} onClick={() => act(async () => {
                      const accepted = demo ? { ...ride, status: 'accepted' } : (await driverService.acceptRide(ride.ride_id)).data.data.ride;
                      setActiveRide(accepted);
                      navigate('/driver/navigate-pickup');
                    })}>Accept</button>
                    <button className="rg-link rg-secondary" disabled={busy} onClick={() => act(async () => {
                      if (!demo) await driverService.rejectRide(ride.ride_id);
                      setDismissed((items) => [...items, ride.ride_id]);
                    })}>Decline</button>
                  </div>
                </article>
              ))}
            </>
          ) : profile.data && <p className="rg-empty">Go online to view available ride requests.</p>}
        </Panel>
      </div>
    </Workspace>
  );
}

export function DriverTrip({ step }) {
  const { activeRide, setActiveRide, resetRide } = useContext(RideContext);
  const { token } = useAuth();
  const demo = token === 'demo-token';
  const active = useTrip(activeRide?.ride_id, !demo);
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const { location, error: gpsError } = useLocation({ watch: step === 2 });
  const { emit } = useContext(SocketContext);
  const trip = result || active.ride || activeRide;

  useEffect(() => {
    if (trip?.status === 'in_progress' && step < 2) navigate('/driver/live-navigation', { replace: true });
  }, [trip?.status, step, navigate]);

  useEffect(() => {
    if (demo || !location || gpsError || trip?.status !== 'in_progress' || step !== 2) return;
    const { lat, lng } = location;
    driverService.updateLocation({ lat, lng }).then(() => {
      emit('driver:location-update', { rideId: trip.ride_id, riderId: trip.rider_id, lat, lng });
    }).catch(() => {});
  }, [location, gpsError, trip?.status, trip?.ride_id, trip?.rider_id, step, emit, demo]);

  const act = async (action) => {
    setBusy(true);
    setError('');
    try {
      const response = await action(trip.ride_id);
      setActiveRide(response.data.data.ride);
      return response.data.data.ride;
    } catch (err) {
      setError(messageFor(err));
      return null;
    } finally { setBusy(false); }
  };
  const title = trip?.status === 'cancelled' ? 'Ride cancelled' : trip?.status === 'completed' ? 'Ride complete' :
    ['Navigate to pickup', 'Verify ride code', 'On the trip', 'Complete trip'][step];

  return (
    <Workspace title={title}>
      {!trip ? <Panel>{(demo || active.ready) ? <p>No active trip.</p> : <Loading />}<ErrorNotice>{active.error}</ErrorNotice><Link className="rg-link rg-secondary" to="/driver">Driver dashboard</Link></Panel> :
        <div className="rg-map-layout">
          <JourneyMap pickup={ridePoint(trip, 'pickup')} dropoff={ridePoint(trip, 'drop')} driver={!gpsError ? location : null} />
          <Panel className="rg-ride-sheet">
            <JourneySteps stages={['Pickup', 'Ride code', 'On trip', 'Finish']} current={step} />
            <ErrorNotice>{error || active.error}</ErrorNotice>
            <RouteSummary pickup={trip.pickup_address} dropoff={trip.drop_address} />
            <dl className="rg-definition"><div><dt>Fare</dt><dd>{money(trip.fare)}</dd></div></dl>
            {['cancelled', 'completed'].includes(trip.status) ? (
              <button className="rg-link rg-primary" onClick={() => { resetRide(); navigate('/driver'); }}>Back to dashboard</button>
            ) : step === 0 ? (
              <button className="rg-link rg-primary" onClick={() => navigate('/driver/start-ride')}>At pickup <ArrowRight size={17} /></button>
            ) : step === 1 ? (
              <form className="rg-stack" onSubmit={async (event) => {
                event.preventDefault();
                if (demo) {
                  if (otp !== '4829') { setError('Use 4829 for the demo ride.'); return; }
                  setActiveRide({ ...trip, status: 'in_progress' });
                  navigate('/driver/live-navigation');
                } else if (await act((id) => driverService.startRide(id, otp))) navigate('/driver/live-navigation');
              }}>
                <label className="rg-field"><span>Enter the rider’s 4-digit code{demo ? ' (4829 for this demo)' : ''}</span><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  inputMode="numeric" autoComplete="one-time-code" maxLength={4} required /></label>
                <button className="rg-link rg-primary" disabled={busy || otp.length !== 4}>Start ride</button>
              </form>
            ) : step === 2 ? (
              <button className="rg-link rg-primary" disabled={trip.status !== 'in_progress'} onClick={() => navigate('/driver/complete')}>Arrived at drop-off</button>
            ) : (
              <button className="rg-link rg-primary" disabled={busy || trip.status !== 'in_progress'} onClick={async () => {
                const completed = demo ? { ...trip, status: 'completed' } : await act((id) => driverService.completeRide(id));
                if (completed) setResult(completed);
              }}>Complete ride</button>
            )}
          </Panel>
        </div>}
    </Workspace>
  );
}

