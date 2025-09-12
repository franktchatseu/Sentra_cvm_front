import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Zap, Shield, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import AnimatedCard from '../components/ui/AnimatedCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      setPasswordError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 to-blue-700">
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-16 w-5 h-5 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-10 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        {/* Main illustration area */}
        <div className="relative">
          {/* Dashboard mockup cards */}
          <div className="relative">
            {/* Main card */}
            <div 
              className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 mb-4 w-80"
              style={{
                animation: 'card-float 6s ease-in-out infinite'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Revenue Growth</span>
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold text-gray-800"
                    style={{
                      animation: 'number-count 2s ease-out forwards'
                    }}
                  >
                    +24.5%
                  </div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Revenue Growth</span>
                  <span 
                    className="text-gray-800 font-semibold"
                    style={{
                      animation: 'number-count 2.5s ease-out forwards'
                    }}
                  >
                    $1.2M
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-600">Engagement</span>
                    <span 
                      className="text-gray-800 font-semibold"
                      style={{
                        animation: 'number-count 3s ease-out forwards'
                      }}
                    >
                      87%
                    </span>
                  </div>
                  <div className="flex space-x-1 h-8">
                    <div 
                      className="bg-blue-200 rounded w-2 h-4 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.1s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-300 rounded w-2 h-6 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.2s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-400 rounded w-2 h-8 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.3s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-500 rounded w-2 h-5 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.4s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-400 rounded w-2 h-7 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.5s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-300 rounded w-2 h-3 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.6s'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-600 rounded w-2 h-6 self-end"
                      style={{
                        animation: 'chart-grow 1.5s ease-out forwards',
                        animationDelay: '0.7s'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.8s ease-out forwards',
                      animationDelay: '1s'
                    }}
                  >
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.8s ease-out forwards',
                      animationDelay: '1.2s'
                    }}
                  >
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.8s ease-out forwards',
                      animationDelay: '1.4s'
                    }}
                  >
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.8s ease-out forwards',
                      animationDelay: '1.6s'
                    }}
                  >
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary card */}
            <div 
              className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 absolute -top-4 -right-8 w-48"
              style={{
                animation: 'card-float-reverse 7s ease-in-out infinite'
              }}
            >
              <div className="text-white">
                <Users className="w-8 h-8 mb-2 animate-pulse" />
                <div 
                  className="text-xl font-bold"
                  style={{
                    animation: 'number-count 2.2s ease-out forwards'
                  }}
                >
                  1,247
                </div>
                <div className="text-sm opacity-90 mb-3">Active Users</div>
                
                {/* Mini user avatars */}
                <div className="flex -space-x-2">
                  <div 
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.6s ease-out forwards',
                      animationDelay: '1.8s'
                    }}
                  >
                    <span className="text-xs font-semibold">JD</span>
                  </div>
                  <div 
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.6s ease-out forwards',
                      animationDelay: '2s'
                    }}
                  >
                    <span className="text-xs font-semibold">AM</span>
                  </div>
                  <div 
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.6s ease-out forwards',
                      animationDelay: '2.2s'
                    }}
                  >
                    <span className="text-xs font-semibold">KL</span>
                  </div>
                  <div 
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      animation: 'avatar-pop 0.6s ease-out forwards',
                      animationDelay: '2.4s'
                    }}
                  >
                    <span className="text-xs font-semibold">+9</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Third card */}
            <div 
              className="bg-white rounded-2xl p-4 shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-500 absolute -bottom-6 -left-6 w-56"
              style={{
                animation: 'card-float-subtle 8s ease-in-out infinite'
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Analytics</div>
                  <div className="text-sm text-gray-600">Real-time data</div>
                </div>
              </div>
              
              {/* Mini chart visualization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Engagement</span>
                  <span 
                    className="font-semibold text-gray-800"
                    style={{
                      animation: 'number-count 2.8s ease-out forwards'
                    }}
                  >
                    87%
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div 
                    className="w-2 h-8 bg-blue-200 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '0.8s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-12 bg-blue-400 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '1s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-6 bg-blue-300 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '1.2s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-14 bg-blue-500 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '1.4s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-10 bg-blue-400 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '1.6s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-16 bg-blue-600 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '1.8s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-8 bg-blue-300 rounded-sm"
                    style={{
                      animation: 'chart-grow 1.8s ease-out forwards',
                      animationDelay: '2s'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and description */}
        <div className="text-center text-white mt-16">
          <h1 className="text-4xl font-bold mb-4">
            Transform Your
            <br />
            <span className="text-yellow-300">Customer Experience</span>
          </h1>
          <p className="text-blue-100 text-lg font-light max-w-sm">
            Advanced CVM platform that delivers
            real insights and drives growth
          </p>
          
          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-slate-600 text-lg font-medium">Sign in to your Sentra CVM account</p>
          </div>
          
          {/* Desktop Header */}
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-slate-600 text-base font-medium">Sign in to your account</p>
          </div>

        {/* Enhanced Login Form */}
        <AnimatedCard 
          variant="glass" 
          hover="lift" 
          className="p-10 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <AnimatedInput
                type="email"
                value={email}
                onChange={(value) => setEmail(value)}
                placeholder="Enter your email"
                label="Email Address"
                icon={Mail}
                error={emailError}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <AnimatedInput
                type="password"
                value={password}
                onChange={(value) => setPassword(value)}
                placeholder="Enter your password"
                label="Password"
                icon={Lock}
                error={passwordError}
                required
              />
            </div>


            {/* Enhanced Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center group">
                <div className="relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 border-slate-300 rounded-md transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400"
                  />
                </div>
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-700 cursor-pointer group-hover:text-slate-900 transition-all duration-200">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-300 hover:underline decoration-2 underline-offset-2 hover:scale-105"
              >
                Forgot password?
              </Link>
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </AnimatedButton>
          </form>

          {/* Enhanced Sign Up Link */}
          <div className="text-center mt-10">
            <p className="text-slate-600 text-base">
              Don't have an account?{' '}
              <Link
                to="/request-account"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 hover:underline decoration-2 underline-offset-2 hover:scale-105 inline-block"
              >
                Request Access
              </Link>
            </p>
          </div>

          {/* Enhanced Security Badge */}
          <div className="flex items-center justify-center mt-8 text-sm text-slate-500 group">
            <div className="flex items-center bg-slate-50/80 px-4 py-2 rounded-full border border-slate-200/50 transition-all duration-300 group-hover:bg-slate-100/80 group-hover:border-slate-300/50">
              <Shield className="w-4 h-4 mr-2 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
              <span className="font-medium">Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Enhanced Back to Landing */}
        <div className="text-center mt-8">
          <Link
            to="/landing"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-all duration-300 hover:scale-105 group"
          >
            <span className="mr-2 transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span className="font-medium">Back to Sentra Home</span>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}