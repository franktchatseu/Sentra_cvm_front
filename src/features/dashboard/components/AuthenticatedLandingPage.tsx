import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
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
import FixedBackground from '../../../shared/components/FixedBackground';
import { GuestHeader } from './Header';

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
      color: 'from-teal-500 to-emerald-600',
      iconColor: 'blue'
    },
    {
      id: 'analytics',
      code: 'Analytics',
      name: 'Analytics & Reporting',
      subtitle: 'Data Insights',
      description: 'Gain insights with powerful analytics and customizable reporting tools.',
      icon: 'bar-chart',
      path: '/dashboard/analytics',
      color: 'from-purple-500 to-blue-600',
      iconColor: 'cyan'
    },
    {
      id: '360',
      code: '360',
      name: 'Sentra 360',
      subtitle: 'Unified Customer View',
      description: 'Complete profile with demographics, usage, engagement, and behavioral insights.',
      icon: 'users',
      path: '/dashboard/customers',
      color: 'from-purple-500 to-blue-600',
      iconColor: 'teal'
    },
    {
      id: 'xm',
      code: 'XM',
      name: 'Sentra XM',
      subtitle: 'Experience Management',
      description: 'Design, deliver, and optimize customer journeys with integrated experience management.',
      icon: 'heart',
      path: '/dashboard/experiences',
      color: 'from-orange-500 to-red-600',
      iconColor: 'emerald'
    },
    {
      id: 'target',
      code: 'Target',
      name: 'Sentra Target',
      subtitle: 'Customer Segmentation',
      description: 'Advanced targeting with AI-driven segmentation and propensity modeling.',
      icon: 'target',
      path: '/dashboard/segments',
      color: 'from-red-500 to-pink-600',
      iconColor: 'green'
    },
    {
      id: 'connect',
      code: 'Connect',
      name: 'Sentra Connect',
      subtitle: 'Engagement Hub',
      description: 'Omnichannel campaign execution with real-time tracking and adaptive optimization.',
      icon: 'send',
      path: '/dashboard/engagement',
      color: 'from-blue-500 to-cyan-600',
      iconColor: 'indigo'
    },
    {
      id: 'config',
      code: 'Config',
      name: 'Sentra Configuration',
      subtitle: 'Management',
      description: 'System-wide configuration management for all platform modules and settings.',
      icon: 'settings',
      path: '/dashboard/configuration',
      color: 'from-gray-500 to-slate-600',
      iconColor: 'slate'
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
          
          .module-card-container {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(255, 255, 255, 0.05) 100%);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 220px;
            position: relative;
            overflow: hidden;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .module-card-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.4), 
              transparent);
          }
          
          .module-card-container:hover {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.2) 0%, 
              rgba(255, 255, 255, 0.1) 100%);
            transform: scale(1.05) translateY(-8px);
            box-shadow: 
              0 20px 40px rgba(58, 90, 64, 0.2),
              0 8px 32px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
          }
          
          .module-icon {
            width: 56px;
            height: 56px;
            margin-bottom: 16px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
              0 8px 16px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .module-icon::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.5), 
              transparent);
          }
          
          .module-icon:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 
              0 12px 20px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
          }
          
          /* Icon color variants */
          .module-icon.blue {
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          }
          
          .module-icon.green {
            background: linear-gradient(135deg, #10B981, #047857);
          }
          
          .module-icon.teal {
            background: linear-gradient(135deg, #14B8A6, #0D9488);
          }
          
          .module-icon.emerald {
            background: linear-gradient(135deg, #059669, #047857);
          }
          
          .module-icon.cyan {
            background: linear-gradient(135deg, #06B6D4, #0891B2);
          }
          
          .module-icon.indigo {
            background: linear-gradient(135deg, #6366F1, #4F46E5);
          }
          
          .module-icon.slate {
            background: linear-gradient(135deg, #64748B, #475569);
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
          
          /* Modules grid - 3 cards per line */
          .modules-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
            max-width: 80rem;
            margin: 0 auto;
          }
          
          @media (min-width: 640px) {
            .modules-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 1.5rem;
            }
          }
          
          @media (min-width: 1024px) {
            .modules-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 1.5rem;
            }
          }
          
          /* Keep 3 columns even on larger screens for better visual balance */
          @media (min-width: 1280px) {
            .modules-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 2rem;
            }
          }
          
          /* Center the last card when it's alone in the row */
          .modules-grid > div:last-child:nth-child(3n+1) {
            grid-column: 2;
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
                    className={`group cursor-pointer transform transition-all duration-500 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Module Card Container */}
                    <div className="module-card-container">
                      {/* Icon */}
                      <div className={`module-icon ${module.iconColor}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>

                      {/* Title and Subtitle */}
                      <h3 className="text-base font-bold text-white mb-1 text-center leading-tight">
                        {module.name}
                      </h3>
                      {module.subtitle && (
                        <p className="text-green-300 font-semibold text-sm text-center leading-tight mb-3">
                          {module.subtitle}
                        </p>
                      )}

                      {/* Description Inside Card */}
                      <p className="text-white/80 text-sm leading-relaxed text-center">
                        {module.description}
                      </p>
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