import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { color, helpers } from '../../design/utils';
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
  Layers,
  BarChart3,
  Calendar,
  Zap
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
  entity?: 'campaigns' | 'products' | 'offers' | 'segments' | 'users' | 'analytics' | 'configuration';
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['campaign management', 'product configuration']);

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      type: 'single',
      entity: 'campaigns'
    },
    {
      name: 'Campaign Management',
      href: '/dashboard/campaigns',
      icon: BarChart3,
      type: 'parent',
      entity: 'campaigns',
      children: [
        { name: 'All Campaigns', href: '/dashboard/campaigns', icon: Target, type: 'single', entity: 'campaigns' },
        { name: 'Segments', href: '/dashboard/segments', icon: Users, type: 'single', entity: 'segments' },
        {
          name: 'Offer Configuration',
          href: '/dashboard/offers',
          icon: Calendar,
          type: 'parent',
          entity: 'offers',
          children: [
            { name: 'All Offers', href: '/dashboard/offers', icon: MessageSquare, type: 'single', entity: 'offers' },
            { name: 'Offer Types', href: '/dashboard/offer-types', icon: Tag, type: 'single', entity: 'offers' },
            { name: 'Offer Categories', href: '/dashboard/offer-categories', icon: FolderOpen, type: 'single', entity: 'offers' },
          ]
        },
        {
          name: 'Product Configuration',
          href: '/dashboard/products',
          icon: Zap,
          type: 'parent',
          entity: 'products',
          children: [
            { name: 'All Products', href: '/dashboard/products', icon: Package, type: 'single', entity: 'products' },
            { name: 'Product Types', href: '/dashboard/product-types', icon: Layers, type: 'single', entity: 'products' },
            { name: 'Product Categories', href: '/dashboard/products/categories', icon: FolderOpen, type: 'single', entity: 'products' },
          ]
        },
      ]
    },
    {
      name: 'User Management',
      href: '/dashboard/user-management',
      icon: UserCheck,
      type: 'single',
      entity: 'users'
    },
    {
      name: 'Configuration',
      href: '/dashboard/configuration',
      icon: Cog,
      type: 'single',
      entity: 'configuration'
    },
  ];

  const secondaryNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, type: 'single', entity: 'configuration' as const },
  ];

  const getEntityColor = (entity?: NavigationItem['entity']) => {
    return entity ? helpers.entityColor(entity) : color.sentra.main;
  };

  const getItemClasses = (isActive: boolean, entity?: NavigationItem['entity']) => {
    return isActive
      ? `bg-[${getEntityColor(entity)}]/20 text-[${getEntityColor(entity)}] border-l-4 border-[${getEntityColor(entity)}] font-semibold shadow-sm`
      : `text-[${color.ui.text.secondary}] hover:text-[${color.ui.text.primary}] hover:bg-[${color.ui.surface}]/50 transition-all duration-200`;
  };

  const getIconClasses = (isActive: boolean, entity?: NavigationItem['entity']) => {
    if (isActive) {
      return `text-[${getEntityColor(entity)}]`;
    }
    return 'text-[#3A5A40]';
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      // If clicking the same item, toggle it
      if (prev.includes(itemName)) {
        return prev.filter(item => item !== itemName);
      }

      // Special case: Offer Config and Product Config should close each other
      if (itemName === 'offer configuration' || itemName === 'product configuration') {
        // Close the other config if it's open, then open this one
        const filtered = prev.filter(item =>
          item !== 'offer configuration' && item !== 'product configuration'
        );
        return [...filtered, itemName];
      }

      // For all other items, allow multiple to be open
      return [...prev, itemName];
    });
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
          <div className="fixed inset-y-0 left-0 flex w-72 sm:w-80 flex-col bg-gradient-to-b from-gray-50 to-white shadow-xl">
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
                          className={`group w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${getItemClasses(isActive, item.entity)}`}
                        >
                          <div className="flex items-center gap-x-3">
                            <Icon className={`h-5 w-5 shrink-0 ${getIconClasses(isActive, item.entity)}`} />
                            {item.name}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
                                      className={`group w-full flex items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${isChildActive
                                        ? getItemClasses(isChildActive, child.entity)
                                        : getItemClasses(false, child.entity)
                                        }`}
                                    >
                                      <div className="flex items-center gap-x-3">
                                        <ChildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(isChildActive, child.entity)}`} />
                                        {child.name}
                                      </div>
                                      {isChildExpanded ? (
                                        <ChevronDown className="h-3 w-3 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                      )}
                                    </button>

                                    {isChildExpanded && (
                                      <div className="mt-2 ml-6 space-y-2">
                                        {child.children?.map((grandchild) => {
                                          const GrandchildIcon = grandchild.icon;
                                          const isGrandchildActive = location.pathname === grandchild.href;
                                          return (
                                            <Link
                                              key={grandchild.name}
                                              to={grandchild.href}
                                              onClick={handleLinkClick}
                                              className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${isGrandchildActive
                                                ? getItemClasses(isGrandchildActive, grandchild.entity)
                                                : getItemClasses(false, grandchild.entity)
                                                }`}
                                            >
                                              <GrandchildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(false, undefined)}`} />
                                              {grandchild.name}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              // Regular child item (no nested children)
                              return (
                                <Link
                                  key={child.name}
                                  to={child.href}
                                  onClick={handleLinkClick}
                                  className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${getItemClasses(isChildActive, child.entity)}`}
                                >
                                  <ChildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(false, undefined)}`} />
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
                      className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${getItemClasses(isActive, item.entity)}`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${getIconClasses(false, undefined)}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="grid grid-rows-[auto_1fr_auto] bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 px-6 py-6" style={{ height: '100vh' }}>
          <div className="flex h-16 items-center">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src={logo} alt="Sentra Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <nav className="overflow-y-auto">
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
                        className={`group w-full flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${getItemClasses(isActive, item.entity)}`}
                      >
                        <div className="flex items-center gap-x-3">
                          <Icon className={`h-5 w-5 shrink-0 ${getIconClasses(false, undefined)}`} />
                          {item.name}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
                                    className={`group w-full flex items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${isChildActive
                                      ? getItemClasses(isChildActive, child.entity)
                                      : getItemClasses(false, child.entity)
                                      }`}
                                  >
                                    <div className="flex items-center gap-x-3">
                                      <ChildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(false, undefined)}`} />
                                      {child.name}
                                    </div>
                                    {isChildExpanded ? (
                                      <ChevronDown className="h-3 w-3 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-gray-400" />
                                    )}
                                  </button>

                                  {isChildExpanded && (
                                    <ul className="mt-2 ml-6 space-y-2">
                                      {child.children?.map((grandchild) => {
                                        const GrandchildIcon = grandchild.icon;
                                        const isGrandchildActive = location.pathname === grandchild.href;
                                        return (
                                          <li key={grandchild.name}>
                                            <Link
                                              to={grandchild.href}
                                              onClick={handleLinkClick}
                                              className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${getItemClasses(isGrandchildActive, grandchild.entity)}`}
                                            >
                                              <GrandchildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(false, undefined)}`} />
                                              {grandchild.name}
                                            </Link>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </li>
                              );
                            }

                            // Regular child item (no nested children)
                            return (
                              <li key={child.name}>
                                <Link
                                  to={child.href}
                                  onClick={handleLinkClick}
                                  className={`group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-all duration-200 ${isChildActive
                                    ? getItemClasses(isChildActive, child.entity)
                                    : getItemClasses(false, child.entity)
                                    }`}
                                >
                                  <ChildIcon className={`h-4 w-4 shrink-0 ${getIconClasses(false, undefined)}`} />
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
                      className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${getItemClasses(isActive, item.entity)}`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${getIconClasses(false, undefined)}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="pt-6 border-t border-gray-200">
            <ul className="space-y-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${getItemClasses(isActive, item.entity)}`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${getIconClasses(false, undefined)}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}