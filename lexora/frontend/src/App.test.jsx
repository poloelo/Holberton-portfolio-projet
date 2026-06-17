// src/App.test.jsx
//
// Vérifié contre ton vrai App.jsx (zip Holberton-portfolio-projet-main).
//
// On teste PrivateRoute et AdminRoute de manière ISOLÉE, sans monter
// tout App (les 8 pages réelles font des fetch() vers le backend,
// ce qui rendrait ces tests lents et fragiles).
//
//  Pour que cet import fonctionne, ajoute "export" devant
// PrivateRoute et AdminRoute dans ton vrai App.jsx :
//   export function PrivateRoute({ children }) { ... }
//   export function AdminRoute({ children }) { ... }

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { PrivateRoute, AdminRoute } from './App.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

vi.mock('./contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

function renderWithRoute(element, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Page Login</div>} />
        <Route path="/mon-espace" element={<div>Page Mon Espace</div>} />
        <Route path="/" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  it('redirige vers /login si non connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    renderWithRoute(
      <PrivateRoute><div>Contenu protégé</div></PrivateRoute>
    );

    expect(screen.getByText('Page Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('affiche la page si connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    renderWithRoute(
      <PrivateRoute><div>Contenu protégé</div></PrivateRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirige vers /login si non connecté', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    renderWithRoute(
      <AdminRoute><div>Page Équipe</div></AdminRoute>
    );

    expect(screen.getByText('Page Login')).toBeInTheDocument();
  });

  it('redirige vers /mon-espace si connecté mais pas admin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'employe' },
    });
    renderWithRoute(
      <AdminRoute><div>Page Équipe</div></AdminRoute>
    );

    expect(screen.getByText('Page Mon Espace')).toBeInTheDocument();
    expect(screen.queryByText('Page Équipe')).not.toBeInTheDocument();
  });

  it('affiche la page si connecté ET admin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'admin' },
    });
    renderWithRoute(
      <AdminRoute><div>Page Équipe</div></AdminRoute>
    );

    expect(screen.getByText('Page Équipe')).toBeInTheDocument();
  });

  it('ne plante pas si user est encore null pendant le chargement (optional chaining)', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });

    expect(() => {
      renderWithRoute(
        <AdminRoute><div>Page Équipe</div></AdminRoute>
      );
    }).not.toThrow();

    // user?.role est undefined, pas 'admin' → doit rediriger vers /mon-espace
    expect(screen.getByText('Page Mon Espace')).toBeInTheDocument();
  });
});