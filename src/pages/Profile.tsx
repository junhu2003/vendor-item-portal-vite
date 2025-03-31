import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';
import {CustomModal} from '../components/CustomModal'

const Profile: React.FC = () => {
    const { user } = useAuth();
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p>Welcome, {user?.Name}!</p>
        <button onClick={() => { CustomModal(true, null, null); }}></button>
      </div>
    );
  };

export default Profile;  