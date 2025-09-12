import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff, Zap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import AnimatedCard from '../components/ui/AnimatedCard';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    setIsVisible(true);
    
    // Validate that we have the required parameters
    if (!token || !email) {
      setError('Invalid or missing reset parameters. Please request a new password reset.');
    }
  }, [token, email]);

  const validatePasswords = () => {
    setError('');
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords() || !token || !email) {
      return;
    }

    setIsLoading(true);
    
    try {
      await resetPassword(token, email, password);
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      if (error.message?.includes('Invalid token')) {
        setError('This password reset link has expired or is invalid. Please request a new password reset.');
      } else if (error.message?.includes('Token expired')) {
        setError('This password reset link has expired. Please request a new password reset.');
      } else {
        setError('Failed to reset password. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to login page in 3 seconds...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
          >
            Go to Login
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-600 to-purple-700">
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-16 w-5 h-5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        
        {/* Main illustration area */}
        <div className="relative">
          {/* Security illustration */}
          <div className="relative">
            {/* Main security card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500 mb-4 w-80">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">New Password</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Create a strong, secure password for your account
                </p>
                
                {/* Password requirements */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">One uppercase letter</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">One lowercase letter</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">One number</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 absolute -top-4 -right-8 w-48">
              <div className="text-white text-center">
                <Shield className="w-8 h-8 mb-2 mx-auto" />
                <div className="text-lg font-bold">Secure</div>
                <div className="text-sm opacity-90">Password Reset</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and description */}
        <div className="text-center text-white mt-16">
          <h1 className="text-4xl font-bold mb-4">
            Create Your
            <br />
            <span className="text-amber-300">New Password</span>
          </h1>
          <p className="text-indigo-100 text-lg font-light max-w-sm">
            Choose a strong password to keep
            your account secure
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Enhanced Header - Mobile Only */}
          <div className="text-center mb-10 lg:hidden">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-3">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3 tracking-tight">New Password</h1>
            <p className="text-slate-600 text-lg font-medium">Create a secure password for your account</p>
          </div>
          
          {/* Desktop Header */}
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3 tracking-tight">New Password</h1>
            <p className="text-slate-600 text-base font-medium">Create a secure password for your account</p>
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <AnimatedInput
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(value) => setPassword(value)}
                    placeholder="Enter your new password"
                    label="New Password"
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <AnimatedInput
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(value) => setConfirmPassword(value)}
                    placeholder="Confirm your new password"
                    label="Confirm Password"
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !token || !email}
                loading={isLoading}
                className="w-full mt-8"
                glowEffect
              >
                {!isLoading && (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </AnimatedButton>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-8">
              <Link
                to="/login"
                className="text-sm text-slate-500 hover:text-slate-700 transition-all duration-300 hover:scale-105 font-medium"
              >
                Back to Login
              </Link>
            </div>

            {/* Enhanced Security Badge */}
            <div className="flex items-center justify-center mt-8 text-sm text-slate-500 group">
              <div className="flex items-center bg-slate-50/80 px-4 py-2 rounded-full border border-slate-200/50 transition-all duration-300 group-hover:bg-slate-100/80 group-hover:border-slate-300/50">
                <Shield className="w-4 h-4 mr-2 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
                <span className="font-medium">Your new password will be encrypted</span>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
