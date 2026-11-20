import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import api from '../services/api';

/**
 * AuthContext — manages authentication state across the app
 * Provides user data, login/logout/signup functions, and loading state
 */
export const AuthContext = createContext(null);

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    _id: u._id || u.user_id,
    name: u.name || u.full_name || 'User',
    full_name: u.full_name || u.name || 'User',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('token') === 'demo-token' ? localStorage.getItem('demo_user') : null;
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token && token !== 'demo-token') {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await authService.getProfile();
          const payload = response.data?.data || response.data;
          setUser(normalizeUser(payload.user || payload));
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login({ email, password });
      const payload = response.data?.data || response.data;
      const { token: newToken, user: userData } = payload;
      const normalized = normalizeUser(userData);
      localStorage.removeItem('demo_user');
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(normalized);
      return normalized;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Demo login for presenting: logs into PostgreSQL backend or falls back offline
  const demoLogin = useCallback(async (role = 'rider') => {
    const creds = {
      admin: { email: 'admin@ridego.com', password: 'password123' },
      driver: { email: 'ramesh@example.test', password: 'password123' },
      rider: { email: 'rahul@example.test', password: 'password123' },
    };
    const c = creds[role] || creds.rider;
    try {
      let res;
      try {
        res = await authService.login({ email: c.email, password: '123456' });
      } catch {
        res = await authService.login({ email: c.email, password: 'password123' });
      }
      const payload = res.data?.data || res.data;
      const { token: newToken, user: userData } = payload;
      const normalized = normalizeUser(userData);
      localStorage.removeItem('demo_user');
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(normalized);
      return normalized;
    } catch (err) {
      // Fallback offline preset if backend is not reachable
      const presets = {
        rider: { _id: 5, user_id: 5, name: 'Rahul Kumar Patel', full_name: 'Rahul Kumar Patel', email: 'rahul.patel@adaniuni.ac.in', phone: '9876500005', role: 'rider' },
        driver: { _id: 1, user_id: 1, name: 'Ramesh Patel', full_name: 'Ramesh Patel', email: 'ramesh.driver@ridego.in', phone: '9876543210', role: 'driver' },
        admin: { _id: 1, user_id: 1, name: 'Rudra Patel (Admin)', full_name: 'Rudra Patel (Admin)', email: 'admin@ridego.com', phone: '6353180208', role: 'admin' },
      };
      const demoUser = presets[role] || presets.rider;
      setError(null);
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      setToken('demo-token');
      setUser(demoUser);
      return demoUser;
    }
  }, []);

  // Signup function for riders
  const signupRider = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.signupRider(userData);
      const payload = response.data?.data || response.data;
      const { token: newToken, user: newUser } = payload;
      if (newToken) {
        localStorage.removeItem('demo_user');
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(normalizeUser(newUser));
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function for drivers
  const signupDriver = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.signupDriver(userData);
      const payload = response.data?.data || response.data;
      const { token: newToken, user: newUser } = payload;
      if (newToken) {
        localStorage.removeItem('demo_user');
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(normalizeUser(newUser));
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Driver signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      const payload = response.data?.data || response.data;
      setUser(normalizeUser(payload.user || payload));
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    demoLogin,
    signupRider,
    signupDriver,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
