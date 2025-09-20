import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Target,
  Brain,
  Users,
  Zap,
  Filter,
  MessageSquare,
  Settings,
  ArrowRight,
  BarChart3,
  Heart,
  Send
} from 'lucide-react';
import FixedBackground from '../common/FixedBackground';
import { GuestHeader } from '../layout/Header';

export default function AuthenticatedLandingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const coreModules = [
    {
      id: 'cm',
      code: 'CM',
      name: 'Sentra CM',
      subtitle: 'Campaign Management',
      description: 'The central module where campaigns are created, scheduled, executed, and tracked.',
      icon: 'target',
      path: '/dashboard/campaigns',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'analytics',
      code: 'Analytics',
      name: 'Analytics & Reporting',
      subtitle: 'Data Insights',
      description: 'Gain insights with powerful analytics and customizable reporting tools.',
      icon: 'bar-chart',
      path: '/dashboard/analytics',
      color: 'from-purple-500 to-blue-600'
    },
    {
      id: '360',
      code: '360',
      name: 'Sentra 360',
      subtitle: 'Unified Customer View',
      description: 'Complete profile with demographics, usage, engagement, and behavioral insights.',
      icon: 'users',
      path: '/dashboard/customers',
      color: 'from-purple-500 to-blue-600'
    },
    {
      id: 'xm',
      code: 'XM',
      name: 'Sentra XM',
      subtitle: 'Experience Management',
      description: 'Design, deliver, and optimize customer journeys with integrated experience management.',
      icon: 'heart',
      path: '/dashboard/experiences',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'target',
      code: 'Target',
      name: 'Sentra Target',
      subtitle: 'Customer Segmentation',
      description: 'Advanced targeting with AI-driven segmentation and propensity modeling.',
      icon: 'target',
      path: '/dashboard/segments',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'connect',
      code: 'Connect',
      name: 'Sentra Connect',
      subtitle: 'Engagement Hub',
      description: 'Omnichannel campaign execution with real-time tracking and adaptive optimization.',
      icon: 'send',
      path: '/dashboard/engagement',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'config',
      code: 'Config',
      name: 'Sentra Configuration',
      subtitle: 'Management',
      description: 'System-wide configuration management for all platform modules and settings.',
      icon: 'settings',
      path: '/dashboard/configuration',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  const getModuleIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      target: Target,
      brain: Brain,
      users: Users,
      zap: Zap,
      filter: Filter,
      'message-square': MessageSquare,
      settings: Settings,
      'bar-chart': BarChart3,
      heart: Heart,
      send: Send
    };
    return iconMap[iconName] || Target;
  };

  const handleModuleClick = (module: { path: string }) => {
    navigate(module.path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  return (
    <>
      <style>
        {`
          @keyframes hexagonFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
          }
          
          @keyframes hexagonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .hexagon {
            width: 80px;
            height: 80px;
            position: relative;
            margin: 40px auto;
          }
          
          .hexagon:before,
          .hexagon:after {
            content: "";
            position: absolute;
            width: 0;
            border-left: 40px solid transparent;
            border-right: 40px solid transparent;
          }
          
          .hexagon:before {
            bottom: 100%;
            border-bottom: 23px solid white;
          }
          
          .hexagon:after {
            top: 100%;
            border-top: 23px solid white;
          }
          
          .hexagon-content {
            width: 80px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
          }
          
          .animate-hexagon-float {
            animation: hexagonFloat 4s ease-in-out infinite;
          }
          
          .animate-hexagon-pulse {
            animation: hexagonPulse 3s ease-in-out infinite;
          }
          
          .email-truncate {
            max-width: 5ch;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* Force white color for arrow icons */
          .arrow-white svg {
            color: white !important;
            fill: white !important;
          }
          
          .arrow-white svg:before,
          .arrow-white svg:after {
            color: white !important;
            fill: white !important;
          }
          
          @media (min-width: 640px) {
            .email-truncate {
              max-width: none;
            }
          }
          
          /* Custom 7-module layout */
          .modules-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            max-width: 72rem;
            margin: 0 auto;
          }
          
          .module-card:nth-child(7) {
            grid-column: 2;
            justify-self: center;
          }
          
          @media (max-width: 1024px) {
            .modules-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .module-card:nth-child(7) {
              grid-column: 1 / -1;
              justify-self: center;
              max-width: 50%;
            }
          }
          
          @media (max-width: 640px) {
            .modules-grid {
              grid-template-columns: 1fr;
            }
            .module-card:nth-child(7) {
              grid-column: 1;
              justify-self: stretch;
              max-width: none;
            }
          }
          
        `}
      </style>
      <FixedBackground variant="default" />
      <div className="min-h-screen relative overflow-hidden" >
        {/* Glossy Header */}
        <GuestHeader
          isLoaded={isLoaded}
          onLogout={handleLogout}
          variant="transparent"
        />

        {/* Main Content */}
        <main className="relative z-10 py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-8">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Core Platform
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Discover the powerful modules that make up the Sentra ecosystem.
              </p>
            </div>

            {/* Modules Grid */}
            <div className="modules-grid">
              {coreModules.map((module, index) => {
                const IconComponent = getModuleIcon(module.icon);
                return (
                  <div
                    key={module.id}
                    onClick={() => handleModuleClick(module)}
                    className={`login-card group cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div
                      className=" login-card-content rounded-2xl p-8 hover:bg-[var(--primary-dark-color-hover)] hover:border-white/20 transition-all duration-300 h-full flex flex-col min-w-0"
                    >
                      {/* Hexagonal Icon */}
                      <div className="flex justify-center mb-6">
                        <div className={`hexagon animate-hexagon-float`} style={{ animationDelay: `${index * 0.5}s` }}>
                          <div className={`hexagon-content bg-gradient-to-br ${module.color} animate-hexagon-pulse`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {module.name}
                        </h3>
                        {module.subtitle && (
                          <p className="text-emerald-400 font-semibold mb-3">
                            {module.subtitle}
                          </p>
                        )}
                        <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
                          {module.description}
                        </p>

                        {/* Explore Button */}
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:bg-white/20 mt-auto">
                          <span>Explore Module</span>
                          <ArrowRight className="w-4 h-4 arrow-white group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'white', fill: 'white' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main >
      </div >
    </>
  );
}