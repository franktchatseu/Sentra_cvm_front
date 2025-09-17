import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  
  const { login } = useAuth();

  const validateEmail = () => {
    if (!email) {
      setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
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
      setValidationErrors(prev => ({ ...prev, password: '' }));
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
      // Login successful - user will be redirected by auth context
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Invalid credentials')) {
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('Account not active')) {
        setErrorMessage('Your account is not active. Please contact an administrator.');
      } else if (errorMessage.includes('Account pending')) {
        setErrorMessage('Your account request is still pending approval. You will receive an email once approved.');
      } else if (errorMessage.includes('Password reset required')) {
        setErrorMessage('A password reset is required. Please check your email for reset instructions.');
      } else {
        setErrorMessage('Login failed. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const scrollToFeatures = () => {
    // Scroll to features section if it exists
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToAccountRequest = () => {
    // Navigate to account request page
    window.location.href = '/request-account';
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
            <div className="brand-mark" aria-hidden="true">
              <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-16 h-16 object-contain" />
                </div>
              </div>
          <button className="tour-btn mobile-tour-btn" onClick={scrollToFeatures}>
            <PlayCircle size={16} />
            Take a tour
          </button>
                </div>
                
        {/* Left hero area */}
        <section className="hero">
          <div className="brand desktop-brand">
            <div className="brand-mark" aria-hidden="true">
              <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-20 h-20 object-contain" />
                  </div>
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
              <div className="form-message error" style={{display: errorMessage ? 'flex' : 'none'}}>
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
                  <Mail className="input-icon" size={18} />
                </div>
                <p className="error-message" style={{display: validationErrors.email ? 'block' : 'none'}}>
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
                  <Lock className="input-icon" size={18} />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="error-message" style={{display: validationErrors.password ? 'block' : 'none'}}>
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
                <a 
                  href="/forgot-password" 
                  className="forgot-password"
                >
                  Forgot password?
                </a>
            </div>

              <button 
              type="submit"
                className="login-button" 
                disabled={isLoading || !isFormValid}
              >
                {!isLoading ? 'Sign in' : <span className="loading-spinner"></span>}
              </button>
              
              <div className="request-account">
                Don't have an account?{' '}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  goToAccountRequest();
                }}>
                  Make a request
                </a>
            </div>
            </form>
          </div>
        </section>
      </div>

    </div>
  );
}