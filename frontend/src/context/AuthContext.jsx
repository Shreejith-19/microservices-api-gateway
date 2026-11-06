import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [decodedToken, setDecodedToken] = useState(null);

  // Decode JWT payload whenever token changes using jwt-decode
  useEffect(() => {
    if (!token) {
      setDecodedToken(null);
      return;
    }
    try {
      const payload = jwtDecode(token);
      setDecodedToken(payload);

      // If user object not yet stored, derive initial identity from JWT claims
      setUser((prev) => prev || {
        id: payload.userId,
        email: payload.email,
      });
    } catch {
      setDecodedToken(null);
    }
  }, [token]);

  const handleLogin = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setDecodedToken(null);
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        decodedToken,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
