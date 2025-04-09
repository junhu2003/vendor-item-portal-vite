import React from 'react';
import { Store } from '../types/vpadmin/vpAdminTypes';

import VpItemMantineTable from '../components/VpItemMantineTable';

const Dashboard: React.FC<{ selectedStore: Store | null }> = ({ selectedStore }) => {
    
    return (
      <div className="w-full p-3">
        {
          selectedStore && <VpItemMantineTable selectedStore={selectedStore} />
        }
        
      </div>
    );
  };

export default Dashboard;  