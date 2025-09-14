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
  
  LogOut
} from 'lucide-react';
import { CoreModule, CoreModuleCategory } from '../../types/coreModule';
import logo from '../../assets/logo.png';

export default function AuthenticatedLandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const coreModules: CoreModuleCategory[] = [
    {
      id: 'business',
      title: 'Sentra Core Platform Modules',
      modules: [
        {
          id: 'cm',
          code: 'CM',
          name: 'Sentra CM (Campaign Management)',
          description: 'The central module where campaigns are created, scheduled, executed, and tracked.',
          icon: 'target',
          path: '/dashboard/campaigns',
          category: 'business'
        },
        {
          id: 'iq',
          code: 'IQ',
          name: 'Sentra IQ (Customer & Campaign Intelligence)',
          description: 'Analytics, dashboards, predictive scoring, churn risk, and LTV analysis.',
          icon: 'brain',
          path: '/dashboard/analytics',
          category: 'business'
        },
        {
          id: '360',
          code: '360',
          name: 'Sentra 360 (Unified Customer View)',
          description: 'Complete profile with demographics, usage, engagement, and behavioral insights.',
          icon: 'users',
          path: '/dashboard/customers',
          category: 'business'
        },
        {
          id: 'cx',
          code: 'CX',
          name: 'Sentra CX (Experience Management)',
          description: 'Journey orchestration, omnichannel personalization, omni-time triggers.',
          icon: 'zap',
          path: '/dashboard/experiences',
          category: 'business'
        }
      ]
    },
    {
      id: 'execution',
      title: 'Sentra Engagement & Targeting',
      modules: [
        {
          id: 'ct',
          code: 'CT',
          name: 'Sentra CT (Customer Targeting)',
          description: 'Dynamic segmentation, rules-based filters, control groups, and audience building.',
          icon: 'filter',
          path: '/dashboard/segments',
          category: 'execution'
        },
        {
          id: 'engage',
          code: 'Engage',
          name: 'Sentra Engage (Engagement Hub)',
          description: 'Multi-channel orchestration - SMS, Email, Push, and more engagement channels.',
          icon: 'message-square',
          path: '/dashboard/engagement',
          category: 'execution'
        }
      ]
    }
  ];

  const getModuleIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      target: Target,
      brain: Brain,
      users: Users,
      zap: Zap,
      filter: Filter,
      'message-square': MessageSquare
    };
    return iconMap[iconName] || Target;
  };

  const handleModuleClick = (module: CoreModule) => {
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
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
            50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
          }
          
          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-5px) scale(1.02); }
          }
          
          @keyframes slide-sideways {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(8px); }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(3px); }
            75% { transform: translateX(-3px); }
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }
          
          .animate-gentle-bounce {
            animation: gentle-bounce 4s ease-in-out infinite;
          }
          
          .animate-slide-sideways {
            animation: slide-sideways 5s ease-in-out infinite;
          }
          
          .animate-wiggle {
            animation: wiggle 6s ease-in-out infinite;
          }
          
          .shadow-3xl {
            box-shadow: 0 35px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(34,197,94,0.2);
          }
          
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          
          .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }
          
          .email-truncate {
            max-width: 5ch;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          @media (min-width: 640px) {
            .email-truncate {
              max-width: none;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-green-400 rounded-full opacity-30 ${
              isLoaded ? 'animate-float' : 'opacity-0'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`large-${i}`}
            className={`absolute w-4 h-4 bg-blue-300 rounded-full opacity-20 ${
              isLoaded ? 'animate-float' : 'opacity-0'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${20 + Math.random() * 15}s`
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 opacity-20">
        <div 
          className={`absolute inset-0 transition-all duration-2000 ease-out ${
            isLoaded ? 'opacity-20 scale-100' : 'opacity-0 scale-110'
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 20s ease-in-out infinite'
          }} 
        />
      </div>

      <header className={`relative z-10 bg-white text-gray-800 transition-all duration-1000 ease-out ${
        isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20 lg:h-24">
            <div className="flex items-center flex-shrink-0">
              <div className="w-32 h-32 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="Sentra Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className="text-sm text-gray-600 truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-48 email-truncate">
                {user?.email || 'User'}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 text-green-900 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {coreModules.map((category, categoryIndex) => (
            <div 
              key={category.id} 
              className={`mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000 ease-out ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${categoryIndex * 200}ms` }}
            >
              {categoryIndex === 0 && (
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                    {category.title}
                  </h2>
                </div>
              )}

              <div className="flex justify-center">
                <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
                  category.modules.length === 4 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {category.modules.map((module, moduleIndex) => {
                    const IconComponent = getModuleIcon(module.icon);
                    return (
                      <div
                        key={module.id}
                        onClick={() => handleModuleClick(module)}
                        className={`group cursor-pointer transform transition-all duration-700 ease-out hover:scale-110 hover:-translate-y-2 ${
                          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                        }`}
                        style={{ transitionDelay: `${(categoryIndex * 200) + (moduleIndex * 100)}ms` }}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-white to-gray-50 border-4 border-green-800 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl group-hover:border-green-600 transition-all duration-500 ease-in-out group-hover:bg-gradient-to-br group-hover:from-green-50 group-hover:to-white animate-pulse-glow transform group-hover:scale-105 group-hover:-translate-y-1 ${
                            module.id === 'cm' ? 'animate-gentle-bounce' : 
                            module.id === 'iq' ? 'animate-wiggle' : 
                            module.id === '360' ? 'animate-gentle-bounce' : 
                            module.id === 'cx' ? 'animate-wiggle' : 
                            module.id === 'ct' ? 'animate-slide-sideways' : 
                            'animate-gentle-bounce'
                          }`}
                          style={{
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(34,197,94,0.1)'
                          }}>
                            <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-700 group-hover:text-green-700 transition-all duration-500 ease-in-out transform group-hover:scale-110 animate-sparkle ${
                              module.id === 'cm' ? 'animate-wiggle' : 
                              module.id === 'iq' ? 'animate-gentle-bounce' : 
                              module.id === '360' ? 'animate-slide-sideways' : 
                              module.id === 'cx' ? 'animate-gentle-bounce' : 
                              module.id === 'ct' ? 'animate-wiggle' : 
                              'animate-slide-sideways'
                            }`} />
                          </div>
                          
                          <div className="text-center mt-3 sm:mt-4 max-w-xs px-2">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-all duration-500 ease-in-out">
                              {module.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 group-hover:text-gray-700 transition-all duration-500 ease-in-out">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>
    </>
  );
}