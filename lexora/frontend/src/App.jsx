import { Routes, Route, NavLink } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Taches from './pages/Taches.jsx';
import Factures from './pages/Factures.jsx';
import Planning from './pages/Planning.jsx';
import Assistant from './pages/Assistant.jsx';
import Todos from './pages/Todos.jsx';
import Clients from './pages/Clients.jsx';
import Employes from './pages/Employes.jsx';
import Automations from './pages/Automations.jsx';

const navItems = [
  { to: '/',           label: 'Dashboard',    icon: '▦',  end: true },
  { to: '/taches',     label: 'Tâches',       icon: '✓' },
  { to: '/factures',   label: 'Factures',     icon: '€' },
  { to: '/planning',   label: 'Planning',     icon: '◫' },
  { to: '/assistant',  label: 'Assistant IA', icon: '◈' },
  { to: '/todos',      label: 'Todos',        icon: '☑' },
  { to: '/clients',    label: 'Clients',      icon: '◉' },
  { to: '/employes',   label: 'Employés',     icon: '◎' },
  { to: '/automations',label: 'Automations',  icon: '⚙' },
];

export default function App() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">L</span>
            Lexora
          </div>
          <ul>
            {navItems.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}>
                  <span className="nav-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/taches"      element={<Taches />} />
            <Route path="/factures"    element={<Factures />} />
            <Route path="/planning"    element={<Planning />} />
            <Route path="/assistant"   element={<Assistant />} />
            <Route path="/todos"       element={<Todos />} />
            <Route path="/clients"     element={<Clients />} />
            <Route path="/employes"    element={<Employes />} />
            <Route path="/automations" element={<Automations />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
