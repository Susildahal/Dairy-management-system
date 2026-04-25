import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { Header } from '../common/Header';
import { cn } from '@/lib/utils';

const SuperAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        role="superadmin" 
        onCollapsedChange={(collapsed) => setIsCollapsed(collapsed)} 
      />
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0  overflow-hidden   transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
