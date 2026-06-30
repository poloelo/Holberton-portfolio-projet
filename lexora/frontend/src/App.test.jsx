/**
 * App.test.jsx — Tests unitaires des gardes de route.
 *
 * Vérifient le comportement de PrivateRoute et AdminRoute selon l'état
 * d'authentification et le rôle de l'utilisateur. useAuth est mocké pour
 * piloter cet état ; React Router (MemoryRouter) simule la navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock du contexte d'auth : on contrôle ce que renvoie useAuth() à chaque test.
vi.mock('./contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

import { useAuth } from './contexts/AuthContext.jsx';
import { PrivateRoute, AdminRoute } from './App.jsx';

// Rend une garde sur la route /secret, avec des routes cibles de redirection.
function renderGuard(element) {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<div>PAGE LOGIN</div>} />
        <Route path="/mon-espace" element={<div>PAGE MON ESPACE</div>} />
        <Route path="/secret" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuth.mockReset();
});

describe('PrivateRoute', () => {
  it('redirige vers /login si non connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    renderGuard(<PrivateRoute><div>CONTENU PROTEGE</div></PrivateRoute>);
    expect(screen.getByText('PAGE LOGIN')).toBeInTheDocument();
  });

  it('affiche le contenu protégé si connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    renderGuard(<PrivateRoute><div>CONTENU PROTEGE</div></PrivateRoute>);
    expect(screen.getByText('CONTENU PROTEGE')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirige vers /login si non connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    renderGuard(<AdminRoute><div>CONTENU ADMIN</div></AdminRoute>);
    expect(screen.getByText('PAGE LOGIN')).toBeInTheDocument();
  });

  it('redirige vers /mon-espace si connecté mais non-admin', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'employe' } });
    renderGuard(<AdminRoute><div>CONTENU ADMIN</div></AdminRoute>);
    expect(screen.getByText('PAGE MON ESPACE')).toBeInTheDocument();
  });

  it('affiche le contenu admin si admin', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } });
    renderGuard(<AdminRoute><div>CONTENU ADMIN</div></AdminRoute>);
    expect(screen.getByText('CONTENU ADMIN')).toBeInTheDocument();
  });

  it('ne plante pas si user est null (optional chaining) et redirige proprement', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    renderGuard(<AdminRoute><div>CONTENU ADMIN</div></AdminRoute>);
    expect(screen.getByText('PAGE MON ESPACE')).toBeInTheDocument();
  });
});
