import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import Input from '../../components/common/Input';
import { ErrorNotice, messageFor } from '../../components/common/Workspace';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <AuthLayout>
      <header className="rg-page-heading"><div><h1>Change password</h1><p>Use your current password to set a new one. If you’ve forgotten it, contact your RideGo administrator.</p></div></header>
      {done ? <p role="status">Password updated. <Link className="rg-back" to="/login">Sign in</Link></p> :
        <form className="rg-stack" onSubmit={async (event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          if (values.get('new_password') !== values.get('confirm')) { setError('Passwords do not match.'); return; }
          setSaving(true);
          setError('');
          try {
            await authService.resetPassword({
              email: String(values.get('email')).trim().toLowerCase(),
              current_password: values.get('current_password'),
              new_password: values.get('new_password'),
            });
            setDone(true);
          } catch (err) { setError(messageFor(err)); }
          finally { setSaving(false); }
        }}>
          <ErrorNotice>{error}</ErrorNotice>
          <Input label="Email" name="email" type="email" required autoComplete="email" />
          <Input label="Current password" name="current_password" type="password" required autoComplete="current-password" showPasswordToggle />
          <Input label="New password" name="new_password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" showPasswordToggle />
          <Input label="Confirm password" name="confirm" type="password" required autoComplete="new-password" showPasswordToggle />
          <button className="rg-link rg-primary" disabled={saving}>Update password</button>
        </form>}
    </AuthLayout>
  );
}

