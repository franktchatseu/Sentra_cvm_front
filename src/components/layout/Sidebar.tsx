import { Link, useLocation } from 'react-router-dom';
import { 
  Zap, 
  Home, 
  Target, 
  Users, 
  MessageSquare, 
  Settings,
  Package
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
    { name: 'Offers', href: '/dashboard/offers', icon: MessageSquare },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Segments', href: '/dashboard/segments', icon: Users },
  ];
  
  const secondaryNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Sentra</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-lg p-2 text-sm font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <ul className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-lg p-2 text-sm font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}