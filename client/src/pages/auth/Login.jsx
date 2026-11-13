import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Car, Compass, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';
import Input from '../../components/common/Input';
import { ErrorNotice } from '../../components/common/Workspace';

export default function Login() {
  const { login, demoLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthLayout>
      <header className="rg-page-heading"><div><h1>Sign in</h1><p>Access your RideGo account.</p></div></header>
      <form className="rg-stack" onSubmit={async (event) => {
        event.preventDefault();
        try {
          const user = await login(email, password);
          navigate('/' + user.role);
        } catch {
          // Authentication errors are displayed by the form.
        }
      }}>
        <ErrorNotice>{error}</ErrorNotice>
        <Input label="Email" type="email" name="email" autoComplete="email" value={email} required onChange={(event) => { setEmail(event.target.value); clearError(); }} />
        <Input label="Password" type="password" name="password" autoComplete="current-password" value={password} required showPasswordToggle
          onChange={(event) => { setPassword(event.target.value); clearError(); }} />
        <Link to="/forgot-password" className="rg-back">Password help</Link>
        <button className="rg-link rg-primary" disabled={loading}>Sign in <ArrowRight size={18} /></button>
      </form>
      <section className="rg-auth-demo">
        <h2>Try the demo</h2>
        <div>
          {[['rider', 'Rider', Car], ['driver', 'Driver', Compass], ['admin', 'Admin', LayoutDashboard]].map(([role, label, Icon]) => (
            <button key={role} className="rg-link rg-secondary" onClick={() => { clearError(); demoLogin(role); navigate('/' + role); }}><Icon size={17} /> {label}</button>
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

