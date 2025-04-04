import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '../types/context/ContextTypes';
import bcryptjs from 'bcryptjs';
import { Users } from '../types/vpadmin/vpAdminTypes';
import { GetVpUserByEmail } from '../api/vp-item-api';


// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loginUser, setLoginUser] = useState<Users | null>(null);
  const navigate = useNavigate();

  // Simulated login (replace with actual API call)
  const login = async (email: string, password: string): Promise<boolean> => {
    // Fetch users from API
    const users: Users | null = await GetVpUserByEmail(email);    
    if (!users) return false;

    const passwordsMatch = await bcryptjs.compare(password, users.Password);
    if (passwordsMatch) {
      setLoginUser(users);
      localStorage.setItem('user', JSON.stringify(users));
      localStorage.setItem('token', 'mock-jwt-token');
      
      navigate('/dashboard');
      return true;
    }

    return false;
  };

  // Logout function
  const logout = () => {
    setLoginUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check authentication on context creation
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setLoginUser(JSON.parse(storedUser));
    }
  }, []);

  // Authentication state
  const isAuthenticated = !!loginUser;

  return (
    <AuthContext.Provider value={{ loginUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};