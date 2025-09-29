import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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

} from 'lucide-react';
import AnimatedButton from '../../../shared/components/ui/AnimatedButton';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 max-md:hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className={`flex items-center space-x-3 transition-all duration-800 ${isVisible ? 'slide-in-left' : 'opacity-0'}`}>
              <div className="w-40 h-40 flex items-center justify-center">
                <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className={`flex items-center space-x-4 transition-all duration-800 delay-300 ${isVisible ? 'slide-in-right' : 'opacity-0'}`}>
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 px-4 py-2 text-base font-semibold transition-all duration-300 rounded-lg hover:bg-white/50"
              >
                Sign In
              </Link>
              <AnimatedButton
                variant="primary"
                size="md"
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

      {/* Mobile Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 md:hidden">
        <div className=" mx-auto px-5 py-2">
          <div className="flex items-center justify-between">
            {/* Logo on the left */}
            <div className={`flex items-center transition-all duration-800 ${isVisible ? 'slide-in-left' : 'opacity-0'}`}>
              <div className="w-20 h-20 flex items-center justify-center">
                <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            {/* Buttons on the right */}
            <div className={`flex items-center space-x-2 transition-all duration-800 delay-300 ${isVisible ? 'slide-in-right' : 'opacity-0'}`}>
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 px-3 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-white/50"
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
      <section className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-green-300/15 to-emerald-400/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Professional floating elements */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-emerald-200/30 to-green-300/20 rounded-lg rotate-12 animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-32 right-32 w-12 h-12 bg-gradient-to-br from-teal-200/25 to-cyan-300/15 rounded-lg -rotate-6 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-16 w-20 h-20 bg-gradient-to-br from-green-200/20 to-emerald-300/25 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-br from-cyan-200/30 to-teal-300/20 rounded-lg -rotate-12 animate-pulse" style={{ animationDuration: '7s', animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-10 w-10 h-10 bg-gradient-to-br from-emerald-200/25 to-green-300/20 rounded-lg rotate-6 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1.5s' }}></div>

          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-[#1a3d2e] rounded-full text-sm font-semibold mb-8 shadow-lg border border-emerald-200/50">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600 animate-pulse" />
              Next-Generation CVM Platform
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight font-active-grotesk">
              Transform Your <br />
              <span className="text-[#1a3d2e]">
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
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-100 to-green-100 text-[#1a3d2e] font-semibold rounded-xl shadow-lg border border-emerald-200/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:from-emerald-200 hover:to-green-200 hover:animate-slow-bounce"
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4 font-active-grotesk">
              Everything you need to maximize <span className="text-[#1a3d2e]">customer value</span>
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4 font-active-grotesk">
              Powerful <span className="text-[#1a3d2e]">Modules</span> for Every Need
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
                <div key={index} className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer ${index % 2 === 0 ? 'animate-gentle-float' : 'animate-gentle-float-delayed'}`}>
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#1a3d2e]/10 rounded-xl mr-4 group-hover:bg-[#1a3d2e]/20 transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 text-[#1a3d2e] group-hover:text-[#0f2a1f] transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#1a3d2e] transition-colors duration-300">{module.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{module.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {module.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${featureIndex * 100}ms` }}>
                        <div className="w-2 h-2 bg-[#1a3d2e] rounded-full group-hover:bg-[#0f2a1f] group-hover:scale-125 transition-all duration-300"></div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature}</span>
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
      <section className="py-20 bg-[#1a3d2e]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4 font-active-grotesk">
              Trusted by <span className="text-emerald-300">Leading Organizations</span>
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
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
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
            ))}
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 font-active-grotesk">
            Ready to revolutionize your <span className="text-[#1a3d2e]">customer engagement</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Join leading organizations worldwide and start maximizing your customer value today.
            Our team is ready to help you get started with Sentra.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/request-account"
              className="inline-flex items-center px-4 py-2 bg-[#3b8169] hover:bg-[#2d5f4e] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-base"
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-40 h-40 flex items-center justify-center">
                <img src="/src/assets/logo.png" alt="Sentra Logo" className="w-full h-full object-contain" />
              </div>
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