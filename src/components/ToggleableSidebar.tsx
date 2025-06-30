import React, { useState } from 'react';
import { 
  HomeIcon,   
  CogIcon, 
  LogOutIcon, 
  ChevronsLeft, 
  ChevronsRight,
} from 'lucide-react';
import VendorPortalImg from '../assets/vendor-portal.png';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToggleableSidebarProps } from '../types/components/ToggleableSidebarTypes';



const ToggleableSidebar: React.FC<ToggleableSidebarProps> = ({ 
  adjustSidebarSpace, adjustPageTitle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { logout, loginUser } = useAuth();

  // Menu items with path, icon, and label
  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <HomeIcon className="w-5 h-5" />, 
      label: 'Create New Items' 
    },
    { 
      path: '/SDToItems', 
      icon: <HomeIcon className="w-5 h-5" />, 
      label: 'Modify Store Items' 
    },
    /*{ 
      path: '/profile', 
      icon: <UserIcon className="w-5 h-5" />, 
      label: 'Profile' 
    },*/
    { 
      path: '/admins', 
      icon: <CogIcon className="w-5 h-5" />, 
      label: 'Admins' 
    }
  ];

  // Check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Toggle sidebar between expanded and collapsed states
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    adjustSidebarSpace(!isExpanded);
  };

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-white text-white 
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
        shadow-lg z-0
      `}
    >
      {/* Sidebar Toggle Button */}      
      {isExpanded ? (
        <ChevronsLeft  onClick={toggleSidebar} className="w-6 h-6 cursor-pointer absolute top-4 right-4 z-10 text-gray-300 hover:text-gray-500" />
      ) : (
        <ChevronsRight onClick={toggleSidebar} className="w-4 h-4 cursor-pointer absolute top-4 right-4 z-10 text-gray-300 hover:text-gray-500" />
      )}      

      {/* Sidebar Header */}
      <div className="flex items-center justify-center pt-10">
        <img src={VendorPortalImg} alt="Vendor Portal" className={`${isExpanded ? 'w-35' : 'w-15'}`} />
      </div>
      {/* Sidebar Content */}
      <div className="pt-3 px-2">
        {/* User Info */}
        {isExpanded && loginUser && (
          <div className="mb-6 text-center">
            <h2 className="text-xl text-gray-400 font-semibold truncate">{loginUser.Name}</h2>
            <p className="text-sm text-gray-400 truncate">{loginUser.Email}</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav>
          <ul className="space-y-2 absolut h-full">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center p-2 rounded-lg transition duration-300
                    ${isActive(item.path) 
                      ? 'bg-blue-300 text-gray-800' 
                      : 'hover:bg-blue-300 hover:text-red-300'
                    }
                    ${isExpanded ? 'justify-start' : 'justify-center'}
                  `}
                  onClick={() => { adjustPageTitle(item.label); }}
                >
                  <div className={isExpanded ? 'mr-3' : ''}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}

            {/* Logout Button */}
            <li className='absolute bottom-3'>
              <button
                onClick={logout}
                className={`
                  w-full flex items-center p-2 rounded-lg 
                  hover:bg-gray-600 hover:text-gray-600 
                  text-gray-400 transition duration-300
                  ${isExpanded ? 'justify-start' : 'justify-center'}
                `}
              >
                <div className={isExpanded ? 'mr-3' : ''}>
                  <LogOutIcon className="w-4 h-4" />
                </div>
                {isExpanded && (
                  <span className="truncate">Logout</span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ToggleableSidebar;