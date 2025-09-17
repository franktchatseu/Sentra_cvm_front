import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  Shield, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const goHome = () => {
    window.location.href = '/login';
  };

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error('Password reset request failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('User not found')) {
        setError('No account found with this email address. Please check your email or request a new account.');
      } else if (errorMessage.includes('Account not active')) {
        setError('This account is not active. Please contact an administrator.');
      } else {
        setError('Failed to send reset email. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setIsSubmitted(false);
    setError('');
  };

  return (
    <div className="account-request-page">
      {/* Background elements */}
      <div className="bg-gradients"></div>
      <div className="bg-particles"></div>
      <div className="bg-grid"></div>

      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div className="brand-logo">
            <div className="logo-mark">
              <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="brand-name">Sentra</span>
          </div>
          <button className="btn-back-home" onClick={goHome}>
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Left side - Info */}
            <div className="info-section">
              <div className="info-content">
                <h1 className="page-title">Reset Your Password</h1>
                <p className="page-subtitle">
                  Don't worry, it happens to the best of us. Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Mail size={20} />
                    </div>
                    <span>Secure email verification</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Shield size={20} />
                    </div>
                    <span>Enterprise-grade security</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Lock size={20} />
                    </div>
                    <span>Quick and easy process</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>Instant email delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="form-section">
              <div className="form-card" style={{display: isSubmitted ? 'none' : 'block'}}>
                <div className="form-header">
                  <h2>Password Reset Request</h2>
                  <p>Enter your email address below and we'll send you a secure link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="request-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address <span className="required">*</span></label>
                    <input 
                      id="email" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      type="email" 
                      required
                      placeholder="your@email.com"
                      className={error ? 'invalid' : ''}
                    />
                    <span className="error-message" style={{display: error ? 'block' : 'none'}}>
                      {error}
                    </span>
                  </div>

                  <div className="form-navigation">
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                      {!isLoading ? 'Send Reset Link' : (
                        <span className="loading-content">
                          <div className="loading-spinner"></div>
                          Sending...
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Success Message */}
              <div className="success-card" style={{display: isSubmitted ? 'block' : 'none'}}>
                <div className="success-content">
                  <div className="success-icon">
                    <CheckCircle2 size={80} />
                  </div>
                  <h2>Reset Email Sent!</h2>
                  <p>
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Please check your email and click the link to reset your password.
                  </p>
                  <div className="success-actions">
                    <button className="btn-primary" onClick={resetForm}>
                      Send Another Email
                    </button>
                    <button className="btn-secondary" onClick={goHome}>
                      <ArrowLeft size={18} />
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}