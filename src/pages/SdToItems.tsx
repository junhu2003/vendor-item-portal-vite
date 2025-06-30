import React from 'react';
import { Store } from '../types/vpadmin/vpAdminTypes';

import SdItemMantineTable from '../components/SdItemMantineTable';

const SdToItems: React.FC<{ selectedStore: Store | null }> = ({ selectedStore }) => {
    
    return (
      <div className="w-full p-3">
        {
          selectedStore && <SdItemMantineTable selectedStore={selectedStore} />
        }
        
      </div>
    );
  };

export default SdToItems;  