// src/pages/Login.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Login from './Login.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

// On mock useNavigate pour vérifier vers où on redirige sans vraie navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// On mock useAuth pour contrôler login() sans faire de vrai fetch
vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login.jsx', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('affiche le formulaire avec les champs email et mot de passe', () => {
    useAuth.mockReturnValue({ login: vi.fn() });
    renderLogin();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('handleChange met à jour le champ email sans toucher au mot de passe', async () => {
    useAuth.mockReturnValue({ login: vi.fn() });
    renderLogin();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');

    await user.type(passwordInput, 'secret123');
    await user.type(emailInput, 'test@lexora.fr');

    expect(emailInput.value).toBe('test@lexora.fr');
    expect(passwordInput.value).toBe('secret123');
  });

  it('appelle login() avec email et password au submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'employe' });
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'rav@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(mockLogin).toHaveBeenCalledWith('rav@lexora.fr', 'pass123');
  });

  it('redirige vers /equipe si le rôle est admin', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'admin' });
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'admin@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/equipe', { replace: true });
    });
  });

  it('redirige vers /mon-espace si le rôle n\'est pas admin', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'employe' });
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'employe@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/mon-espace', { replace: true });
    });
  });

  it('affiche le message d\'erreur si login() échoue', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Identifiants incorrects'));
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'mauvais@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Identifiants incorrects')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('désactive le bouton pendant le chargement puis le réactive (test du finally)', async () => {
    let resolveLogin;
    const mockLogin = vi.fn(() => new Promise(res => { resolveLogin = res; }));
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'rav@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'pass123');
    await user.click(screen.getByRole('button', { name: /Connexion|Se connecter/ }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Connexion...')).toBeInTheDocument();

    resolveLogin({ role: 'employe' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Se connecter' })).not.toBeDisabled();
    });
  });

  it('réactive le bouton même si login() échoue (finally s\'exécute aussi en erreur)', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Erreur serveur'));
    useAuth.mockReturnValue({ login: mockLogin });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'x@lexora.fr');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'x');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Se connecter' })).not.toBeDisabled();
    });
  });
});