/**
 * Login.test.jsx — Tests unitaires du formulaire de connexion.
 *
 * useAuth (login) et useNavigate sont mockés pour isoler le composant.
 * On vérifie le rendu, la gestion d'état des champs, l'appel de login(),
 * la redirection selon le rôle, l'affichage des erreurs et l'état de
 * chargement (bouton désactivé pendant l'appel, réactivé via finally).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext.jsx';
import Login from './Login.jsx';

// Monte le composant avec une implémentation de login() donnée.
function setup(loginImpl) {
  const login = vi.fn(loginImpl);
  useAuth.mockReturnValue({ login });
  render(<Login />);
  return { login };
}

const getEmail  = () => screen.getByPlaceholderText('Email');
const getPass   = () => screen.getByPlaceholderText('Mot de passe');
const getButton = () => screen.getByRole('button');

// Remplit les deux champs (requis) pour que le submit ne soit pas bloqué
// par la validation HTML5 (required) dans jsdom.
function fillForm(email = 'a@b.fr', password = 'pw') {
  fireEvent.change(getEmail(), { target: { value: email } });
  fireEvent.change(getPass(), { target: { value: password } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login', () => {
  it('1. affiche le formulaire (email, mot de passe, bouton)', () => {
    setup(async () => ({ role: 'employe' }));
    expect(getEmail()).toBeInTheDocument();
    expect(getPass()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
  });

  it('2. handleChange isole chaque champ (spread, pas d écrasement)', () => {
    setup(async () => ({ role: 'employe' }));
    fireEvent.change(getEmail(), { target: { value: 'a@b.fr' } });
    expect(getEmail().value).toBe('a@b.fr');
    expect(getPass().value).toBe(''); // le mot de passe n'a pas bougé

    fireEvent.change(getPass(), { target: { value: 'secret' } });
    expect(getEmail().value).toBe('a@b.fr'); // l'email n'a pas bougé
    expect(getPass().value).toBe('secret');
  });

  it('3. appelle login() au submit avec les bonnes valeurs', async () => {
    const { login } = setup(async () => ({ role: 'employe' }));
    fireEvent.change(getEmail(), { target: { value: 'a@b.fr' } });
    fireEvent.change(getPass(), { target: { value: 'pw' } });
    fireEvent.click(getButton());
    await waitFor(() => expect(login).toHaveBeenCalledWith('a@b.fr', 'pw'));
  });

  it('4. redirige un admin vers /equipe', async () => {
    setup(async () => ({ role: 'admin' }));
    fillForm();
    fireEvent.click(getButton());
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/equipe', { replace: true })
    );
  });

  it('5. redirige un employé vers /mon-espace', async () => {
    setup(async () => ({ role: 'employe' }));
    fillForm();
    fireEvent.click(getButton());
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/mon-espace', { replace: true })
    );
  });

  it('6. affiche l erreur et ne navigue pas si login échoue', async () => {
    setup(async () => { throw new Error('Identifiants incorrects'); });
    fillForm();
    fireEvent.click(getButton());
    await waitFor(() =>
      expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('7. désactive le bouton pendant l appel puis le réactive (finally)', async () => {
    let resolveLogin;
    setup(() => new Promise(res => { resolveLogin = () => res({ role: 'employe' }); }));
    fillForm();
    fireEvent.click(getButton());
    await waitFor(() => expect(getButton()).toBeDisabled());
    resolveLogin();
    await waitFor(() => expect(getButton()).not.toBeDisabled());
  });

  it('8. réactive le bouton même en cas d échec (finally s exécute aussi en erreur)', async () => {
    setup(async () => { throw new Error('Erreur'); });
    fillForm();
    fireEvent.click(getButton());
    await waitFor(() => expect(getButton()).not.toBeDisabled());
    expect(screen.getByText('Erreur')).toBeInTheDocument();
  });
});
