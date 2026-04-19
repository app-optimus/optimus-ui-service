import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [authToken, setAuthToken] = useState('');
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
    setAuthToken('');
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
