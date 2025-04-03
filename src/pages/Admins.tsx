import React, { useState } from 'react';
import { 
  CircleUserIcon,   
  StoreIcon, 
  CableIcon,   
} from 'lucide-react';
import UserMantineTable from '../components/UserMantineTable';
import StoreMantineTable from '../components/StoreMantineTable';
import UserStoreRelationMantineTable from '../components/UserStoreRelationMantineTable';

const Admins: React.FC = () => {
  const [activeTab, setActiveTab] = useState('user');

  const handleTabClick = (tabId: string, e: any) => {
    e.preventDefault();
    setActiveTab(tabId);
  };

  return (
    <div className="w-full p-3">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          <li className="me-2">
            <a 
              href="#" 
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group
                ${activeTab === 'user' 
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
              onClick={(e) => handleTabClick('user', e)}
            >              
              <CircleUserIcon className={`w-4 h-4 me-2 ${activeTab === 'user' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'}`} aria-hidden="true" fill="LightBlue" viewBox="0 0 23 23" />
              User
            </a>
          </li>
          <li className="me-2">
            <a 
              href="#" 
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group
                ${activeTab === 'store' 
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
              onClick={(e) => handleTabClick('store', e)}
            >
              <StoreIcon className={`w-4 h-4 me-2 ${activeTab === 'Store' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'}`} aria-hidden="true" fill="LightBlue" viewBox="0 0 23 23" />
              Store
            </a>
          </li>
          <li className="me-2">
            <a 
              href="#" 
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group
                ${activeTab === 'userStore' 
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
              onClick={(e) => handleTabClick('userStore', e)}
            >
              <CableIcon className={`w-4 h-4 me-2 ${activeTab === 'User & Store' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'}`} aria-hidden="true" fill="LightBlue" viewBox="0 0 23 23" />
              User & Store
            </a>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="mt-3">
        {activeTab === 'user' && (
          <div>
            <UserMantineTable />
          </div>
        )}
        
        {activeTab === 'store' && (
          <div>
            <StoreMantineTable />
          </div>
        )}
        
        {activeTab === 'userStore' && (
          <div>
            <UserStoreRelationMantineTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admins;