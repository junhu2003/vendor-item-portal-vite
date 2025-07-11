import { Users } from '../vpadmin/vpAdminTypes';
  
  // Authentication context interface
export interface AuthContextType {
    loginUser: Users | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
  }