import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FixedBackground from '../common/FixedBackground';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <FixedBackground variant="subtle" />
      <div className="w-full pt-3 relative z-10" style={{ backgroundColor: '#f3f4f6' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:ml-80 px-5 lg:px-8 lg:pb-10">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}