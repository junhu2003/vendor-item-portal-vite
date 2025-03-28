import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>
    );
  };

export default Dashboard;  