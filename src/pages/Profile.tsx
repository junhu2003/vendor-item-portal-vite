import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p>Welcome, {user?.Name}!</p>
      </div>
    );
  };

export default Profile;  