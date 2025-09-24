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
          @keyframes cardFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          
          @keyframes cardPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          .hexagon-card {
            width: 160px;
            height: 160px;
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border: 3px solid #3A5A40;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            margin: 0 auto;
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            padding: 20px;
          }
          
          .hexagon-card:hover {
            border-color: #2f4a35;
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(58, 90, 64, 0.3);
          }
          
          .hexagon-icon {
            width: 45px;
            height: 45px;
            position: relative;
            margin: 20px auto 15px auto;
            background: linear-gradient(135deg, #f97316, #ea580c);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          }
          
          .animate-card-float {
            animation: cardFloat 4s ease-in-out infinite;
          }
          
          .animate-card-pulse {
            animation: cardPulse 3s ease-in-out infinite;
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
            max-width: 80rem;
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
                    className={`module-card group cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Hexagonal Shape with Heading Inside */}
                      <div className="hexagon-card mb-12 flex flex-col items-center justify-center">
                        <h3 className="text-base font-bold text-white mb-2 text-center leading-tight">
                          {module.name}
                        </h3>
                        {module.subtitle && (
                          <p className="text-green-300 font-semibold text-sm text-center leading-tight">
                            {module.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Description Below Hexagon */}
                      <div className="text-center my-3">
                        <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                          {module.description}
                        </p>
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