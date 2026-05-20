import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Taches from './pages/Taches.jsx';
import Factures from './pages/Factures.jsx';
import Planning from './pages/Planning.jsx';
import Assistant from './pages/Assistant.jsx';
import Todos from './pages/Todos.jsx';
import Clients from './pages/Clients.jsx';
import Employes from './pages/Employes.jsx';
import Automations from './pages/Automations.jsx';

export default function App() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">Lexora</div>
        <ul>
          <li><NavLink to="/" end>Dashboard</NavLink></li>
          <li><NavLink to="/taches">Taches</NavLink></li>
          <li><NavLink to="/factures">Factures</NavLink></li>
          <li><NavLink to="/planning">Planning</NavLink></li>
          <li><NavLink to="/assistant">Assistant IA</NavLink></li>
          <li><NavLink to="/todos">Todos</NavLink></li>
          <li><NavLink to="/clients">Clients</NavLink></li>
          <li><NavLink to="/employes">Employes</NavLink></li>
          <li><NavLink to="/automations">Automations</NavLink></li>
        </ul>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/taches" element={<Taches />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/employes" element={<Employes />} />
          <Route path="/automations" element={<Automations />} />
        </Routes>
      </main>
    </div>
  );
}
