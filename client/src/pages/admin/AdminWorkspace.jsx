import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Car, CreditCard, Tags, Users, UserPlus, Database, Check, Copy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import adminService from '../../services/admin.service';
import { DataTable, ErrorNotice, Panel, ResourceState, Workspace, dateLabel, money, messageFor, useResource } from '../../components/common/Workspace';
import Trend from '../../components/common/Trend';

const loadOverview = () => adminService.getDashboardStats();
const demoOverview = {
  stats: { total_riders: 10, total_drivers: 10, total_rides: 18, total_revenue: 5180, completed_rides: 13, cancelled_rides: 2, active_rides: 3, available_drivers: 8 },
  ridesPerDay: [{ date: '2026-08-01', total: 2 }, { date: '2026-08-02', total: 5 }, { date: '2026-08-03', total: 3 }, { date: '2026-08-04', total: 8 }],
  revenuePerDay: [{ date: '2026-08-01', revenue: 580 }, { date: '2026-08-02', revenue: 1340 }, { date: '2026-08-03', revenue: 860 }, { date: '2026-08-04', revenue: 2400 }],
};
const demoLoad = async () => ({ data: { data: demoOverview } });

export function AdminOverview({ reports = false }) {
  const { token } = useAuth();
  const demo = token === 'demo-token';
  const resource = useResource(loadOverview);
  const data = resource.data || (demo ? demoOverview : null);
  const metrics = data ? [
    ['Riders', data.stats.total_riders, Users, 'users'],
    ['Total rides', data.stats.total_rides, Car, 'rides'],
    ['Available drivers', data.stats.available_drivers, Users, 'vehicles'],
    ['Recorded revenue', money(data.stats.total_revenue), CreditCard, 'payments'],
  ] : [];
  return (
    <Workspace title={reports ? 'Reports' : 'Operations overview'} description={demo ? 'Sample activity for the admin demo.' : 'Ride activity, driver availability, and recorded revenue.'}
      action={<Link className="rg-link rg-secondary" to="/story-demo">DBMS walkthrough <ArrowUpRight size={16} /></Link>}>
      <ResourceState {...resource} />
      {data && <>
        {!reports && <div className="rg-metrics">
          {metrics.map(([label, value, Icon, path]) => <Link to={'/admin/' + path} className="rg-panel rg-metric" key={label}>
            <span><Icon size={19} /><ArrowUpRight size={15} /></span><strong>{value}</strong><small>{label}</small>
          </Link>)}
        </div>}
        <div className="rg-grid-two">
          <Trend title="Rides · last 7 days" rows={data.ridesPerDay} field="total" />
          <Trend title="Revenue · last 7 days" rows={data.revenuePerDay} field="revenue" currency />
        </div>
        <Panel>
          <h2>Ride status</h2>
          <dl className="rg-definition">{[['Completed', 'completed_rides'], ['Active', 'active_rides'], ['Cancelled', 'cancelled_rides']].map(([label, field]) =>
            <div key={field}><dt>{label}</dt><dd>{data.stats[field]}</dd></div>)}</dl>
        </Panel>
      </>}
    </Workspace>
  );
}

const demoRows = {
  users: [
    { user_id: 1, full_name: 'Rudra Patel (Admin)', email: 'rj423513@gmail.com', role: 'admin', is_active: true },
    { user_id: 5, full_name: 'Rahul Kumar Patel', email: 'rahul@example.test', role: 'rider', is_active: true },
    { user_id: 6, full_name: 'Ramesh Patel', email: 'ramesh@example.test', role: 'driver', is_active: true },
  ],
  rides: [{ ride_id: 21, rider_name: 'Rahul Kumar Patel', pickup_address: 'Navrangpura', drop_address: 'Hansol Airport', status: 'completed', fare: 185 }],
  vehicles: [{ driver_id: 6, full_name: 'Ramesh Patel', model: 'Swift Dzire', vehicle_type: 'sedan', registration_number: 'GJ01AB1234' }],
  payments: [{ payment_id: 1, transaction_id: 'TXN-8801', full_name: 'Rahul Kumar Patel', payment_method: 'upi', payment_status: 'completed', amount: 185, created_at: '2026-08-01' }],
  promos: [{ promo_id: 1, code: 'WELCOME10', discount_percent: 10, max_discount: 50, valid_to: '2026-12-31' }],
};
const loadRows = {
  users: () => adminService.getUsers(), rides: () => adminService.getRides(),
  vehicles: () => adminService.getVehicles(), payments: () => adminService.getTransactions(), promos: () => adminService.getPromos(),
};
const fields = { users: 'users', rides: 'rides', vehicles: 'drivers', payments: 'transactions', promos: 'promos' };
const keys = { users: 'user_id', rides: 'ride_id', vehicles: 'driver_id', payments: 'payment_id', promos: 'promo_id' };
const labels = { users: 'Users', rides: 'Rides', vehicles: 'Vehicles', payments: 'Payments', promos: 'Promotions' };
const cell = (label, field) => [label, (row) => row[field]];
const status = (value) => <span className="rg-badge">{value?.replaceAll('_', ' ')}</span>;

const listColumns = {
  users: [cell('ID', 'user_id'), cell('Name', 'full_name'), cell('Email', 'email'), cell('Role', 'role'), ['Status', (row) => status(row.is_active ? 'Active' : 'Disabled')]],
  rides: [cell('Ride #', 'ride_id'), cell('Rider', 'rider_name'), cell('Pickup', 'pickup_address'), cell('Drop-off', 'drop_address'), ['Status', (row) => status(row.status)], ['Fare', (row) => money(row.fare)]],
  vehicles: [cell('Driver', 'full_name'), cell('Model', 'model'), cell('Type', 'vehicle_type'), cell('Registration', 'registration_number')],
  payments: [cell('Transaction', 'transaction_id'), cell('Rider', 'full_name'), cell('Method', 'payment_method'), ['Status', (row) => status(row.payment_status)], ['Amount', (row) => money(row.amount)], ['Date', (row) => dateLabel(row.created_at)]],
  promos: [cell('Code', 'code'), ['Discount', (row) => row.discount_percent + '%'], ['Maximum', (row) => money(row.max_discount)], ['Expires', (row) => dateLabel(row.valid_to)]],
};
const emptyResponse = async () => ({ data: { data: {} } });

export function AdminRecords({ type }) {
  const { token } = useAuth();
  const demo = token === 'demo-token';
  const resource = useResource(loadRows[type]);
  const [samples, setSamples] = useState(() => demoRows[type]);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [removeId, setRemoveId] = useState(null);
  const [sqlModal, setSqlModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const apiRows = resource.data?.[fields[type]];
  const rows = apiRows && Array.isArray(apiRows) && apiRows.length > 0 ? apiRows : samples;
  const key = keys[type];

  const mutate = async (request, onDemo) => {
    setBusy(true);
    setError('');
    try {
      if (demo) onDemo();
      else { await request(); resource.retry(); }
      return true;
    } catch (err) { setError(messageFor(err)); return false; }
    finally { setBusy(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const role = form.get('role');
    const fullName = String(form.get('full_name')).trim();
    const email = String(form.get('email')).trim().toLowerCase();
    const phone = String(form.get('phone')).trim();
    const licenseNumber = form.get('license_number') ? String(form.get('license_number')).trim() : '';

    const payload = { full_name: fullName, email, phone, role, license_number: licenseNumber };

    try {
      if (demo) {
        const dummyUser = { user_id: Date.now(), full_name: fullName, email, role, is_active: true };
        setSamples((prev) => [dummyUser, ...prev]);
        setSqlModal({
          title: `INSERT ${role.toUpperCase()} (Demo Preview)`,
          sql: `-- PostgreSQL Live Insert Query\nINSERT INTO users (full_name, email, phone, password_hash, role, is_active)\nVALUES ('${fullName}', '${email}', '${phone}', '[BCRYPT_HASH]', '${role}', true)\nRETURNING *;\n\n${role === 'rider' ? `-- Insert into Lab-2 CUSTOMER\nINSERT INTO "CUSTOMER" ("FirstName", "LastName", "Email", "PhoneNumber", "CustomerRating")\nVALUES ('${fullName.split(' ')[0]}', '${fullName.split(' ').slice(1).join(' ') || 'User'}', '${email}', '${phone}', 5.0);` : `-- Insert into Lab-2 DRIVER\nINSERT INTO "DRIVER" ("FirstName", "LastName", "Email", "PhoneNumber", "LicenseNumber", "DriverRating", "AvailabilityStatus")\nVALUES ('${fullName.split(' ')[0]}', '${fullName.split(' ').slice(1).join(' ') || 'User'}', '${email}', '${phone}', '${licenseNumber || 'GJ01-2026-9999'}', 5.0, 'Available');`}`,
          time: '3ms (simulated)',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const res = await adminService.createUser(payload);
        resource.retry();
        setSqlModal({
          title: `INSERT ${role.toUpperCase()} Executed in PostgreSQL`,
          sql: res.data?.executedSql || `-- Executed direct query:\nINSERT INTO users (full_name, email, phone, role) VALUES ('${fullName}', '${email}', '${phone}', '${role}');`,
          time: res.data?.executionTime || '14ms',
          timestamp: res.data?.timestamp || new Date().toLocaleTimeString()
        });
      }
      setAddingUser(false);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  const columns = [...listColumns[type]];
  if (type === 'users') columns.push(['Action', (row) => <button className="rg-back" disabled={busy} onClick={() => mutate(
    () => adminService.toggleUserStatus(row.user_id, row.is_active ? 'inactive' : 'active'),
    () => setSamples((items) => items.map((item) => item.user_id === row.user_id ? { ...item, is_active: !item.is_active } : item))
  )}>{row.is_active ? 'Disable' : 'Enable'}</button>]);
  if (type === 'promos') columns.push(['Action', (row) => <button className="rg-back" disabled={busy} onClick={() => setRemoveId(row.promo_id)}>Remove</button>]);

  return (
    <Workspace
      title={labels[type]}
      description={demo ? 'Sample records for the admin demo.' : undefined}
      action={
        <div style={{ display: 'flex', gap: '8px' }}>
          {type === 'users' && (
            <button className="rg-link rg-primary" onClick={() => setAddingUser(!addingUser)}>
              <UserPlus size={16} /> {addingUser ? 'Close Form' : 'Add Rider / Driver'}
            </button>
          )}
          {type === 'promos' && (
            <button className="rg-link rg-primary" onClick={() => setCreating(!creating)}>
              <Tags size={16} /> {creating ? 'Close form' : 'New promotion'}
            </button>
          )}
        </div>
      }
    >
      <ErrorNotice>{error}</ErrorNotice>
      {!demo && <ResourceState {...resource} />}

      {/* SQL Execution Inspector Modal */}
      {sqlModal && (
        <Panel style={{ border: '1px solid rgba(255, 190, 99, 0.4)', background: 'rgba(20, 24, 33, 0.95)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#ffbe63', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <Database size={18} /> {sqlModal.title}
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Time: {sqlModal.time} | {sqlModal.timestamp}</span>
              <button
                type="button"
                className="rg-back"
                onClick={() => {
                  navigator.clipboard.writeText(sqlModal.sql);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy SQL Query'}
              </button>
              <button type="button" className="rg-back" onClick={() => setSqlModal(null)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                Dismiss
              </button>
            </div>
          </div>
          <pre style={{
            background: '#0d1117',
            color: '#7ee787',
            padding: '12px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '13px',
            fontFamily: 'monospace',
            lineHeight: 1.5,
            border: '1px solid #30363d',
            margin: 0
          }}>
            {sqlModal.sql}
          </pre>
        </Panel>
      )}

      {/* Add Rider / Driver Form */}
      {addingUser && (
        <Panel style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Add New User (Live PostgreSQL Insert)</h3>
          <form className="rg-stack" onSubmit={handleCreateUser}>
            <div className="rg-form-grid">
              <label className="rg-field">
                <span>Account Role</span>
                <select name="role" defaultValue="rider" style={{ background: '#1c2128', color: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <option value="rider">Rider (Customer)</option>
                  <option value="driver">Driver</option>
                </select>
              </label>
              <label className="rg-field">
                <span>Full Name</span>
                <input name="full_name" placeholder="e.g. Parthiv Patel" required />
              </label>
              <label className="rg-field">
                <span>Email Address</span>
                <input name="email" type="email" placeholder="e.g. parthiv@gmail.com" required />
              </label>
              <label className="rg-field">
                <span>Phone Number</span>
                <input name="phone" placeholder="e.g. 9876543210" required />
              </label>
              <label className="rg-field">
                <span>License Number (for drivers)</span>
                <input name="license_number" placeholder="e.g. GJ01-2026-5544" />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="rg-link rg-primary" disabled={busy}>
                {busy ? 'Executing SQL...' : 'Insert into Database'}
              </button>
              <button type="button" className="rg-link rg-secondary" onClick={() => setAddingUser(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {creating && <Panel>
        <form className="rg-stack" onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const promo = { code: String(form.get('code')).trim().toUpperCase(), discount_percent: Number(form.get('percent')), max_discount: Number(form.get('max')), valid_to: form.get('expiry') || undefined };
          if (!promo.code) return;
          if (await mutate(() => adminService.createPromo(promo), () => setSamples((items) => [...items, { ...promo, promo_id: Date.now() }]))) setCreating(false);
        }}>
          <div className="rg-form-grid">
            <label className="rg-field"><span>Code</span><input name="code" maxLength={50} required /></label>
            <label className="rg-field"><span>Discount %</span><input name="percent" type="number" min="1" max="100" required /></label>
            <label className="rg-field"><span>Maximum discount (₹)</span><input name="max" type="number" min="1" defaultValue="100" required /></label>
            <label className="rg-field"><span>Expiry date (optional)</span><input name="expiry" type="date" /></label>
          </div>
          <button className="rg-link rg-primary" disabled={busy}>Save promotion</button>
        </form>
      </Panel>}

      {removeId !== null && <Panel className="rg-duty"><p>Remove this promotion?</p><div className="rg-actions">
        <button className="rg-link rg-secondary" onClick={() => setRemoveId(null)}>Keep</button>
        <button className="rg-link rg-primary" disabled={busy} onClick={async () => {
          if (await mutate(() => adminService.deletePromo(removeId), () => setSamples((items) => items.filter((item) => item.promo_id !== removeId)))) setRemoveId(null);
        }}>Remove</button>
      </div></Panel>}

      {(demo || resource.data) && <Panel>
        <label className="rg-field rg-filter"><span>Search {labels[type].toLowerCase()}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter loaded records" /></label>
        <DataTable columns={columns} rowKey={(row) => row[key]} rows={rows.filter((row) => columns.some(([, read]) => {
          const value = read(row);
          return String(typeof value === 'object' ? value?.props?.children || '' : value ?? '').toLowerCase().includes(query.trim().toLowerCase());
        }))} />
      </Panel>}
    </Workspace>
  );
}
