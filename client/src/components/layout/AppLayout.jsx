import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../common/Logo.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Toaster } from 'react-hot-toast';
import { useLiveObservations } from '../../hooks/useLiveObservations.js';
import { useState, useEffect, useRef } from 'react';

export function AppLayout() {
  const liveObs = useLiveObservations();
  const latestObs = liveObs[0];
  
  // Infer hazardous conditions: rain (humidity > 95%), extreme cold (< -50C), high winds (> 80m/s)
  const isHarmful = !!latestObs && (latestObs.humidity >= 95 || latestObs.temperature <= -50 || latestObs.windSpeed >= 80);
  
  const [showAlert, setShowAlert] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [alertsLog, setAlertsLog] = useState([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const lastAlertRef = useRef('');

  let alertMessage = "";
  if (latestObs) {
    if (latestObs.humidity >= 95) alertMessage = '⚠️ WARNING: Heavy Clouds / Rain Detected';
    else if (latestObs.temperature <= -50) alertMessage = '❄️ CRITICAL: Extreme Cold Zone (-50C)';
    else if (latestObs.windSpeed >= 80) alertMessage = '🌪️ HIGH WINDS: Severe Turbulence';
  }

  useEffect(() => {
    if (isHarmful && alertMessage && alertMessage !== lastAlertRef.current) {
      setShowAlert(true);
      lastAlertRef.current = alertMessage;
      setAlertsLog(prev => [{ time: new Date().toLocaleTimeString(), message: alertMessage }, ...prev].slice(0, 50));
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    } else if (!isHarmful) {
      setShowAlert(false);
    }
  }, [isHarmful, alertMessage]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--neu-bg)' }}>
      <Sidebar onOpenAlerts={() => setIsAlertsOpen(true)} unreadAlerts={alertsLog.length} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0 relative">
        {/* Mobile Header: Sticky at Top with Toggler, Brand, and User Role / Sign Out */}
        <header className="md:hidden sticky top-0 z-50 bg-[var(--neu-bg)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-3 py-2.5 flex items-center justify-between shadow-sm">
          {/* Left: Toggler + Brand */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="neu-button p-2 rounded-xl text-main hover:text-emerald-500 focus:outline-none flex items-center justify-center transition-colors"
              aria-label="Open Navigation Menu"
              title="Open Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <Logo size="small" showText={false} />
              <span className="font-extrabold text-sm tracking-tight text-main">UAS-RTMVD</span>
            </div>
          </div>

          {/* Right: User Role Badge + Quick Sign Out Button */}
          <div className="flex items-center gap-2">
            <div className="neu-pressed px-2.5 py-1 rounded-full flex items-center gap-1.5" title={`Signed in as ${user?.name || 'Admin'} (${user?.role || 'admin'})`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-main">{user?.role || 'admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="neu-button p-2 rounded-xl text-red-500 hover:text-red-400 focus:outline-none transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>
        

        {isAlertsOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--neu-surface)] w-full max-w-lg rounded-2xl p-6 border border-[var(--border-subtle)] shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-main">System Alerts</h2>
                <button onClick={() => setIsAlertsOpen(false)} className="text-subtle hover:text-main text-xl">X</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {alertsLog.length === 0 ? (
                  <p className="text-subtle text-center py-8">No active alerts.</p>
                ) : alertsLog.map((log, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[var(--neu-bg)] border border-red-500/20 flex flex-col">
                    <span className="text-xs text-subtle mb-1">{log.time}</span>
                    <span className="text-sm font-semibold text-main">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--neu-surface)',
              color: 'var(--text-main)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '6px 6px 14px var(--neu-shadow-dark), -6px -6px 14px var(--neu-shadow-light)',
            },
            success: { iconTheme: { primary: '#51cf66', secondary: 'var(--neu-surface)' } },
            error: { iconTheme: { primary: '#ff6b6b', secondary: 'var(--neu-surface)' } },
          }}
        />
        <Outlet />
      </main>
    </div>
  );
}















