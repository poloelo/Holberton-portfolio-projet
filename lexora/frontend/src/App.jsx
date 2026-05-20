/**
 * App.jsx — Point d'entrée principal de l'application
 *
 * Ce fichier configure :
 *  1. Le layout global (sidebar + zone de contenu)
 *  2. Le routeur React Router (quel composant afficher selon l'URL)
 *  3. Le ToastProvider (notifications disponibles sur toute l'app)
 *
 * Structure des 5 pages :
 *   /           → Dashboard (vue d'ensemble + KPIs)
 *   /taches     → Tâches (tâches projet + notes rapides)
 *   /business   → Clients & Factures (gestion commerciale)
 *   /equipe     → Équipe (employés, planning, automations)
 *   /assistant  → Assistant IA (chat)
 */

import { Routes, Route, NavLink } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.jsx';

// Import des 5 pages
import Dashboard       from './pages/Dashboard.jsx';
import Taches          from './pages/Taches.jsx';
import ClientsFactures from './pages/ClientsFactures.jsx';
import Equipe          from './pages/Equipe.jsx';
import Assistant       from './pages/Assistant.jsx';

// Configuration de la navigation : chaque entrée = un lien dans la sidebar
// Ajouter une page ici suffit à la faire apparaître dans le menu
const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',        icon: '▦', end: true },
  { to: '/taches',    label: 'Tâches',           icon: '✓' },
  { to: '/business',  label: 'Clients & Factures', icon: '€' },
  { to: '/equipe',    label: 'Équipe',            icon: '◎' },
  { to: '/assistant', label: 'Assistant IA',      icon: '◈' },
];

export default function App() {
  return (
    // ToastProvider rend le système de notifications disponible
    // dans tous les composants enfants via le hook useToast()
    <ToastProvider>
      <div className="app-layout">

        {/* ── Sidebar (navigation latérale) ── */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">L</span>
            Lexora
          </div>

          <ul>
            {NAV_ITEMS.map(({ to, label, icon, end }) => (
              <li key={to}>
                {/*
                  NavLink ajoute automatiquement la classe "active"
                  sur le lien correspondant à l'URL courante.
                  "end" sur "/" évite qu'il soit actif sur toutes les pages.
                */}
                <NavLink to={to} end={end}>
                  <span className="nav-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Zone de contenu principale ── */}
        <main className="content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/taches"    element={<Taches />} />
            <Route path="/business"  element={<ClientsFactures />} />
            <Route path="/equipe"    element={<Equipe />} />
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </main>

      </div>
    </ToastProvider>
  );
}
