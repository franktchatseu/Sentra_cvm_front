import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Building, Phone, MessageSquare, ArrowRight, CheckCircle, Zap, Target, Award, Briefcase, Users } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

export default function RequestAccountPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const { createUser } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Map role to API expected values - default to 'user' for all non-admin roles
      const apiRole = formData.role === 'admin' ? 'admin' : 'user';
      
      await createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: apiRole
      });
      
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Account request failed:', error);
      
      if (error.message?.includes('Email already exists')) {
        setError('An account with this email already exists. Please try logging in or use a different email.');
      } else if (error.message?.includes('Invalid email')) {
        setError('Please provide a valid business email address.');
      } else {
        setError('Failed to submit account request. Please try again or contact support.');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your interest in Sentra. We've received your account request and will review it within 24-48 hours. 
            You'll receive an email confirmation once your account is approved.
          </p>
          <Link
            to="/landing"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
          >
            Back to Home
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
        <div className="absolute top-1/2 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        {/* Main illustration area */}
        <div className="relative">
          {/* Success metrics cards */}
          <div className="relative">
            {/* Main card */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500 mb-4 w-80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Success Rate</span>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">98.7%</div>
              <div className="text-sm text-gray-600 mb-4">Account approvals</div>
              
              {/* Mini success visualization */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JA</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Join & Access</div>
                    <div className="text-xs text-gray-500">Fast approval process</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Processing Time</span>
                    <span className="text-emerald-600 font-semibold">&lt; 24h</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 absolute -top-4 -right-8 w-48">
              <div className="text-white">
                <Briefcase className="w-8 h-8 mb-2" />
                <div className="text-xl font-bold">2,847</div>
                <div className="text-sm opacity-90 mb-3">Active Companies</div>
                
                {/* Mini company logos */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold">TC</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold">MS</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold">+K</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Third card */}
            <div className="bg-white rounded-2xl p-4 shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-500 absolute -bottom-6 -left-6 w-56">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Team Growth</div>
                  <div className="text-sm text-gray-600">Monthly signups</div>
                </div>
              </div>
              
              {/* Mini growth chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">New Teams</span>
                  <span className="font-semibold text-gray-800">+127</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-6 bg-purple-200 rounded-sm"></div>
                  <div className="w-2 h-10 bg-purple-400 rounded-sm"></div>
                  <div className="w-2 h-4 bg-purple-300 rounded-sm"></div>
                  <div className="w-2 h-12 bg-purple-500 rounded-sm"></div>
                  <div className="w-2 h-8 bg-purple-400 rounded-sm"></div>
                  <div className="w-2 h-14 bg-purple-600 rounded-sm"></div>
                  <div className="w-2 h-10 bg-purple-500 rounded-sm"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Jan</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and description */}
        <div className="text-center text-white mt-16">
          <h1 className="text-4xl font-bold mb-4">
            Join Thousands of
            <br />
            <span className="text-amber-300">CVM Professionals</span>
          </h1>
          <p className="text-indigo-100 text-lg font-light max-w-sm">
            Get approved in under 24 hours and start
            transforming your customer experience
          </p>
          
          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <div className={`w-full max-w-lg transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header - Mobile Only */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Account Access</h1>
            <p className="text-gray-600">
              Join thousands of professionals using Sentra
            </p>
          </div>
          
          {/* Desktop Header */}
          <div className="text-center mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Account Access</h1>
            <p className="text-gray-600">
              Join thousands of professionals using Sentra
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
            </div>

            {/* Company and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              >
                <option value="">Select your role</option>
                <option value="admin">Administrator</option>
                <option value="marketing-manager">Marketing Manager</option>
                <option value="campaign-manager">Campaign Manager</option>
                <option value="data-analyst">Data Analyst</option>
                <option value="operations-manager">Operations Manager</option>
                <option value="business-analyst">Business Analyst</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Tell us about your use case or any specific requirements..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
          </div>

          {/* Back to Landing */}
          <div className="text-center mt-6">
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