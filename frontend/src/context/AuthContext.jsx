import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const current = await api.getCurrentUser();
      setUser(current);
    } catch (err) {
      if (err.status === 401) {
        api.logout();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (username, password) => {
    await api.login(username, password);
    const current = await api.getCurrentUser();
    setUser(current);
    return current;
  };

  const register = async (username, password) => {
    await api.register(username, password);
    return login(username, password);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
