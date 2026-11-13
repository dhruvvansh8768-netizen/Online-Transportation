import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import { ErrorNotice } from '../../components/common/Workspace';
import AuthLayout from './AuthLayout';

export default function SignupDriver() {
  const { signupDriver, loading, error, clearError } = useAuth();
  const [validation, setValidation] = useState('');
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <header className="rg-page-heading"><div><h1>Register as driver</h1><p>Create an account and add your vehicle from your profile.</p></div></header>
      <form className="rg-stack" onChange={() => { clearError(); setValidation(''); }} onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const password = String(form.get('password'));
        if (password !== form.get('confirm')) {
          setValidation('Passwords do not match.');
          return;
        }
        if (!/[a-z]/i.test(password) || !/[0-9]/.test(password)) {
          setValidation('Include at least one letter and one number in your password.');
          return;
        }
        try {
          await signupDriver({
            name: String(form.get('name')).trim(),
            email: String(form.get('email')).trim(),
            phone: form.get('phone'),
            password,
            licenseNumber: String(form.get('license')).trim(),
          });
          navigate('/driver/profile');
        } catch {
          // AuthContext supplies the message.
        }
      }}>
        <ErrorNotice>{validation || error}</ErrorNotice>
        <Input name="name" label="Full name" autoComplete="name" required minLength={2} maxLength={100} />
        <Input name="email" label="Email" type="email" autoComplete="email" required />
        <Input name="phone" label="Mobile number" type="tel" autoComplete="tel" required />
        <Input name="license" label="License number" required maxLength={100} />
        <Input name="password" label="Password" type="password" autoComplete="new-password" helperText="8–72 characters with at least one letter and one number."
          minLength={8} maxLength={72} required showPasswordToggle />
        <Input name="confirm" label="Confirm password" type="password" autoComplete="new-password" required showPasswordToggle />
        <button className="rg-link rg-primary" disabled={loading}>{loading ? 'Registering…' : 'Create driver account'} <ArrowRight size={18} /></button>
      </form>
      <div className="rg-auth-join"><Link to="/login" className="rg-back">Already registered? Sign in</Link></div>
    </AuthLayout>
  );
}

