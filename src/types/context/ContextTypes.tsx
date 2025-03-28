// User interface
export interface User {
    id: string;
    name: string;
    email: string;
  }
  
  // Authentication context interface
export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
  }