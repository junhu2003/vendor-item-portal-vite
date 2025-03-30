import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';

const Admins: React.FC = () => {
    const { user } = useAuth();
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Admins</h1>
        <p>Welcome, {user?.Name}!</p>
      </div>
    );
  };

export default Admins;  