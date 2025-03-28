import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ToggleableSidebar from '../components/ToggleableSidebar';

const MainLayout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  {/* adjust the main layout space according to sidebar expending or shrink */}
  const adjustSidebarSpace = (sidebarStatus: boolean) => {
    setIsExpanded(sidebarStatus);
  }

  return (
    <div className="flex">
      <ToggleableSidebar adjustSidebarSpace={ adjustSidebarSpace } />
      <main 
        className={`
          fixed top-0 left-0 flex-grow p-0 transition-all duration-300 ease-in-out
          ml-20 w-screen h-screen bg-gray-100
          ${isExpanded ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;