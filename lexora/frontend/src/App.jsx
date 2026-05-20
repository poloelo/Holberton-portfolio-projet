import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';   // Ok (Dashboard.jsx)
import Taches from './pages/Taches.jsx';         // Ok (Taches.jsx)
import CoffreFort from './pages/Coffre_fort.jsx'; // Corrigé : Import aligné sur la majuscule et nom plus clair
import Planning from './pages/Planning.jsx';     // Ok (Planning.jsx)
import Assistant from './pages/Assistant.jsx';   // Ok (Assistant.jsx)

export default function App() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">Lexora</div>
        <ul>
          {/* Les liens de navigation avec des URLs en minuscules (convention standard) */}
          <li><NavLink to="/" end>📊 Insights & Recs</NavLink></li>
          <li><NavLink to="/coffre-fort">📁 Docs Personnels</NavLink></li>
          <li><NavLink to="/planning">📅 Calendrier</NavLink></li>
          <li><NavLink to="/automatisations">⚙️ Automatisations</NavLink></li>
          
          <hr style={{ border: '0.5px solid #444', margin: '15px 0' }} />
          
          {/* L'accès à ton IA */}
          <li><NavLink to="/assistant">🤖 Assistant IA</NavLink></li>
        </ul>
      </nav>
      
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coffre-fort" element={<CoffreFort />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/automatisations" element={<Taches />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </main>
    </div>
  );
}