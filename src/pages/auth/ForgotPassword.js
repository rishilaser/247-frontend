import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.forgotPasswordSendOtp(email);
      if (response.data?.success) {
        toast.success(response.data.message || 'OTP sent to your email');
        setStep(2);
      } else {
        toast.error(response.data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.forgotPasswordVerifyOtp(email, otp);
      if (response.data?.success) {
        toast.success('OTP verified');
        setStep(3);
      } else {
        toast.error(response.data?.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.forgotPasswordReset(email, otp, newPassword);
      if (response.data?.success) {
        toast.success('Password reset successful');
        navigate('/login');
      } else {
        toast.error(response.data?.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-200 to-purple-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Forgot Password</h2>
          <p className="text-sm text-gray-600 text-center mt-1">
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && 'Enter OTP sent to your email'}
            {step === 3 && 'Set your new password'}
          </p>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg tracking-[0.3em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="New password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Password must have at least 8 characters, uppercase, lowercase, number, and special character.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center mt-5">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
