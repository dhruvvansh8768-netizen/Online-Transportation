import AuthLayout from './AuthLayout';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Phone, Car, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { isValidEmail, isValidPhone, normalizePhone, getPasswordStrength } from '../../utils/helpers';

/**
 * SignupRider — rider registration form
 */
const SignupRider = () => {
  const { signupRider, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.email) newErrors.email = 'Email address is required';
    else if (!isValidEmail(form.email)) newErrors.email = 'Please enter a valid email address';

    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!isValidPhone(form.phone)) newErrors.phone = 'Enter a valid 10-digit mobile number (e.g. 9876543210)';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must include at least one letter and one number';
    }

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await signupRider({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizePhone(form.phone),
        password: form.password,
        role: 'rider',
      });
      navigate('/rider');
    } catch (err) {
      // Error handled by context
    }
  };

  const pwStrength = getPasswordStrength(form.password);

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-navy-900" />
            </div>
            <span className="text-2xl font-bold text-white">
              Ride<span className="text-accent">Go</span>
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Sign up as a rider to start booking rides</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
            required
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              showPasswordToggle
              required
            />
            {form.password && (
              <p className={`text-xs mt-1 ${pwStrength.color}`}>
                Strength: {pwStrength.label}
              </p>
            )}
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
            showPasswordToggle
            required
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            iconRight={ArrowRight}
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium">
              Sign In
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Want to drive?{' '}
            <Link to="/signup/driver" className="text-accent hover:text-accent-light font-medium">
              Register as Driver
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupRider;
