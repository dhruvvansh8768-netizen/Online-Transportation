import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import rideService from '../services/ride.service';
import driverService from '../services/driver.service';
import paymentService from '../services/payment.service';
import { DataTable, ErrorNotice, Panel, ResourceState, Workspace, dateLabel, money, messageFor, useResource } from '../components/common/Workspace';
import Trend from '../components/common/Trend';

const loadRides = () => rideService.getRideHistory();
const loadPayments = () => paymentService.getHistory();
const loadDriver = () => driverService.getProfile();
const loadAddresses = () => api.get('/users/addresses');
const loadEarnings = () => driverService.getEarnings();
const loadDaily = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return driverService.getDailyEarnings({ start_date: start.toISOString(), end_date: end.toISOString() });
};
const displayStatus = (value) => <span className="rg-badge">{value?.replaceAll('_', ' ')}</span>;

export function AccountHistory({ payments = false }) {
  const resource = useResource(payments ? loadPayments : loadRides);
  const columns = payments ? [
    ['Ride #', (row) => row.ride_id], ['Transaction', (row) => row.transaction_id], ['Method', (row) => row.payment_method],
    ['Amount', (row) => money(row.amount)], ['Status', (row) => displayStatus(row.payment_status)], ['Date', (row) => dateLabel(row.created_at)],
  ] : [
    ['Ride #', (row) => row.ride_id], ['Pickup', (row) => row.pickup_address], ['Drop-off', (row) => row.drop_address],
    ['Fare', (row) => money(row.fare)], ['Status', (row) => displayStatus(row.status)], ['Date', (row) => dateLabel(row.created_at)],
  ];
  return (
    <Workspace title={payments ? 'Payment history' : 'Ride history'} description={payments ? 'Records from simulated ride payments.' : undefined}>
      <ResourceState {...resource} />
      {resource.data && <Panel><DataTable columns={columns} rows={payments ? resource.data.payments : resource.data.rides} rowKey={(row) => payments ? row.payment_id : row.ride_id} /></Panel>}
    </Workspace>
  );
}

export function DriverEarnings() {
  const summary = useResource(loadEarnings);
  const daily = useResource(loadDaily);
  return (
    <Workspace title="Earnings" description="Fare totals from completed rides.">
      <ResourceState {...summary} />
      {summary.data && <div className="rg-metrics">
        {[
          ['Total earnings', money(summary.data.earnings.total_earnings)],
          ['Completed rides', summary.data.earnings.total_rides],
          ['Average fare', money(summary.data.earnings.avg_fare)],
        ].map(([label, value]) => <Panel className="rg-metric" key={label}><strong>{value}</strong><small>{label}</small></Panel>)}
      </div>}
      <ResourceState {...daily} />
      {daily.data && <Trend title="Earnings · last 7 days" rows={daily.data.earnings} field="earnings" currency />}
    </Workspace>
  );
}

function Details({ user, updateProfile }) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <Panel><h2>Contact details</h2>
      <form className="rg-stack" onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setSaving(true);
        setError('');
        setNotice('');
        try {
          await updateProfile({ full_name: String(form.get('name')).trim(), phone: String(form.get('phone')).trim() });
          setNotice('Profile saved.');
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
      }}>
        <label className="rg-field"><span>Full name</span><input name="name" defaultValue={user.full_name} required maxLength={150} /></label>
        <label className="rg-field"><span>Email</span><input value={user.email} readOnly /></label>
        <label className="rg-field"><span>Phone</span><input name="phone" defaultValue={user.phone} type="tel" required maxLength={20} /></label>
        <ErrorNotice>{error}</ErrorNotice>
        {notice && <p role="status">{notice}</p>}
        <button className="rg-link rg-primary" disabled={saving}>Save profile</button>
      </form>
    </Panel>
  );
}

function DriverVehicles() {
  const resource = useResource(loadDriver);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    setSaving(true);
    setError('');
    try {
      if (editing.vehicle_id) await api.put('/drivers/vehicles/' + editing.vehicle_id, form);
      else await api.post('/drivers/vehicles', form);
      setEditing(null);
      resource.retry();
    } catch (err) { setError(messageFor(err)); }
    finally { setSaving(false); }
  };
  return (
    <Panel>
      <div className="rg-duty"><h2>Your vehicles</h2><button className="rg-back" onClick={() => { setEditing({}); setError(''); }}>Add vehicle</button></div>
      <ResourceState {...resource} />
      {resource.data && <DataTable rows={resource.data.vehicles} rowKey={(row) => row.vehicle_id}
        columns={ [['Model', (row) => row.model], ['Type', (row) => row.vehicle_type], ['Registration', (row) => row.registration_number],
          ['Action', (row) => <button className="rg-back" onClick={() => { setEditing(row); setError(''); }}>Edit</button>]] } />}
      {editing && <form key={editing.vehicle_id || 'new'} className="rg-stack rg-edit-form" onSubmit={submit}>
        <label className="rg-field"><span>Vehicle type</span><select name="vehicle_type" defaultValue={editing.vehicle_type || 'sedan'}>
          {['bike', 'auto', 'mini', 'sedan', 'suv', 'premium', 'electric'].map((type) => <option value={type} key={type}>{type}</option>)}
        </select></label>
        <label className="rg-field"><span>Model</span><input name="model" defaultValue={editing.model} maxLength={100} required /></label>
        <label className="rg-field"><span>Registration number</span><input name="registration_number" defaultValue={editing.registration_number} maxLength={50} required /></label>
        <label className="rg-field"><span>Color</span><input name="color" defaultValue={editing.color} maxLength={50} required /></label>
        <ErrorNotice>{error}</ErrorNotice>
        <div className="rg-actions">
          <button className="rg-link rg-primary" disabled={saving}>Save vehicle</button>
          <button className="rg-link rg-secondary" type="button" disabled={saving} onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </form>}
    </Panel>
  );
}

function SavedAddresses() {
  const resource = useResource(loadAddresses);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const remove = async (id) => {
    setBusy(true);
    setError('');
    try { await api.delete('/users/addresses/' + id); resource.retry(); }
    catch (err) { setError(messageFor(err)); }
    finally { setBusy(false); }
  };
  return <Panel><h2>Saved addresses</h2><ResourceState {...resource} /><ErrorNotice>{error}</ErrorNotice>
    {resource.data && <DataTable rows={resource.data.addresses} rowKey={(row) => row.address_id}
      columns={ [['Label', (row) => row.label], ['Address', (row) => row.address],
        ['Action', (row) => <button className="rg-back" disabled={busy} onClick={() => remove(row.address_id)}>Remove</button>]] } />}
    <Link to="/rider/search" className="rg-back">Plan a ride <ArrowRight size={16} /></Link>
  </Panel>;
}

export function AccountProfile({ driver = false }) {
  const { user, updateProfile } = useAuth();
  return <Workspace title={driver ? 'Driver profile' : 'Rider profile'}>
    <div className="rg-grid-two">
      <Details user={user} updateProfile={updateProfile} />
      {driver ? <DriverVehicles /> : <SavedAddresses />}
    </div>
  </Workspace>;
}

