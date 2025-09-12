import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 lg:mx-0 lg:px-0">
      <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="block h-full w-full border-0 bg-gray-50 py-0 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm rounded-lg"
              placeholder="Search campaigns, offers, segments..."
              type="search"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:flex lg:flex-col">
              <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}