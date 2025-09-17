import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className=" bg-gray-50 w-full">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:ml-80 px-4 sm:px-6 lg:px-8 lg:pb-10">
        <Header onMenuClick={() => setSidebarOpen(true)}  />
        <main className="">
            {children}
        </main>
      </div>
    </div>
  );
}