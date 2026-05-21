/**
 * Dashboard.jsx — Vue d'ensemble de l'activité Lexora
 *
 * Sections :
 *  1. Cartes de stats animées (tâches, factures, volume)
 *  2. Tâches récentes (tâches projet + todos rapides fusionnés)
 *  3. Factures récentes
 *  4. Analytique : créateur de tableau CSV + analyse IA du coffre-fort
 */

import { useEffect, useState, useRef } from 'react';

// ── Animation de compteur ─────────────────────────────────
// Anime une valeur numérique de 0 → target avec easing cubique
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (target === prev.current) return;
    const start = prev.current;
    const diff  = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const frame = now => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(frame);
      else prev.current = target;
    };
    requestAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const CARD_COLORS = ['#7c6af7', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

function StatCard({ icon, value, label, color, suffix = '' }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <span className="stat-icon">{icon}</span>
      <div className="number">{animated}{suffix}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function RecentItem({ name, badge, badgeClass, typeBadge, typeCls }) {
  return (
    <div className="recent-item">
      <span className="recent-item-name">{name}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {typeBadge && <span className={`badge ${typeCls}`}>{typeBadge}</span>}
        {badge     && <span className={`badge ${badgeClass}`}>{badge}</span>}
      </div>
    </div>
  );
}

const STATUT_TACHE = {
  todo:        { label: 'À faire',  cls: 'badge-todo' },
  in_progress: { label: 'En cours', cls: 'badge-in-progress' },
  done:        { label: 'Terminé',  cls: 'badge-done' },
};

const STATUT_FACTURE = {
  'en attente': { label: 'En attente', cls: 'badge-pending' },
  payee:        { label: 'Payée',      cls: 'badge-paid' },
  annulee:      { label: 'Annulée',    cls: 'badge-cancelled' },
};

export default function Dashboard() {
  // ── Données principales ────────────────────────────────
  const [taches,   setTaches]   = useState([]);
  const [todos,    setTodos]    = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Analytique : CSV ───────────────────────────────────
  const [csvText, setCsvText] = useState('');
  const [csvRows, setCsvRows] = useState([]);

  // ── Analytique : analyse IA ────────────────────────────
  const [analyzing,      setAnalyzing]      = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/taches').then(r => r.json()).catch(() => []),
      fetch('/api/factures').then(r => r.json()).catch(() => []),
      fetch('/api/todos').then(r => r.json()).catch(() => []),
    ]).then(([t, f, td]) => {
      setTaches(Array.isArray(t) ? t : []);
      setFactures(Array.isArray(f) ? f : []);
      setTodos(Array.isArray(td) ? td : []);
      setLoading(false);
    });
  }, []);

  const tachesEnCours    = taches.filter(t => t.statut === 'in_progress').length;
  const facturesImpayees = factures.filter(f => f.statut === 'en attente').length;
  const totalFactures    = factures.reduce((s, f) => s + (f.montant || 0), 0);

  // Fusionne tâches projet + todos rapides triés par date décroissante
  const recentItems = [
    ...taches.map(t => ({
      id:        `t-${t.id}`,
      name:      t.titre,
      created_at: t.created_at,
      badge:     STATUT_TACHE[t.statut]?.label || t.statut,
      badgeCls:  STATUT_TACHE[t.statut]?.cls   || 'badge-todo',
      typeBadge: 'Projet',
      typeCls:   'badge-project',
    })),
    ...todos.map(t => ({
      id:        `todo-${t.id}`,
      name:      t.titre,
      created_at: t.created_at,
      badge:     null,
      badgeCls:  null,
      typeBadge: 'Rapide',
      typeCls:   'badge-quick',
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentFactures = [...factures].reverse().slice(0, 5);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── CSV : parsing simple (pas de guillemets) ───────────
  const parseCSV = () => {
    const lines = csvText.trim().split('\n').filter(Boolean);
    if (lines.length === 0) { setCsvRows([]); return; }
    setCsvRows(lines.map(l => l.split(',').map(c => c.trim())));
  };

  const downloadCSV = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'export.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Analyse IA : liste des documents → résumé ──────────
  // On envoie la liste brute des fichiers du coffre-fort à l'assistant
  // pour obtenir un résumé et des recommandations.
  const analyzeVault = async () => {
    setAnalyzing(true);
    setAnalysisResult('');
    try {
      const docs = await fetch('/api/documents').then(r => r.json()).catch(() => []);
      const list = (Array.isArray(docs) ? docs : [])
        .map(d => `- ${d.nom} (${d.type ?? 'Inconnu'}, statut : ${d.statut ?? '—'})`)
        .join('\n');
      const prompt =
        `Voici la liste des documents stockés dans le coffre-fort de l'entreprise :\n` +
        `${list || '(aucun document)'}\n\n` +
        `Fais une analyse courte : quels types de documents sont présents, y a-t-il des ` +
        `statuts préoccupants, et donne deux ou trois recommandations concrètes pour mieux ` +
        `organiser ces documents. Réponds en français, de façon concise.`;
      const res  = await fetch('/api/assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAnalysisResult(data.response ?? 'Pas de réponse reçue.');
    } catch {
      setAnalysisResult('Erreur lors de la connexion à l\'assistant.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-enter">
      <h1>Dashboard</h1>
      <p className="page-subtitle">{today}</p>

      {/* ── Cartes de statistiques ── */}
      {loading ? (
        <div className="stats-grid">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, margin: '0 auto 10px' }} />
              <div className="skeleton" style={{ width: 70, height: 32, margin: '0 auto 8px' }} />
              <div className="skeleton" style={{ width: 90, height: 14, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard icon="✓" value={taches.length}           label="Tâches projet"    color={CARD_COLORS[0]} />
          <StatCard icon="☑" value={todos.length}            label="Notes rapides"    color={CARD_COLORS[1]} />
          <StatCard icon="€" value={factures.length}         label="Factures"         color={CARD_COLORS[2]} />
          <StatCard icon="⏳" value={facturesImpayees}        label="En attente"       color={CARD_COLORS[3]} />
          <StatCard icon="∑" value={Math.round(totalFactures)} label="Volume total (€)" color={CARD_COLORS[4]} />
        </div>
      )}

      {/* ── Sections récentes ── */}
      <div className="dashboard-grid">
        <div className="recent-section">
          <div className="recent-header">✓ Activité récente</div>
          {recentItems.length === 0 ? (
            <div className="empty-state"><p>Aucune activité</p></div>
          ) : recentItems.map(item => (
            <RecentItem
              key={item.id}
              name={item.name}
              badge={item.badge}
              badgeClass={item.badgeCls}
              typeBadge={item.typeBadge}
              typeCls={item.typeCls}
            />
          ))}
        </div>

        <div className="recent-section">
          <div className="recent-header">€ Factures récentes</div>
          {recentFactures.length === 0 ? (
            <div className="empty-state"><p>Aucune facture</p></div>
          ) : recentFactures.map(f => {
            const s = STATUT_FACTURE[f.statut] || { label: f.statut, cls: 'badge-pending' };
            return <RecentItem key={f.id} name={`${f.client} — ${f.montant} €`} badge={s.label} badgeClass={s.cls} />;
          })}
        </div>
      </div>

      {/* ── Section Analytique ── */}
      <h2 style={{ marginTop: 36, marginBottom: 16, fontSize: '1.05rem', color: '#444' }}>
        Outils analytiques
      </h2>
      <div className="analytics-grid">

        {/* Bloc 1 : Créateur de tableau CSV */}
        <div className="analytics-card">
          <div className="analytics-card-title">📊 Créateur de tableau CSV</div>
          <p className="analytics-card-desc">
            Collez un CSV (virgule comme séparateur) — la première ligne devient les en-têtes.
          </p>
          <textarea
            className="analytics-textarea"
            rows={5}
            placeholder={"Nom,Prénom,Email\nDupont,Marie,marie@mail.fr\nMartin,Paul,paul@mail.fr"}
            value={csvText}
            onChange={e => { setCsvText(e.target.value); setCsvRows([]); }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="secondary" onClick={parseCSV} disabled={!csvText.trim()}>
              Générer le tableau
            </button>
            {csvRows.length > 0 && (
              <button className="secondary" onClick={downloadCSV}>
                ↓ Télécharger CSV
              </button>
            )}
          </div>

          {/* Tableau rendu depuis le CSV */}
          {csvRows.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    {/* La première ligne du CSV devient les en-têtes */}
                    {csvRows[0].map((cell, i) => <th key={i}>{cell}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bloc 2 : Analyse IA du coffre-fort */}
        <div className="analytics-card">
          <div className="analytics-card-title">◈ Analyse IA du coffre-fort</div>
          <p className="analytics-card-desc">
            L'assistant analyse automatiquement la liste de vos documents et propose des recommandations.
          </p>
          <button onClick={analyzeVault} disabled={analyzing} style={{ marginTop: 8 }}>
            {analyzing
              ? <><span className="spinner" /> Analyse en cours...</>
              : 'Lancer l\'analyse'}
          </button>

          {/* Résultat de l'analyse */}
          {analysisResult && (
            <div className="analytics-result">
              {analysisResult}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
