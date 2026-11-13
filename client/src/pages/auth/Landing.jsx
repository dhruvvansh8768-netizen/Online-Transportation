import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Car, MapPin, MoveUpRight, Compass } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Brand = ({ to = '/' }) => (
  <Link to={to} className="rg-brand" aria-label="RideGo home">
    <span><Car size={22} /></span> RideGo
  </Link>
);

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="rg-landing">
      <header className="rg-public-nav rg-width">
        <Brand />
        <nav aria-label="Main navigation">
          <Link className="rg-nav-story" to="/story-demo">DBMS walkthrough</Link>
          <Link className="rg-link rg-secondary" to={user ? '/' + user.role : '/login'}>
            {user ? 'Dashboard' : 'Sign in'} <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <main className="rg-width">
        <section className="rg-hero">
          <div className="rg-hero-copy rg-enter">
            <p className="rg-kicker"><MapPin size={16} /> Ahmedabad, Gujarat</p>
            <h1>Ride across <em>Ahmedabad.</em></h1>
            <p className="rg-intro">Choose your pickup and destination, compare fares, and follow your ride from booking to drop-off.</p>
            <div className="rg-actions">
              <Link className="rg-link rg-primary" to={user?.role === 'rider' ? '/rider' : '/signup/rider'}>Book a ride <ArrowRight size={18} /></Link>
              <Link className="rg-link rg-secondary" to={user?.role === 'driver' ? '/driver' : '/signup/driver'}>Drive with us <MoveUpRight size={16} /></Link>
            </div>
          </div>
          <div className="rg-hero-photo rg-enter">
            <img src={import.meta.env.BASE_URL + 'ridego-street.webp'} alt="A sedan on an Ahmedabad street at dusk" fetchPriority="high" />
          </div>
        </section>
        <div className="rg-paths">
          {[
            [Car, 'Riders', 'Plan a trip and see your fare.', user?.role === 'rider' ? '/rider' : '/signup/rider'],
            [Compass, 'Drivers', 'Manage availability and ride requests.', user?.role === 'driver' ? '/driver' : '/signup/driver'],
            [BookOpen, 'DBMS walkthrough', 'Explore the SQL behind an airport ride.', '/story-demo'],
          ].map(([Icon, title, description, to]) => (
            <Link to={to} key={title} className="rg-path">
              <span className="rg-icon"><Icon size={21} /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
              <MoveUpRight size={16} className="rg-path-arrow" />
            </Link>
          ))}
        </div>
      </main>
      <footer className="rg-public-footer rg-width"><span>RideGo</span><span>Database Management Systems · Adani University</span></footer>
    </div>
  );
}

