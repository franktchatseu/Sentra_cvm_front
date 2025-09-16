import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ArrowLeft, Shield, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import AnimatedCard from '../components/ui/AnimatedCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      
      if (error.message?.includes('User not found')) {
        setError('No account found with this email address. Please check your email or request a new account.');
      } else if (error.message?.includes('Account not active')) {
        setError('Your account is not active. Please contact an administrator.');
      } else {
        setError('Failed to send password reset email. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We've sent password reset instructions to <strong>{email}</strong>. 
            Please check your email and follow the link to reset your password.
          </p>
          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#1a3d2e] hover:bg-[#2d5f4e] transition-all duration-200 transform hover:scale-105"
            >
              Back to Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 rounded-full blur-3xl" style={{animation: 'animate-float 8s ease-in-out infinite'}} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl" style={{animation: 'animate-float-delayed 10s ease-in-out infinite'}} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl" style={{animation: 'animate-pulse-slow 6s ease-in-out infinite'}} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-violet-400/8 to-indigo-500/8 rounded-full blur-2xl" style={{animation: 'animate-float 12s ease-in-out infinite reverse'}} />
      </div>

      {/* Left Side - Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 bg-gradient-to-br from-[#1a3d2e] to-[#2d5f4e]">
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-16 w-5 h-5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        
        {/* Main illustration area */}
        <div className="relative">
          {/* Security illustration */}
          <div className="relative">
            {/* Main security card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500 mb-4 w-80">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Reset</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your password reset is protected with enterprise-grade security
                </p>
                
                {/* Security features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Encrypted email delivery</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Time-limited reset links</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Account verification</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 absolute -top-4 -right-8 w-48">
              <div className="text-white text-center">
                <Lock className="w-8 h-8 mb-2 mx-auto" />
                <div className="text-lg font-bold">99.9%</div>
                <div className="text-sm opacity-90">Security Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and description */}
        <div className="text-center text-white mt-16">
          <h1 className="text-4xl font-bold mb-4">
            Secure Password
            <br />
            <span className="text-yellow-300">Recovery</span>
          </h1>
          <p className="text-emerald-100 text-lg font-light max-w-sm">
            Reset your password safely with our secure
            email verification process
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Enhanced Header - Mobile Only */}
          <div className="text-center mb-10 lg:hidden">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 flex items-center justify-center">
                <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-3 tracking-tight">Reset Password</h1>
            <p className="text-slate-600 text-lg font-medium">Enter your email to receive reset instructions</p>
          </div>
          
          {/* Desktop Header */}
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-3 tracking-tight">Reset Password</h1>
            <p className="text-slate-600 text-base font-medium">Enter your email to receive reset instructions</p>
          </div>

          {/* Enhanced Form */}
          <AnimatedCard 
            variant="glass" 
            hover="lift" 
            className="p-10 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500"
          >
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="space-y-2">
                <AnimatedInput
                  type="email"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  placeholder="Enter your email address"
                  label="Email Address"
                  icon={Mail}
                  error={error && !email ? 'Email is required' : ''}
                  required
                />
              </div>

              {/* Submit Button */}
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
                glowEffect
              >
                {!isLoading && (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </AnimatedButton>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-8">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-all duration-300 hover:scale-105 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="font-medium">Back to Login</span>
              </Link>
            </div>

            {/* Enhanced Security Badge */}
            <div className="flex items-center justify-center mt-8 text-sm text-slate-500 group">
              <div className="flex items-center bg-slate-50/80 px-4 py-2 rounded-full border border-slate-200/50 transition-all duration-300 group-hover:bg-slate-100/80 group-hover:border-slate-300/50">
                <Shield className="w-4 h-4 mr-2 text-slate-600 group-hover:text-emerald-600 transition-colors duration-300" />
                <span className="font-medium">Secure password recovery process</span>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
