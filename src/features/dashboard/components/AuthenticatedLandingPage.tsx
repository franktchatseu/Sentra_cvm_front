import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { colors } from '../../../shared/utils/tokens';
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
      icon: 'filter',
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
      <FixedBackground variant="landingpage" />

      <div className="min-h-screen relative overflow-hidden">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-6 xl:gap-8 max-w-7xl mx-auto [&>div:last-child:nth-child(3n+1)]:lg:col-start-2">
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
                    <div className="bg-[#394247] border border-gray-600 rounded-2xl transition-all duration-300 ease-out p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden shadow-lg hover:bg-[#4A5257] hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:border-gray-500 group">
                      {/* Icon */}
                      <div className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-transparent border border-gray-500 hover:scale-110 hover:rotate-3 hover:border-gray-400">
                        <IconComponent className={`${colors.iconSizes.lg} text-white`} />
                      </div>

                      {/* Title and Subtitle */}
                      <h3 className="text-base font-bold text-white mb-1 text-center leading-tight">
                        {module.name}
                      </h3>
                      {module.subtitle && (
                        <p className="font-semibold text-sm text-center leading-tight mb-3" style={{ color: colors.primary.accent }}>
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