import { useState } from 'react';
import { useEffect } from 'react'; // Assure-toi d'importer useEffect en haut

const initialEvents = [
  { id: 1, title: 'Livraison Matériel Rénovation', date: '2026-05-22', time: '09:00', type: 'Livraison', desc: 'Arrivée des câbles et disjoncteurs.', color: '#2196f3' },
  { id: 2, title: 'Maintenance Serveurs Local', date: '2026-05-20', time: '14:00', type: 'Intervention', desc: 'Back-ups et vérification des nœuds.', color: '#4caf50' },
  { id: 3, title: 'Audit Sécurité Informatique', date: '2026-05-25', time: '10:30', type: 'Réunion', desc: 'Point sur les accès réseau.', color: '#ff9800' },
  { id: 4, title: 'Renouvellement Licences CAO', date: '2026-06-15', time: '00:00', type: 'Échéance', desc: 'Fin de la période d\'essai annuelle.', color: '#e91e63' },
];

export default function Calendrier() {
  const [events, setEvents] = useState(initialEvents);
  const [currentView, setCurrentView] = useState('month'); 
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Mai 2026 par défaut
  
  // États pour l'ajout rapide depuis une case
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newType, setNewType] = useState('Intervention');
  const [newDesc, setNewDesc] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthsText = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // --- LOGIQUE GÉNÉRATION GRILLE MENSUELLE ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Aligner sur Lundi
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push({ type: 'empty', id: `empty-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
    gridCells.push({ type: 'day', day, dateStr, dayEvents, id: `day-${day}` });
  }

  // --- ACTIONS ---
  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
    setSelectedDateStr(null); // Ferme le formulaire si on change de mois
  };

  const handleCellClick = (dateStr) => {
    setSelectedDateStr(dateStr);
  };

  const handleQuickAddEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const colors = {
      Intervention: '#4caf50',
      Livraison: '#2196f3',
      Réunion: '#ff9800',
      Échéance: '#e91e63'
    };

    const newEvent = {
      id: Date.now(),
      title: newTitle,
      date: selectedDateStr,
      time: newTime || '00:00',
      type: newType,
      desc: newDesc,
      color: colors[newType] || '#9e9e9e'
    };

    setEvents([...events, newEvent]);
    
    // Reset du formulaire
    setNewTitle('');
    setNewTime('08:00');
    setNewDesc('');
    setSelectedDateStr(null);
  };
  useEffect(() => {
  // On expose la fonction à l'IA
  window.lexoraAddEvent = (title, date, time, type, desc) => {
    const colors = { Intervention: '#4caf50', Livraison: '#2196f3', Réunion: '#ff9800', Échéance: '#e91e63' };
    
    const newEvent = {
      id: Date.now(),
      title,
      date,
      time: time || '00:00',
      type: type || 'Intervention',
      desc: desc || '',
      color: colors[type] || '#9e9e9e'
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    return `L'événement "${title}" a été planifié avec succès pour le ${date}.`;
  };

  // Nettoyage quand on quitte la page
  return () => {
    delete window.lexoraAddEvent;
  };
}, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Gestion des Échéances & Planning</h1>
          <p style={styles.subtitle}>Sélectionnez une case du calendrier pour y ajouter instantanément un événement.</p>
        </div>
      </header>

      {/* Onglets de navigation */}
      <div style={styles.viewSelector}>
        <button style={{...styles.tabButton, backgroundColor: currentView === 'month' ? '#111' : '#fff', color: currentView === 'month' ? '#fff' : '#333'}} onClick={() => setCurrentView('month')}>Vue Mensuelle</button>
        <button style={{...styles.tabButton, backgroundColor: currentView === 'year' ? '#111' : '#fff', color: currentView === 'year' ? '#fff' : '#333'}} onClick={() => setCurrentView('year')}>Plan Annuel</button>
        <button style={{...styles.tabButton, backgroundColor: currentView === 'timeline' ? '#111' : '#fff', color: currentView === 'timeline' ? '#fff' : '#333'}} onClick={() => setCurrentView('timeline')}>Fil de l'eau</button>
      </div>

      {/* ================= VIEW MOIS INTERACTIVE ================= */}
      {currentView === 'month' && (
        <div style={styles.monthLayout}>
          <div style={{ ...styles.calendarCard, flex: '3', minWidth: '320px' }}>
            <div style={styles.calendarHeaderNav}>
              <button onClick={() => changeMonth(-1)} style={styles.navArrow}>◀</button>
              <h2 style={styles.monthTitle}>{monthsText[currentMonth]} {currentYear}</h2>
              <button onClick={() => changeMonth(1)} style={styles.navArrow}>▶</button>
            </div>

            <div style={styles.gridWeekdays}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} style={styles.weekdayCell}>{d}</div>)}
            </div>

            <div style={styles.gridMonth}>
              {gridCells.map((cell) => {
                const isSelected = selectedDateStr === cell.dateStr;
                return (
                  <div 
                    key={cell.id} 
                    onClick={() => cell.type === 'day' && handleCellClick(cell.dateStr)}
                    style={{ 
                      ...styles.dayCell, 
                      backgroundColor: cell.type === 'empty' ? '#fcfcfc' : isSelected ? '#e3f2fd' : '#ffffff',
                      borderColor: isSelected ? '#2196f3' : '#eee',
                      cursor: cell.type === 'day' ? 'pointer' : 'default'
                    }}
                  >
                    {cell.type === 'day' && (
                      <>
                        <span style={{...styles.dayNumber, color: isSelected ? '#2196f3' : '#888', fontWeight: isSelected ? '700' : '600'}}>{cell.day}</span>
                        <div style={styles.cellEventContainer}>
                          {cell.dayEvents.map(e => (
                            <div key={e.id} style={{ ...styles.miniEventBadge, backgroundColor: e.color }} title={`${e.time} - ${e.title}`}>
                              <span style={{fontWeight: '700', marginRight: '3px'}}>{e.time}</span> {e.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulaire Contextuel d'Ajout (S'ouvre sur le côté ou au-dessous) */}
          {selectedDateStr && (
            <div style={styles.quickAddCard}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{margin: 0, fontSize: '1.05rem'}}>➕ Ajouter au {new Date(selectedDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</h3>
                <button onClick={() => setSelectedDateStr(null)} style={styles.closeButton}>✖</button>
              </div>

              <form onSubmit={handleQuickAddEvent} style={styles.formContainer}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nom de l'échéance / tâche</label>
                  <input type="text" placeholder="Ex: Réception livraison bois" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Heure</label>
                  <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Catégorie</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} style={styles.select}>
                    <option value="Intervention">⚙️ Intervention</option>
                    <option value="Livraison">📦 Livraison</option>
                    <option value="Réunion">🤝 Réunion</option>
                    <option value="Échéance">🚨 Échéance Impérative</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description / Notes</label>
                  <textarea placeholder="Ajouter des précisions, numéros de suivi..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ ...styles.input, minHeight: '50px', resize: 'none' }} />
                </div>

                <button type="submit" style={styles.submitButton}>Planifier</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW ANNÉE ================= */}
      {currentView === 'year' && (
        <div style={styles.yearGridContainer}>
          {monthsText.map((monthName, monthIndex) => {
            const targetMonthStr = `2026-${String(monthIndex + 1).padStart(2, '0')}`;
            const monthEvents = events.filter(e => e.date.startsWith(targetMonthStr));

            return (
              <div key={monthName} style={styles.yearMonthCard}>
                <h4 style={styles.yearMonthTitle}>{monthName} 2026</h4>
                <div style={styles.yearEventList}>
                  {monthEvents.length === 0 ? (
                    <span style={styles.noEventsText}>Aucune échéance</span>
                  ) : (
                    monthEvents.map(e => (
                      <div key={e.id} style={{ ...styles.yearEventItem, borderLeftColor: e.color }}>
                        <div style={{fontWeight: '600', fontSize: '0.78rem'}}>
                          <span style={{color: '#666', marginRight: '4px'}}>{e.date.split('-')[2]} ({e.time}) :</span> 
                          {e.title}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW TIMELINE ================= */}
      {currentView === 'timeline' && (
        <div style={styles.timelineContainer}>
          {events.map(e => (
            <div key={e.id} style={{ ...styles.timelineCard, borderLeftColor: e.color }}>
              <span style={styles.timelineDate}>🗓️ {e.date} à {e.time}</span>
              <h4 style={{ margin: '5px 0' }}>{e.title}</h4>
              {e.desc && <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{e.desc}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { marginBottom: '25px' },
  title: { fontSize: '1.6rem', fontWeight: '700', margin: 0 },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' },
  
  viewSelector: { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #ddd', paddingBottom: '15px' },
  tabButton: { border: '1px solid #ccc', padding: '8px 16px', borderRadius: '20px', fontWeight: '500', cursor: 'pointer' },
  
  // Layout adaptatif Mois + Formulaire latéral
  monthLayout: { display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' },
  calendarCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  calendarHeaderNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  monthTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '700' },
  navArrow: { background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer' },
  
  gridWeekdays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '600', color: '#666', paddingBottom: '10px', fontSize: '0.85rem' },
  gridMonth: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#eee', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' },
  dayCell: { minHeight: '95px', backgroundColor: '#fff', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid transparent', transition: 'all 0.1s' },
  dayNumber: { fontSize: '0.8rem' },
  cellEventContainer: { display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' },
  miniEventBadge: { color: '#fff', fontSize: '0.68rem', padding: '2px 4px', borderRadius: '3px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  // Panneau d'ajout rapide sur le côté
  quickAddCard: { flex: '1', minWidth: '260px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #2196f3', padding: '20px', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.08)' },
  closeButton: { background: 'none', border: 'none', fontSize: '1rem', color: '#999', cursor: 'pointer' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: '#555' },
  input: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', fontFamily: 'inherit' },
  select: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', backgroundColor: '#fff' },
  submitButton: { backgroundColor: '#2196f3', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem', marginTop: '5px' },

  // Styles Année & Timeline déduits du précédent
  yearGridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  yearMonthCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '10px', padding: '15px' },
  yearMonthTitle: { margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px', fontWeight: '700' },
  yearEventList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  yearEventItem: { borderLeft: '3px solid #ccc', padding: '4px 6px', backgroundColor: '#f9f9f9', borderRadius: '3px' },
  noEventsText: { fontSize: '0.8rem', color: '#bbb', fontStyle: 'italic' },
  timelineContainer: { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' },
  timelineCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee', borderLeft: '5px solid #ccc' },
  timelineDate: { fontSize: '0.75rem', fontWeight: '700', color: '#777' }
};