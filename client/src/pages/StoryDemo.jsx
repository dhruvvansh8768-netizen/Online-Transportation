import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Database, MapPin, Car, CreditCard, Star, XCircle, ChevronRight, ChevronLeft, Navigation, Tag, Users
} from 'lucide-react';
import MapView from '../components/map/MapView';
import LocationMarker from '../components/map/LocationMarker';
import RouteDisplay from '../components/map/RouteDisplay';
import { Brand } from './auth/Landing';
import { Panel } from '../components/common/Workspace';

const STORY_STEPS = [
  {
    step: 1,
    title: 'Customer Registration (Rahul Kumar Patel)',
    story:
      'Rahul and his friend Aman plan to travel from Ahmedabad to the airport. Rahul opens the Online Transportation app and enters his Customer Name: First Name (Rahul), Middle Name (Kumar), and Last Name (Patel).',
    table: 'CUSTOMER',
    sql: `INSERT INTO CUSTOMER (FirstName, MiddleName, LastName)\nVALUES ('Rahul', 'Kumar', 'Patel');`,
    rowPreview: { CustomerID: 5, FirstName: 'Rahul', MiddleName: 'Kumar', LastName: 'Patel' },
    icon: Users,
  },
  {
    step: 2,
    title: 'Pickup & Drop Locations (Navrangpura → Hansol Airport)',
    story:
      'Rahul enters Pickup Location: House No. 25, MG Road, Locality: Navrangpura, Ahmedabad, Gujarat, Pincode: 380009, India — and Drop Location: House No. 10, Airport Road, Locality: Hansol, Ahmedabad, Gujarat, Pincode: 382475, India.',
    table: 'LOCATION',
    sql: `INSERT INTO LOCATION (HouseNo_Building, Street_Road, Locality, City, State, Pincode, Country)\nVALUES ('25', 'MG Road', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'India'),\n       ('10', 'Airport Road', 'Hansol', 'Ahmedabad', 'Gujarat', '382475', 'India');`,
    rowPreview: {
      Pickup_LocationID: '25, MG Road, Navrangpura (380009)',
      Drop_LocationID: '10, Airport Road, Hansol (382475)',
    },
    icon: MapPin,
  },
  {
    step: 3,
    title: 'Booking, Promo Code & Payment Mode',
    story:
      'The app generates a unique Booking ID. Rahul selects Booking Date, Booking Time, Ride Type (Cab/Sedan), NoOfPassengers = 2 (with Aman), ContactNumber, applies Promo Code FIRST50 (₹50 discount, expiry 2026-09-30), and picks UPI (among Credit Card, Debit Card, Net Banking, Wallet, Cash).',
    table: 'BOOKING + PROMOCODE + PAYMENT',
    sql: `SELECT Code, Discount, ExpiryDate FROM PROMOCODE WHERE Code = 'FIRST50';\nSELECT PaymentID, PaymentMode FROM PAYMENT WHERE PaymentMode = 'UPI';`,
    rowPreview: {
      BookingID: 25,
      RideType: 'Sedan',
      NoOfPassengers: 2,
      PromoCode: 'FIRST50 (₹50 OFF)',
      PaymentMode: 'UPI',
      EstimatedFare: '₹215.00',
    },
    icon: Tag,
  },
  {
    step: 4,
    title: 'Driver & Vehicle Assignment + GPS Tracker',
    story:
      'Ride Status changes from Requested/Booked → Driver Assigned. The app assigns Ramesh Patel (DriverID: 1, Rating: 4.80, Contact: 9876543210, 8 yrs exp) with Vehicle VH001 (Swift Dzire, Sedan, White, License Plate GJ01AB1234). The map shows an illustrative route.',
    table: 'DRIVER + VEHICLE + RIDESTATUS',
    sql: `SELECT d.DriverID, d.DriverName, d.DriverRating, d.YearOfExperience,\n       v.VehicleCode, v.VehicleModel, v.VehicleType, v.LincensePlateNo\nFROM DRIVER d JOIN BOOKING b ON d.DriverID = b.DriverID\nJOIN VEHICLE v ON v.VehicleID = b.VehicleID;`,
    rowPreview: {
      Driver: 'Ramesh Patel (★ 4.80, 8 yrs exp)',
      Vehicle: 'VH001 • Swift Dzire White (GJ01AB1234)',
      RideStatus: 'Driver Assigned → In Progress',
    },
    icon: Car,
  },
  {
    step: 5,
    title: "Aman's Parallel Ride & Cancellation Flow",
    story:
      'Meanwhile, Aman books another ride from home using Debit Card. After an important call postpones his meeting, Aman cancels before the driver arrives — demonstrating how RIDESTATUS transitions to Cancelled!',
    table: 'RIDESTATUS (Cancelled)',
    sql: `UPDATE BOOKING SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'Cancelled')\nWHERE BookingID = 22;`,
    rowPreview: {
      Customer: 'Aman (Parallel Booking)',
      PaymentMode: 'Debit Card',
      RideStatus: 'Cancelled',
    },
    icon: XCircle,
  },
  {
    step: 6,
    title: 'Ride Completed, Payment & 5-Star Customer Feedback',
    story:
      'Rahul reaches Ahmedabad Airport! RideStatus changes to Completed. Actual Fare, Actual Distance (9.4 km), and Duration (22 min) are recorded. Rahul pays via UPI and submits 5-star Feedback with review and FeedbackDate.',
    table: 'CUSTOMERFEEDBACK + BOOKING',
    sql: `INSERT INTO CUSTOMERFEEDBACK (Rating, Review, FeedbackDate)\nVALUES (5, 'Excellent ride and friendly driver', CURRENT_DATE);`,
    rowPreview: {
      RideStatus: 'Completed',
      FinalPayment: 'Paid via UPI',
      Rating: '5 ★ — Excellent ride and friendly driver',
    },
    icon: Star,
  },
];

export default function StoryDemo() {
  const [active, setActive] = useState(0);
  const current = STORY_STEPS[active];
  const Icon = current.icon;
  const pickup = [23.0365, 72.5611];
  const dropoff = [23.0734, 72.6266];
  const midpoint = [23.058, 72.59];
  const labels = ['Customer', 'Locations', 'Booking', 'Assignment', 'Cancellation', 'Feedback'];

  return (
    <>
      <header className="rg-public-nav rg-width"><Brand /><Link className="rg-link rg-secondary" to="/login">Open RideGo <ChevronRight size={16} /></Link></header>
      <main className="rg-width rg-workspace rg-story">
        <header className="rg-page-heading">
          <div><p className="rg-kicker"><BookOpen size={17} /> DBMS Lab 2 &amp; Lab 3</p><h1>An airport ride, step by step</h1>
            <p>Follow Rahul and Aman from Navrangpura to Ahmedabad Airport through the lab schema.</p></div>
        </header>
        <nav className="rg-story-steps" aria-label="Story steps">
          {labels.map((label, index) => (
            <button key={label} aria-current={active === index ? 'step' : undefined} onClick={() => setActive(index)}>
              <span>{index + 1}</span> {label}
            </button>
          ))}
        </nav>
        <div className="rg-story-grid">
          <div key={active} className="rg-stack rg-enter" aria-live="polite">
            <Panel>
              <div className="rg-inline"><span className="rg-icon"><Icon size={22} /></span><h2>{current.title}</h2></div>
              <p className="rg-story-copy">{current.story}</p>
            </Panel>
            <Panel className="rg-code-panel">
              <h2 className="rg-inline"><Database size={19} /> SQL example</h2>
              <pre tabIndex={0}><code>{current.sql}</code></pre>
            </Panel>
            <Panel>
              <h2>Sample rows</h2>
              <p className="rg-muted rg-story-table-name">{current.table}</p>
              <dl className="rg-story-fields">
                {Object.entries(current.rowPreview).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}
              </dl>
            </Panel>
          </div>
          <div className="rg-stack rg-story-aside">
            <Panel>
              <h2 className="rg-inline"><Navigation size={18} /> Route preview</h2>
              <p className="rg-muted rg-story-table-name">Navrangpura to Hansol · 9.4 km in the example</p>
              <div className="rg-map rg-story-map">
                <MapView center={midpoint} zoom={13} className="rg-map-view" scrollWheelZoom={false}>
                  <LocationMarker position={pickup} label="Pickup · Navrangpura" type="pickup" />
                  <LocationMarker position={dropoff} label="Drop-off · Ahmedabad Airport" type="destination" />
                  {active >= 3 && <LocationMarker position={active === 5 ? dropoff : midpoint} label="Example driver position" type="driver" />}
                  <RouteDisplay coordinates={[pickup, midpoint, dropoff]} color="#d28b21" dashArray="6 8" />
                </MapView>
              </div>
            </Panel>
            <div className="rg-duty">
              <button className="rg-link rg-secondary" disabled={active === 0} onClick={() => setActive(active - 1)}><ChevronLeft size={17} /> Previous</button>
              <button className="rg-link rg-primary" disabled={active === labels.length - 1} onClick={() => setActive(active + 1)}>Next step <ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
        <footer className="rg-public-footer"><span>Dhruv Vansh &amp; Rudra Patel</span><span>ECSCI24201 · Adani University</span></footer>
      </main>
    </>
  );
}
