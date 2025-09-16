import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { 
  Home, 
  Target, 
  Users, 
  MessageSquare, 
  Settings,
  Package,
  FolderOpen,
  UserCheck,
  ChevronDown,
  ChevronRight,
  X,
  Cog,
  Tag,
  Layers
} from 'lucide-react';
import logo from '../../assets/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'single' | 'parent';
  children?: NavigationItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['campaign management']);
  
  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      type: 'single'
    },
    { 
      name: 'Campaign Management', 
      href: '/dashboard/campaigns', 
      icon: Target,
      type: 'parent',
      children: [
        { name: 'All Campaigns', href: '/dashboard/campaigns', icon: Target, type: 'single' },
        { name: 'Segments', href: '/dashboard/segments', icon: Users, type: 'single' },
        { 
          name: 'Offer Configuration', 
          href: '/dashboard/offers', 
          icon: MessageSquare,
          type: 'parent',
          children: [
            { name: 'All Offers', href: '/dashboard/offers', icon: MessageSquare, type: 'single' },
            { name: 'Offer Types', href: '/dashboard/offer-types', icon: Tag, type: 'single' },
            { name: 'Offer Categories', href: '/dashboard/offer-categories', icon: FolderOpen, type: 'single' },
          ]
        },
        { 
          name: 'Product Configuration', 
          href: '/dashboard/products', 
          icon: Package,
          type: 'parent',
          children: [
            { name: 'All Products', href: '/dashboard/products', icon: Package, type: 'single' },
            { name: 'Product Types', href: '/dashboard/product-types', icon: Layers, type: 'single' },
            { name: 'Product Categories', href: '/dashboard/product-categories', icon: FolderOpen, type: 'single' },
          ]
        },
      ]
    },
    { 
      name: 'User Management', 
      href: '/dashboard/user-management', 
      icon: UserCheck,
      type: 'single'
    },
    { 
      name: 'Configuration', 
      href: '/dashboard/configuration', 
      icon: Cog,
      type: 'single'
    },
  ];
  
  const secondaryNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, type: 'single' },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavigationItem) => {
    if (item.type === 'parent') {
      return item.children?.some((child: NavigationItem) => location.pathname === child.href) || 
             location.pathname === item.href;
    }
    return location.pathname === item.href;
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-gradient-to-b from-gray-50 to-white shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <div className="flex items-center space-x-3">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={logo} alt="Sentra Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  
                  const isActive = isItemActive(item);
                  const isExpanded = expandedItems.includes(item.name.toLowerCase());
                  
                  if (item.type === 'parent') {
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => toggleExpanded(item.name.toLowerCase())}
                          className={`group w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm'
                              : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-x-3">
                            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                          {item.name}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="mt-2 ml-6 space-y-2">
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = location.pathname === child.href;
                              
                              // Check if child has its own children (nested dropdown)
                              if (child.type === 'parent' && child.children) {
                                const isChildExpanded = expandedItems.includes(child.name.toLowerCase());
                                return (
                                  <div key={child.name}>
                                    <button
                                      onClick={() => toggleExpanded(child.name.toLowerCase())}
                                      className={`group w-full flex items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                        isChildActive
                                          ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                          : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-x-3">
                                        <ChildIcon className={`h-4 w-4 shrink-0 ${isChildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                        {child.name}
                                      </div>
                                      {isChildExpanded ? (
                                        <ChevronDown className="h-3 w-3 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                      )}
                                    </button>
                                    
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                      isChildExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                      <div className="mt-2 ml-6 space-y-2">
                                        {child.children?.map((grandchild) => {
                                          const GrandchildIcon = grandchild.icon;
                                          const isGrandchildActive = location.pathname === grandchild.href;
                                          return (
                                            <Link
                                              key={grandchild.name}
                                              to={grandchild.href}
                                              onClick={handleLinkClick}
                                              className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                                isGrandchildActive
                                                  ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                                  : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                              }`}
                                            >
                                              <GrandchildIcon className={`h-4 w-4 shrink-0 ${isGrandchildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                              {grandchild.name}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Regular child item (no nested children)
                              return (
                                <Link
                                  key={child.name}
                                  to={child.href}
                                  onClick={handleLinkClick}
                                  className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                    isChildActive
                                      ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                      : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <ChildIcon className={`h-4 w-4 shrink-0 ${isChildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm'
                          : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 px-6 py-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src={logo} alt="Sentra Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              <li>
                <ul className="space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item);
                    const isExpanded = expandedItems.includes(item.name.toLowerCase());
                    
                    if (item.type === 'parent') {
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => toggleExpanded(item.name.toLowerCase())}
                            className={`group w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                              isActive
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm'
                                : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-x-3">
                              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                              {item.name}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <ul className="mt-2 ml-6 space-y-2">
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = location.pathname === child.href;
                              
                              // Check if child has its own children (nested dropdown)
                              if (child.type === 'parent' && child.children) {
                                const isChildExpanded = expandedItems.includes(child.name.toLowerCase());
                                return (
                                  <li key={child.name}>
                                    <button
                                      onClick={() => toggleExpanded(child.name.toLowerCase())}
                                      className={`group w-full flex items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                        isChildActive
                                          ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                          : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-x-3">
                                        <ChildIcon className={`h-4 w-4 shrink-0 ${isChildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                        {child.name}
                                      </div>
                                      {isChildExpanded ? (
                                        <ChevronDown className="h-3 w-3 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                      )}
                                    </button>
                                    
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                      isChildExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                      <ul className="mt-2 ml-6 space-y-2">
                                        {child.children?.map((grandchild) => {
                                          const GrandchildIcon = grandchild.icon;
                                          const isGrandchildActive = location.pathname === grandchild.href;
                                          return (
                                            <li key={grandchild.name}>
                                              <Link
                                                to={grandchild.href}
                                                onClick={handleLinkClick}
                                                className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                                  isGrandchildActive
                                                    ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                                    : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                                }`}
                                              >
                                                <GrandchildIcon className={`h-4 w-4 shrink-0 ${isGrandchildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                                {grandchild.name}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </li>
                                );
                              }
                              
                              // Regular child item (no nested children)
                              return (
                                <li key={child.name}>
                                  <Link
                                    to={child.href}
                                    onClick={handleLinkClick}
                                    className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${
                                      isChildActive
                                        ? 'bg-green-50 text-green-700 border-l-2 border-green-500'
                                        : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <ChildIcon className={`h-4 w-4 shrink-0 ${isChildActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                                    {child.name}
                                  </Link>
                                </li>
                              );
                            })}
                            </ul>
                        </div>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                          className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                          isActive
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm'
                              : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
                        }`}
                      >
                          <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
              
              {/* Secondary Navigation */}
              <li className="mt-auto pt-6 border-t border-gray-200">
                <ul className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                          className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
                          isActive
                              ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm'
                              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                          <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#3b8169]' : 'text-[#3b8169] group-hover:text-[#3b8169]'}`} />
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
    </>
  );
}