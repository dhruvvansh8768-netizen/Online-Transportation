import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Car, Compass, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';
import Input from '../../components/common/Input';
import { ErrorNotice } from '../../components/common/Workspace';

export default function Login() {
  const { login, demoLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fillAdmin = () => {
    setEmail('rj423513@gmail.com');
    setPassword('123456');
    clearError();
  };

  return (
    <AuthLayout>
      <header className="rg-page-heading">
        <div>
          <h1>Sign in</h1>
          <p>Access your RideGo account with PostgreSQL authentication.</p>
        </div>
      </header>

      <form
        className="rg-stack"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const user = await login(email, password);
            navigate('/' + user.role);
          } catch {
            // Authentication errors are displayed by the form.
          }
        }}
      >
        <ErrorNotice>{error}</ErrorNotice>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          placeholder="Enter your email"
          required
          onChange={(event) => {
            setEmail(event.target.value);
            clearError();
          }}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          placeholder="Enter password"
          required
          showPasswordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            clearError();
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fillAdmin}
            style={{
              background: 'rgba(255, 190, 99, 0.1)',
              border: '1px solid rgba(255, 190, 99, 0.4)',
              color: '#ffbe63',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={14} /> Quick-fill Admin Credentials
          </button>
          <Link to="/forgot-password" className="rg-back">Password help</Link>
        </div>
        <button className="rg-link rg-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
        </button>
      </form>

      <section className="rg-auth-demo">
        <h2>Try the demo</h2>
        <div>
          {[
            ['rider', 'Rider', Car],
            ['driver', 'Driver', Compass],
            ['admin', 'Admin', LayoutDashboard]
          ].map(([role, label, Icon]) => (
            <button
              key={role}
              type="button"
              className="rg-link rg-secondary"
              onClick={() => {
                clearError();
                demoLogin(role);
                navigate('/' + role);
              }}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>
      </section>

      <div className="rg-auth-join">
        <Link className="rg-back" to="/signup/rider">Create rider account <ArrowRight size={15} /></Link>
        <Link className="rg-back" to="/signup/driver">Register as driver <ArrowRight size={15} /></Link>
      </div>
    </AuthLayout>
  );
}
