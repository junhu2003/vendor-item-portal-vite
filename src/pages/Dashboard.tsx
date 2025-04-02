import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';
import VpItemMantineTable from '../components/VpItemMantineTable';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
  
    return (
      <div className="w-full p-3">
        <VpItemMantineTable />
      </div>
    );
  };

export default Dashboard;  