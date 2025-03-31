import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ToggleableSidebar from '../components/ToggleableSidebar';

const MainLayout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  {/* adjust the main layout space according to sidebar expending or shrink */}
  const adjustSidebarSpace = (sidebarStatus: boolean) => {
    setIsExpanded(sidebarStatus);    
  }

  {/* adjust the page title */}
  const adjustPageTitle = (curPageTitle: string) => {
    setPageTitle(curPageTitle);
  }

  return (
    <div className="flex">
      <ToggleableSidebar adjustSidebarSpace={ adjustSidebarSpace } adjustPageTitle={ adjustPageTitle } />
      <main 
        className={`
          fixed top-0 left-0 flex-grow p-0 transition-all duration-300 ease-in-out
          md:ml-20 h-full bg-gray-100
          ${isExpanded ? 'md:ml-64' : 'md:ml-20'}
          ${isExpanded ? 'md:w-[calc(100%-16rem)]' : 'md:w-[calc(100%-5rem)]'}
        `}
      >
        <div className="flex justify-between items-center p-3 shadow-md bg-blue-300 text-white">
          <h6 className="text-l font-bold">{pageTitle}</h6>
          <div className="flex items-center space-x-4">ABC</div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;