import React from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white mt-3 mb-5">
      <div className="flex h-20 items-center justify-between ">
        <div className="flex items-center gap-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search campaigns, products, users..."
              type="search"
              style={{ outline: 'none' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <button
            type="button"
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
              3
            </span>
          </button>

          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3b8169] to-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.email || 'User'}</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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