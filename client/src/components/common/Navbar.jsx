import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Brand } from '../../pages/auth/Landing';

const roleLinks = {
  rider: [['', 'Book'], ['/history', 'History'], ['/payments', 'Payments'], ['/profile', 'Profile']],
  driver: [['', 'Drive'], ['/incoming', 'Requests'], ['/earnings', 'Earnings'], ['/history', 'History'], ['/profile', 'Profile']],
  admin: [['', 'Overview'], ['/users', 'Users'], ['/rides', 'Rides'], ['/vehicles', 'Vehicles'], ['/payments', 'Payments'], ['/promos', 'Promos'], ['/reports', 'Reports']],
};

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const home = '/' + user.role;
  return (
    <header className="rg-app-header">
      <div className="rg-width rg-app-nav">
        <Brand to={home} />
        <nav aria-label={user.role + ' navigation'}>
          {roleLinks[user.role].map(([path, label]) => (
            <NavLink end={!path} key={path} to={home + path}>{label}</NavLink>
          ))}
        </nav>
        <div className="rg-session">
          {token === 'demo-token' && <Link to="/login" className="rg-demo-label">Demo</Link>}
          <button className="rg-link rg-secondary rg-icon-button" aria-label="Sign out" title="Sign out" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

