import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ToggleableSidebar from '../components/ToggleableSidebar';
import { useAuth } from '../context/AuthContext'; 
import { Store } from '../types/vpadmin/vpAdminTypes';
import { GetUserStores } from '../api/vp-item-api';
import { MainLayoutProps } from '../types/layouts/MainLayoutTypes';
  
  const MainLayout: React.FC<MainLayoutProps> = ({ changeSelectedStore, refreshStoreDropdown }) => {
  const { loginUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isOpen, setIsOpen] = useState(false);  

  useEffect(() => {
    const fetchData = async () => {    
      
      if (loginUser && loginUser.UserID) {
        // retrieve user stores
        const storeData: Store[] = await GetUserStores(loginUser?.UserID);
        setStores(storeData);
        if (storeData.length > 0) {
          changeSelectedStore(storeData[0]);
          setSelectedStore(storeData[0]);
        }
      }      
    };
  
    fetchData();
  }, [loginUser, refreshStoreDropdown]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleItemClick = (item: Store) => {
    changeSelectedStore(item);
    setSelectedStore(item);
    setIsOpen(false);
  };

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
          <div className="flex relative w-120 font-sans text-xs items-center">
            <span className="mr-3 text-sm font-bold">Store:</span>
            <div className='w-110 relative'>
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between h-6 w-full text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{selectedStore?.StoreName || "Select an option"}</span>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="absolute z-10 w-full text-gray-500 bg-white border border-gray-300 rounded-md shadow-lg">
                  <ul className="overflow-auto max-h-60">
                    {stores.map((item, index) => (
                      <li 
                        key={index}                                                
                        onClick={() => handleItemClick(item)}
                        className="text-left px-4 py-1 text-gray-500 hover:bg-blue-100 hover:text-blue-900 cursor-pointer"
                      >
                        {item.StoreName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;