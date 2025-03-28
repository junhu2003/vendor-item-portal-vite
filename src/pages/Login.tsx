import React, { useState } from 'react';
import ampmLogo from '../assets/AMPM-Logo-HiRes-White.png';
import { 
  MailIcon, 
  LockIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-blue-100 p-0 m-0">
      
      <div className="p-0 bg-white rounded-lg shadow-xl w-116 border border-gray-300">
        <div className="w-full h-15 flex justify-center items-center mb-6 bg-blue-800 p-0 rounded-t-lg">
          <img src={ampmLogo} alt="AM / PM Logo" className="w-25" />
        </div>
        <div className="p-8 pt-0">
          <h2 className="text-1lg font-bold mb-6 text-center">AM / PM Vendor Portal</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>          
            <div className="relative mb-4">
              <input
                type="email"
                id="email"
                value={email}
                placeholder='Email'
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MailIcon size={20} />
              </div>
            </div>          
            <div className="relative mb-6">            
              <input
                type="password"
                id="password"
                value={password}
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <LockIcon size={20} />
              </div>
            </div>
            <button
              type="submit"
              className="w-30 bg-blue-500 text-gray-300 hover:text-gray-500 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;