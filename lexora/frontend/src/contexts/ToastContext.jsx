import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const hide = setTimeout(() => setExiting(true), 2700);
    const remove = setTimeout(onRemove, 3000);
    return () => { clearTimeout(hide); clearTimeout(remove); };
  }, [onRemove]);

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div
      className={`toast ${toast.type}${exiting ? ' exiting' : ''}`}
      onClick={onRemove}
    >
      <span className="toast-icon">{icons[toast.type] ?? 'ℹ'}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
