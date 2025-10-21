import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import logo from '../../../assets/logo.png';
import { User as UserType } from '../../../shared/types/auth';
import { tw, components } from '../../../shared/utils/utils';
interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className={`md:hidden rounded-md p-2 ${tw.textSecondary} hover:${tw.textPrimary} hover:${tw.hover} transition-colors`}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-xs sm:max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${tw.textMuted}`} />
            <input
              className={`w-full pl-10 pr-4 py-2 ${components.input.default} ${tw.caption}`}
              placeholder="Search campaigns, products, users..."
              type="search"
              style={{ outline: 'none' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <button
            type="button"
            className={`relative p-2 ${tw.textSecondary} hover:${tw.textPrimary} hover:${tw.hover} rounded-lg transition-colors`}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
              3
            </span>
          </button>

          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div className="hidden sm:block">
                <div className={`${tw.caption} font-medium ${tw.textPrimary}`}>{user?.email || 'User'}</div>
                <div className={`text-xs font-medium leading-[140%] tracking-[0.05em] ${tw.textMuted}`}>Administrator</div>
              </div>
            </div>

            <button
              onClick={logout}
              className={`p-2 ${tw.textSecondary} hover:text-[#821637] hover:${tw.hover} rounded-lg transition-colors`}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}




interface GuestHeaderProps {
  isLoaded?: boolean;
  className?: string;
  onLogout?: () => void;
  showLogo?: boolean;
  showUserInfo?: boolean;
  variant?: 'default' | 'transparent' | 'solid';
}

export function GuestHeader({
  isLoaded = true,
  className = '',
  onLogout,
  showLogo = true,
  showUserInfo = true,
  variant = 'default'
}: GuestHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const getHeaderStyles = () => {
    const baseStyles = "relative z-10 transition-all duration-1000 ease-out";
    const loadedStyles = isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0';

    switch (variant) {
      case 'transparent':
        return `${baseStyles} ${loadedStyles} bg-transparent border-b border-white/10`;
      case 'solid':
        return `${baseStyles} ${loadedStyles} bg-[#0a192f] border-b border-white/20`;
      case 'default':
      default:
        return `${baseStyles} ${loadedStyles} bg-[#0a192f]/90 backdrop-blur-sm border-b border-white/10`;
    }
  };

  return (

    <header className={`${getHeaderStyles()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {showLogo && (
            <div className="flex items-center">
              <div className="w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                <img
                  src={logo}
                  alt="Sentra Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {showUserInfo && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/80">
                {(user as UserType & { email?: string })?.email || 'User'}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
