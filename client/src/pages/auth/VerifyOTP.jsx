import AuthLayout from './AuthLayout';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, RotateCw } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../services/auth.service';

/**
 * VerifyOTP — OTP verification page with 4-digit input
 */
const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, purpose } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on Backspace if empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(''));
      inputRefs.current[3]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyOTP({ email, phone, otp: otpCode, purpose });
      // Navigate based on purpose
      if (purpose === 'reset') {
        navigate('/login', { state: { message: 'Password reset successful' } });
      } else {
        navigate('/login', { state: { message: 'Account verified successfully' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.sendOTP({ email, phone });
      setResendTimer(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-accent" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-2">Verify OTP</h1>
        <p className="text-gray-400 text-sm mb-8">
          We've sent a 4-digit code to{' '}
          <span className="text-white font-medium">{email || phone || 'your contact'}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-16 h-16 text-center text-2xl font-bold rounded-xl
                bg-navy-800 border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-accent/50
                ${digit ? 'border-accent text-accent' : 'border-white/10 text-white'}
                ${error ? 'border-red-400' : ''}
              `}
            />
          ))}
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          loading={loading}
          fullWidth
          size="lg"
          iconRight={ArrowRight}
          className="mb-6"
        >
          Verify OTP
        </Button>

        {/* Resend */}
        <div className="text-sm text-gray-400">
          {resendTimer > 0 ? (
            <p>Resend OTP in <span className="text-accent font-medium">{resendTimer}s</span></p>
          ) : (
            <button
              onClick={handleResend}
              className="text-accent hover:text-accent-light font-medium flex items-center gap-1 mx-auto"
            >
              <RotateCw className="w-4 h-4" />
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
