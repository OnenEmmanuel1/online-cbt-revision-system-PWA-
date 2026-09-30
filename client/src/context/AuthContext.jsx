import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cbtr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cbtr_token', res.data.token);
    localStorage.setItem('cbtr_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('cbtr_token');
    localStorage.removeItem('cbtr_user');
    setUser(null);
  };

  const updateUserPoints = (pointsAwarded) => {
    if (user) {
      const updatedUser = { ...user, totalPoints: user.totalPoints + pointsAwarded };
      localStorage.setItem('cbtr_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
};
