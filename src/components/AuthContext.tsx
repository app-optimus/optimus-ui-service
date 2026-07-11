import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { GLOBAL_AUTH_TOKEN } from '../config/auth';

// Apply immediately so any request fired before the provider mounts is
// still authenticated.
axios.defaults.headers.common['authenticationtoken'] = GLOBAL_AUTH_TOKEN;

interface AuthContextType {
  email: string;
  setEmail: (email: string) => void;
  authToken: string;
  setAuthToken: (token: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [authToken, setAuthToken] = useState(GLOBAL_AUTH_TOKEN);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['authenticationtoken'] = authToken;
    } else {
      delete axios.defaults.headers.common['authenticationtoken'];
    }
  }, [authToken]);

  const logout = () => {
    setEmail('');
    setAuthToken(GLOBAL_AUTH_TOKEN);
    setUserId('');
  };

  return (
    <AuthContext.Provider value={{ email, setEmail, authToken, setAuthToken, userId, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
