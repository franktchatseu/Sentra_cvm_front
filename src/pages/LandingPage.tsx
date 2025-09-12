import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Target, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Sparkles,
  CheckCircle,
  Play,
  Star,
  TrendingUp,
  Globe,
  Layers
} from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      icon: Target,
      title: "Campaign Management",
      description: "Design, execute, and monitor sophisticated customer engagement campaigns with precision targeting and real-time optimization.",
      features: ["Multi-channel campaigns", "A/B testing", "Performance tracking", "Campaign templates"]
    },
    {
      icon: MessageSquare,
      title: "Offer Management",
      description: "Create and manage personalized offers with dynamic eligibility rules and multi-language support for maximum customer engagement.",
      features: ["Dynamic offers", "Eligibility rules", "Multi-language support", "Product integration"]
    },
    {
      icon: Users,
      title: "Segment Management",
      description: "Build dynamic customer segments using advanced behavioral data and real-time event triggers for precise targeting.",
      features: ["Dynamic segmentation", "Real-time updates", "Behavioral targeting", "Custom audiences"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Deep insights into campaign performance, customer behavior, and ROI with comprehensive dashboards and custom reports.",
      features: ["Real-time analytics", "Custom dashboards", "ROI tracking", "Predictive insights"]
    }
  ];

  const features = [
    "Advanced customer segmentation and targeting",
    "Multi-channel campaign orchestration",
    "Real-time performance monitoring and optimization",
    "Automated offer personalization and delivery",
    "Comprehensive analytics and reporting suite",
    "Enterprise-grade security and compliance"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className={`flex items-center space-x-3 transition-all duration-800 ${isVisible ? 'slide-in-left' : 'opacity-0'}`}>
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-lg">
                  <Zap className="w-7 h-7 text-white animate-pulse-slow" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl blur opacity-30 animate-pulse-slow"></div>
              </div>
              <span className="text-2xl font-bold text-gradient">Sentra</span>
            </div>
            <div className={`flex items-center space-x-4 transition-all duration-800 delay-300 ${isVisible ? 'slide-in-right' : 'opacity-0'}`}>
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-white/50"
              >
                Sign In
              </Link>
              <AnimatedButton
                variant="primary"
                size="sm"
                glowEffect
                icon={ArrowRight}
                onClick={() => window.location.href = '/request-account'}
              >
                Request Access
              </AnimatedButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation CVM Platform
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Customer Value Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Sentra empowers businesses to create, manage, and optimize customer engagement campaigns 
              with precision targeting, real-time analytics, and automated personalization at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/request-account"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to maximize customer value
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and insights needed 
              to drive customer engagement and business growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-gray-700 leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Modules for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive suite of modules designed to optimize 
              every aspect of your customer value management strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl mr-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{module.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{module.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {module.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by Leading Organizations
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of businesses using Sentra to drive customer engagement and growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: "500K+", label: "Campaigns Executed" },
              { value: "2.5M+", label: "Customers Reached" },
              { value: "98.5%", label: "Platform Uptime" },
              { value: "45%", label: "Average ROI Increase" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to revolutionize your customer engagement?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Join leading organizations worldwide and start maximizing your customer value today. 
            Our team is ready to help you get started with Sentra.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/request-account"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Shield className="mr-2 h-5 w-5" />
              Existing User? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Sentra</span>
            </div>
            <div className="text-gray-400">
              <p>&copy; 2025 Sentra CVM Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}