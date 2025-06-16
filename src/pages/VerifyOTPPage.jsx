import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const { verifyOTP, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, email, otp: devOtp } = location.state || {};

  // Redirect if no state or already authenticated
  if (!userId || !email) {
    return <Navigate to="/register" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOTP(userId, otpCode);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">StudyMaster</span>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Time remaining: <span className="font-semibold text-primary-600">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner mr-2"></div>
              ) : null}
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button 
                className="text-primary-600 hover:text-primary-500 font-medium"
                onClick={() => toast.info('Resend functionality not implemented yet')}
              >
                Resend
              </button>
            </p>
          </div>

          {/* Development helper */}
          {devOtp && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Development Mode:</strong> OTP is {devOtp}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTPPage;