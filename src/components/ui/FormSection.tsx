import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function FormSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = '' 
}: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {Icon && (
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
