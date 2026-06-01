import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'lexora_jwt';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Échec de la connexion');
    }
    const { token: t } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  // Headers à passer à fetch() pour les routes protégées
  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  return (
    <AuthContext.Provider value={{ token, login, logout, authHeaders, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
