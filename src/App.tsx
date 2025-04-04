import React from 'react';
import './App.css';
import '@mantine/core/styles.css'; //import Mantine V7 styles needed by MRT
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //import MRT styles
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import LoginPage from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admins from './pages/Admins';
import { Store } from './types/vpadmin/vpAdminTypes';

const App: React.FC = () => {
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(null);
  const changeSelectedStore = (store: Store) => {
    setSelectedStore(store);
  }
    // Logic to adjust sidebar space

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout changeSelectedStore={changeSelectedStore} />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard selectedStore={selectedStore} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;