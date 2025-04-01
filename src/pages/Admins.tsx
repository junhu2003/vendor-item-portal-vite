import React, { useState } from 'react';
import { 
  CircleUserIcon,   
  StoreIcon, 
  CableIcon,   
} from 'lucide-react';
import UserMantineTable from '../components/UserMantineTable';
import StoreMantineTable from '../components/StoreMantineTable';

const Admins: React.FC = () => {
  const [activeTab, setActiveTab] = useState('user');

  const handleTabClick = (tabId: string, e: any) => {
    e.preventDefault();
    setActiveTab(tabId);
  };

  return (
    <div className="w-[80%] m-3">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">User & Store Connection</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800">Connection Status</h4>
                <p className="text-gray-600">User is connected to 2 stores</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User Role</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Staff</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded flex-1">
                  Connect
                </button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex-1">
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admins;