import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { LoginData, RegisterData, User } from '../types';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(Boolean(token));
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await authService.login(data);
      localStorage.setItem('jwtToken', token);
      setIsLoggedIn(true);
      return token;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.register(data);
      return user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
  }, []);

  return {
    isLoggedIn,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };
};