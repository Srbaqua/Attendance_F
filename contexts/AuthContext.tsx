// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

// Define the User type based on what we see in the app
interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  username?: string;
}

// Define the context value interface
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  userRole: 'student' | 'teacher' | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  userRole: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loading: false,
  error: null
});

// Export the hook for using the context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth data on startup
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setUserRole(parsedUser.role);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to load auth data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password
      });

      const { token, user } = response.data;
      
      // Store auth data
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setUserRole(user.role);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username: string, password: string, name: string, role: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`${API_URL}/api/users/register`, {
        username,
        password,
        name,
        role
      });
      
      // Auto login after registration
      await login(username, password);
    } catch (err) {
      setError('Registration failed. Username may be taken.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored auth data
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      
      // Reset state
      setToken(null);
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    userRole,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};