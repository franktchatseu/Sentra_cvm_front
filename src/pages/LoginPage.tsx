import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle 
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!emailRegex.test(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    } else {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
      return true;
    }
  };

  const validatePassword = () => {
    if (!password) {
      setValidationErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    } else if (password.length < 6) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    } else {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
      return true;
    }
  };

  const isFormValid = email && password && !validationErrors.email && !validationErrors.password;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || !validatePassword()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(email, password);
      navigate('/landingpage');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetLink = async () => {
    if (!resetEmail) return;

    setIsResetLoading(true);
    setResetErrorMessage('');

    try {
      await requestPasswordReset(resetEmail);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResetErrorMessage(errorMessage);
    } finally {
      setIsResetLoading(false);
    }
  };

  const goToAccountRequest = () => {
    navigate('/request-account');
  };

  const scrollToFeatures = () => {
    // Scroll to features section if it exists, otherwise do nothing
    console.log('Take a tour clicked');
  };

  return (
    <div className="sentra-landing">
      {/* Decorative background */}
      <div className="bg-gradients"></div>
      <div className="bg-hex"></div>

      <div className="content-wrap">
        {/* Mobile Header (visible only on small screens) */}
        <div className="mobile-header">
          <div className="brand">
            <h1 className="brand-name">Sentra</h1>
          </div>
          <button className="tour-btn mobile-tour-btn" onClick={scrollToFeatures}>
            <PlayCircle size={16} />
            Take a tour
          </button>
        </div>

        {/* Left hero area */}
        <section className="hero">
          <div className="brand desktop-brand">
            <h1 className="brand-name">Sentra</h1>
          </div>

          <h2 className="headline">Engage, Predict, Grow</h2>
          <p className="subhead">
            The intelligent customer engagement platform. Create impactful campaigns, understand your audience, and act in real time.
          </p>

          <ul className="benefits">
            <li>
              <CheckCircle2 size={18} />
              Predictive insights, beautifully visualized
            </li>
            <li>
              <CheckCircle2 size={18} />
              Unified customer data platform
            </li>
            <li>
              <CheckCircle2 size={18} />
              Advanced campaign automation
            </li>
          </ul>

          <div className="cta-section">
            <button className="tour-btn" onClick={scrollToFeatures}>
              <PlayCircle size={16} />
              Take a tour
            </button>
          </div>
        </section>

        {/* Right login area */}
        <section className="login-section">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-container">
                <h2 className="login-title">Sign in to Sentra</h2>
              </div>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-message error" style={{ display: errorMessage ? 'flex' : 'none' }}>
                <AlertCircle size={18} />
                {errorMessage}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email" 
                    required
                    placeholder="votre-email@example.com"
                    className={validationErrors.email ? 'error-input' : ''}
                    onBlur={validateEmail}
                  />
                  {/* <Mail className="input-icon" size={18} style={{ paddingRight: '5px' }} /> */}
                </div>
                <p className="error-message" style={{ display: validationErrors.email ? 'block' : 'none' }}>
                  {validationErrors.email}
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="Your password"
                    className={validationErrors.password ? 'error-input' : ''}
                    onBlur={validatePassword}
                  />
                  {/* <Lock className="input-icon" size={18} style={{ paddingRight: '5px' }} /> */}
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="error-message" style={{ display: validationErrors.password ? 'block' : 'none' }}>
                  {validationErrors.password}
                </p>
              </div>
              
              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>
                  Forgot password?
                </a>
              </div>
              
              <button type="submit" className="login-button" disabled={isLoading || !isFormValid}>
                {!isLoading ? 'Sign in' : <span className="loading-spinner"></span>}
              </button>
              
              <div className="request-account">
                Don't have an account? 
                <a href="#" onClick={(e) => { e.preventDefault(); goToAccountRequest(); }}>Make a request</a>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForgotPassword(false); }}>
          <div className="modal-container">
            <div className="modal-header">
              <h2>Password Reset</h2>
              <button className="btn-close" onClick={() => setShowForgotPassword(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="form-message success" style={{ display: resetEmailSent ? 'flex' : 'none' }}>
                <CheckCircle size={18} />
                A reset email has been sent. Please check your inbox.
              </div>
              
              <div className="form-message error" style={{ display: resetErrorMessage ? 'flex' : 'none' }}>
                <AlertCircle size={18} />
                {resetErrorMessage}
              </div>
              
              <div className="form-group">
                <label htmlFor="resetEmail">Email <span className="required">*</span></label>
                <input 
                  id="resetEmail" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  type="email" 
                  required
                  placeholder="your-email@example.com"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowForgotPassword(false)}>Cancel</button>
              <button 
                className="btn-send" 
                onClick={sendResetLink} 
                disabled={isResetLoading || !resetEmail}
              >
                {!isResetLoading ? 'Send Link' : <span className="loading-spinner small"></span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;