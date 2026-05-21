/**
 * App.jsx — Point d'entrée principal de l'application
 *
 * Layout :
 *  - Sidebar avec deux sections :
 *      • Navigation principale (Dashboard, Tâches, etc.)
 *      • Section Admin en bas (Équipe) — séparée visuellement
 *  - Zone de contenu avec React Router
 *  - ToastProvider enveloppe tout pour que les notifications
 *    soient accessibles partout via useToast()
 */

import { Routes, Route, NavLink } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.jsx';

import Dashboard       from './pages/Dashboard.jsx';
import Taches          from './pages/Taches.jsx';
import ClientsFactures from './pages/ClientsFactures.jsx';
import Calendrier      from './pages/Calendrier.jsx';
import CoffreFort      from './pages/Coffre_fort.jsx';
import Assistant       from './pages/Assistant.jsx';
import Equipe          from './pages/Equipe.jsx';

// ── Navigation principale (haut de la sidebar) ────────────
const NAV_PRINCIPAL = [
  { to: '/',           label: 'Dashboard',          icon: '▦', end: true },
  { to: '/taches',     label: 'Tâches',             icon: '✓' },
  { to: '/business',   label: 'Clients & Factures', icon: '€' },
  { to: '/calendrier', label: 'Calendrier',         icon: '◫' },
  { to: '/documents',  label: 'Documents',          icon: '📁' },
  { to: '/assistant',  label: 'Assistant IA',       icon: '◈' },
];

// ── Navigation admin (bas de la sidebar, séparée) ─────────
// L'équipe est une section administrative (accès restreint, gestion interne).
// On la sépare visuellement des fonctions du quotidien.
const NAV_ADMIN = [
  { to: '/equipe', label: 'Équipe', icon: '◎' },
];

export default function App() {
  return (
    <ToastProvider>
      <div className="app-layout">

        {/* ── Sidebar ── */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">L</span>
            Lexora
          </div>

          {/* Navigation principale */}
          <ul>
            {NAV_PRINCIPAL.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}>
                  <span className="nav-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/*
            sidebar-spacer prend tout l'espace restant (flex: 1)
            ce qui pousse la section admin tout en bas de la sidebar.
          */}
          <div className="sidebar-spacer" />

          {/* Section admin — séparée en bas */}
          <div className="sidebar-admin-section">
            <span className="sidebar-section-label">Administration</span>
            <ul>
              {NAV_ADMIN.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink to={to}>
                    <span className="nav-icon">{icon}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Contenu principal ── */}
        <main className="content">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/taches"     element={<Taches />} />
            <Route path="/business"   element={<ClientsFactures />} />
            <Route path="/calendrier" element={<Calendrier />} />
            <Route path="/documents"  element={<CoffreFort />} />
            <Route path="/assistant"  element={<Assistant />} />
            <Route path="/equipe"     element={<Equipe />} />
          </Routes>
        </main>

      </div>
    </ToastProvider>
  );
}
