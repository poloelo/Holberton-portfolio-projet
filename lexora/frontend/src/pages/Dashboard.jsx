import { useState } from 'react';

export default function Dashboard() {
  // Simulation de données croisées issues du Calendrier et du Coffre-fort
  const [stats] = useState({
    totalDocs: 148,
    secureLevel: '98%',
    pendingInterventions: 5,
    monthlyExpenses: 2450, // Croisement Documents (Factures) / Calendrier
  });

  // Données pour le graphique à barres : Répartition des interventions par type ce mois-ci
  const activityData = [
    { label: 'Interventions', count: 12, color: '#4caf50' },
    { label: 'Livraisons', count: 8, color: '#2196f3' },
    { label: 'Réunions', count: 5, color: '#ff9800' },
    { label: 'Échéances', count: 3, color: '#e91e63' },
  ];

  // Données pour le graphique linéaire (Évolution des dépenses/factures sur les derniers mois)
  const financialTrend = [
    { month: 'Jan', value: 1200 },
    { month: 'Fév', value: 1800 },
    { month: 'Mar', value: 1400 },
    { month: 'Avr', value: 2900 },
    { month: 'Mai', value: 2450 },
  ];

  const maxFinancialValue = Math.max(...financialTrend.map(d => d.value));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📊 Tableau de Bord & Insights</h1>
        <p style={styles.subtitle}>Analyse croisée de vos interventions, de vos documents sécurisés et de vos échéances.</p>
      </header>

      {/* --- CARTES DE SYNTHÈSE (KPIs) --- */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiIcon}>🔒</span>
          <div>
            <div style={styles.kpiValue}>{stats.totalDocs}</div>
            <div style={styles.kpiLabel}>Documents Coffre-fort</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiIcon}>🛡️</span>
          <div>
            <div style={{ ...styles.kpiValue, color: '#4caf50' }}>{stats.secureLevel}</div>
            <div style={styles.kpiLabel}>Score de Sécurité</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiIcon}>⚙️</span>
          <div>
            <div style={{ ...styles.kpiValue, color: '#ff9800' }}>{stats.pendingInterventions}</div>
            <div style={styles.kpiLabel}>Urgences Planning</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiIcon}>💶</span>
          <div>
            <div style={styles.kpiValue}>{stats.monthlyExpenses} €</div>
            <div style={styles.kpiLabel}>Engagements / Factures (Mai)</div>
          </div>
        </div>
      </div>

      {/* --- ZONE DES GRAPHIQUES CROISÉS --- */}
      <div style={styles.chartsGrid}>
        
        {/* Graphique 1 : Répartition des Activités (Barres CSS) */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🔄 Volume d'Activités par Catégorie</h3>
          <p style={styles.chartSubtitle}>Croisement des typologies d'événements enregistrés dans l'agenda.</p>
          
          <div style={styles.barChartContainer}>
            {activityData.map((item) => {
              const percentage = (item.count / 15) * 100; // Normalisation visuelle
              return (
                <div key={item.label} style={styles.barRow}>
                  <span style={styles.barLabel}>{item.label}</span>
                  <div style={styles.barTrack}>
                    <div 
                      style={{ 
                        ...styles.barFill, 
                        width: `${percentage}%`, 
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                  <span style={styles.barCount}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique 2 : Évolution Financière (Graphique Linéaire SVG Natif) */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Flux de Facturation Détecté</h3>
          <p style={styles.chartSubtitle}>Montants cumulés extraits des documents du coffre-fort par l'IA.</p>
          
          <div style={styles.svgContainer}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
              {/* Lignes de repère horizontales */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#eee" strokeDasharray="4" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="#eee" strokeDasharray="4" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="#ddd" strokeWidth="1.5" />

              {/* Génération de la ligne brisée de tendance */}
              <polyline
                fill="none"
                stroke="#2196f3"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={financialTrend.map((d, index) => {
                  const x = 50 + index * 100;
                  // Inversion de l'axe Y pour le SVG (0 est en haut)
                  const y = 160 - (d.value / maxFinancialValue) * 130;
                  return `${x},${y}`;
                }).join(' ')}
              />

              {/* Points sur la ligne et labels */}
              {financialTrend.map((d, index) => {
                const x = 50 + index * 100;
                const y = 160 - (d.value / maxFinancialValue) * 130;
                return (
                  <g key={d.month}>
                    <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2196f3" strokeWidth="3" />
                    <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#333">{d.value}€</text>
                    <text x={x} y="180" textAnchor="middle" fontSize="11" fontWeight="500" fill="#777">{d.month}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* --- INSIGHTS GÉNÉRÉS PAR L'IA (Preview de la connexion globale) --- */}
      <div style={styles.insightSection}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>💡 Analyse Automatique de Lexora</h3>
        <p style={{ margin: 0, color: '#444', lineHeight: '1.5', fontSize: '0.9rem' }}>
          « <strong>Alerte Planning :</strong> 3 interventions sur le terrain sont programmées la même semaine que la date limite de renouvellement de vos licences CAO (15 Juin). De plus, l'analyse de vos documents montre une hausse de 35% des frais logistiques ce mois-ci. Pensez à automatiser un rappel d'échéance. »
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { marginBottom: '30px' },
  title: { fontSize: '1.6rem', fontWeight: '700', margin: 0, color: '#111' },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' },

  // Grille des compteurs clés
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  kpiCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' },
  kpiIcon: { fontSize: '1.8rem', backgroundColor: '#f1f3f5', padding: '10px', borderRadius: '10px' },
  kpiValue: { fontSize: '1.4rem', fontWeight: '700', color: '#111', lineHeight: '1.2' },
  kpiLabel: { fontSize: '0.8rem', color: '#666', fontWeight: '500', marginTop: '2px' },

  // Zone Graphiques
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px', marginBottom: '30px' },
  chartCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  chartTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111' },
  chartSubtitle: { margin: '4px 0 20px 0', color: '#777', fontSize: '0.82rem' },

  // Bar Chart CSS
  barChartContainer: { display: 'flex', flexDirection: 'column', gap: '14px' },
  barRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  barLabel: { width: '90px', fontSize: '0.85rem', fontWeight: '600', color: '#444' },
  barTrack: { flex: 1, height: '12px', backgroundColor: '#f1f3f5', borderRadius: '6px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '6px', transition: 'width 0.5s ease-out' },
  barCount: { width: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#111', textAlign: 'right' },

  // Line Chart SVG
  svgContainer: { marginTop: '10px', display: 'flex', justifyContent: 'center' },

  // Section Insights IA
  insightSection: { backgroundColor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '12px', padding: '20px', borderLeft: '5px solid #2196f3' }
};