import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';
import Toast from '../components/Toast';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [toast, setToast] = useState<React.ReactElement | null>(null);
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p>Welcome, {user?.Name}!</p>

        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <button
        onClick={() =>
          setToast(<Toast message="✅ Action was successful!" type="success" duration={3000} onClose={() => setToast(null)} />)
        }
        className="px-4 py-2 bg-green-500 text-gray
         rounded-lg shadow hover:bg-green-600"
      >
        Show Success Toast
      </button>

      <button
        onClick={() =>
          setToast(<Toast message="❌ Something went wrong!" type="error" duration={3000} onClose={() => setToast(null)} />)
        }
        className="px-4 py-2 bg-red-500 text-gary rounded-lg shadow hover:bg-red-600"
      >
        Show Error Toast
      </button>

      {toast}
    </div>
      </div>
    );
  };

export default Profile;  