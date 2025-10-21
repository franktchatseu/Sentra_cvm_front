import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { tw } from '../../../shared/utils/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`w-full relative ${tw.primaryBackground}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-32 xl:ml-80">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-5 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}