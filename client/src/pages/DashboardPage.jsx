import { useEffect, useState } from 'react';
import { useDashboard } from '../hooks/useDashboard.js';
import { useLiveObservations } from '../hooks/useLiveObservations.js';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { collectionService } from '../services/collectionService.js';
import toast from 'react-hot-toast';
import { StatCard } from '../components/common/StatCard.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { TemperatureChart } from '../components/charts/TemperatureChart.jsx';
import { PressureChart } from '../components/charts/PressureChart.jsx';
import { HumidityChart } from '../components/charts/HumidityChart.jsx';
import { AltitudeProfileChart } from '../components/charts/AltitudeProfileChart.jsx';
import { WindSpeedChart } from '../components/charts/WindSpeedChart.jsx';
import { WindCompass } from '../components/charts/WindCompass.jsx';

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString();
}

export function DashboardPage() {
  const { summary, latest, isLoading, error, refetch } = useDashboard();
  const liveObs = useLiveObservations();
  const { dataSourceMode: viewMode } = useDataSource();
  const { user } = useAuth();
  
  const canControl = user?.role === 'admin' || user?.role === 'operator';
  const [isStarting, setIsStarting] = useState(false);
  const [stopConfirmId, setStopConfirmId] = useState(null);

  async function handleStart() {
    setIsStarting(true);
    try { 
      await collectionService.start({ sessionName: `Session ${new Date().toLocaleString()}` }); 
      await refetch();
      toast.success('Session started');
    }
    catch (err) { toast.error(err.message); }
    finally { setIsStarting(false); }
  }

  async function handleStop(sessionId) {
    try { 
      await collectionService.stop(sessionId); 
      setStopConfirmId(null); 
      await refetch();
      toast.success('Session stopped');
    }
    catch (err) { toast.error(err.message); setStopConfirmId(null); }
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Filter the live observation stream and historical latest data based on selected mode
  const filteredLiveObs = liveObs.filter(obs => obs.source === viewMode);
  const filteredLatest = latest?.filter(obs => obs.source === viewMode) || [];
  
  const chartData = filteredLiveObs.length > 0 ? [...filteredLiveObs].reverse() : filteredLatest;
  const newestObs = chartData[chartData.length - 1];

  useEffect(() => {
    if (liveObs.length > 0) refetch();
  }, [liveObs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <LoadingSpinner className="mt-24" />;
  if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex-1 min-h-screen" style={{ background: 'var(--neu-bg)' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Dashboard</h1>
          <p className="text-subtle text-sm mt-0.5">Real-time atmospheric overview</p>
        </div>
        
        <div className="flex items-center gap-4">

            
            {summary?.activeSession && <Badge label="Live Session" variant="running" />}
{/* Start/Stop Session Text Buttons */}
          {canControl && (
            <div className="flex rounded-xl gap-2">
              {summary?.activeSession ? (
                <button onClick={() => setStopConfirmId(summary.activeSession.id)}
                  title="Stop active session"
                  className="px-4 py-2 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ff6b6b, #fa5252)' }}>Stop
                </button>
              ) : (
                <button onClick={handleStart} disabled={isStarting}
                  title="Start new session"
                  className="px-4 py-2 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #51cf66, #40c057)' }}>Start
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 8 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Temperature" value={newestObs?.temperature?.toFixed(1)} unit="°C"
                  orbClass="orb-temp" icon="🌡️" gradClass="grad-text-temp" />
        <StatCard label="Pressure" value={newestObs?.pressure?.toFixed(1)} unit="hPa"
                  orbClass="orb-pressure" icon="☁️" gradClass="grad-text-pressure" />
        <StatCard label="Humidity" value={newestObs?.humidity?.toFixed(1)} unit="%"
                  orbClass="orb-humidity" icon="💧" gradClass="grad-text-humidity" />
        <StatCard label="Wind Speed" value={newestObs?.windSpeed?.toFixed(1)} unit="m/s"
                  orbClass="orb-wind" icon="💨" gradClass="grad-text-wind" />
        <StatCard label="Altitude" value={newestObs?.altitude?.toFixed(0)} unit="m"
                  orbClass="orb-altitude" icon="📡" gradClass="grad-text-altitude" />
        <StatCard label="Wind Dir" value={newestObs?.windDirection?.toFixed(0)} unit="°"
                  orbClass="orb-wind" icon="💨" gradClass="grad-text-wind" />
        <StatCard label="Observations" value={summary?.totalObservations?.toLocaleString()}
                  orbClass="orb-primary" icon="⏱️" gradClass="grad-text-primary" />
        <StatCard label="Last Record" value={newestObs ? new Date(newestObs.recordedAt).toLocaleTimeString() : '—'}
                  orbClass="orb-primary" icon="⏱️" gradClass="grad-text-primary" />
      </div>

      {/* Charts Grid */}
      {chartData.length === 0 ? (
        <EmptyState
          title="No observations yet"
          description="Start a data collection session to see live charts."
        />
      ) : (
        <>
          {/* Top row: Wind Compass + Wind Speed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="neu-flat p-5 flex flex-col items-center justify-center">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1 self-start">Wind Compass</p>
              <p className="grad-text-wind text-sm font-semibold mb-4 self-start">Direction & Speed</p>
              <WindCompass
                direction={newestObs?.windDirection ?? 0}
                speed={newestObs?.windSpeed ?? 0}
              />
            </div>
            <div className="neu-flat p-5">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1">Wind Speed</p>
              <p className="grad-text-wind text-sm font-semibold mb-3">m/s over time</p>
              <WindSpeedChart data={chartData} />
            </div>
          </div>

          {/* Second row: Temperature + Pressure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="neu-flat p-5">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1">Temperature</p>
              <p className="grad-text-temp text-sm font-semibold mb-3">°C over time</p>
              <TemperatureChart data={chartData} />
            </div>
            <div className="neu-flat p-5">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1">Pressure</p>
              <p className="grad-text-pressure text-sm font-semibold mb-3">hPa over time</p>
              <PressureChart data={chartData} />
            </div>
          </div>

          {/* Third row: Humidity + Altitude Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="neu-flat p-5">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1">Humidity</p>
              <p className="grad-text-humidity text-sm font-semibold mb-3">% RH over time</p>
              <HumidityChart data={chartData} />
            </div>
            <div className="neu-flat p-5">
              <p className="text-xs text-subtle uppercase tracking-widest mb-1">Altitude Profile</p>
              <p className="grad-text-altitude text-sm font-semibold mb-3">Temperature vs Altitude</p>
              <AltitudeProfileChart data={chartData} />
            </div>
          </div>

          {/* Recent observations mini-table */}
          <div className="neu-flat p-5">
            <p className="text-xs text-subtle uppercase tracking-widest mb-4">Recent Observations</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-main">
                <thead>
                  <tr className="text-subtle text-xs border-b border-[var(--table-border)]">
                    <th className="text-left pb-2">Time</th>
                    <th className="text-right pb-2">Alt</th>
                    <th className="text-right pb-2">Temp</th>
                    <th className="text-right pb-2">Press</th>
                    <th className="text-right pb-2">Hum</th>
                    <th className="text-right pb-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chartData].reverse().slice(0, 8).map((obs, i) => (
                    <tr key={obs._id || i} className="border-b border-[var(--table-border)] hover:bg-[var(--table-hover)] transition-colors duration-200">
                      <td className="py-2 text-subtle font-medium">{new Date(obs.recordedAt).toLocaleTimeString()}</td>
                      <td className="text-right"><span className="grad-text-altitude font-bold">{obs.altitude?.toFixed(0)}</span><span className="text-subtle text-xs ml-0.5"> m</span></td>
                      <td className="text-right"><span className="grad-text-temp font-bold">{obs.temperature?.toFixed(1)}</span><span className="text-subtle text-xs ml-0.5">°C</span></td>
                      <td className="text-right"><span className="grad-text-pressure font-bold">{obs.pressure?.toFixed(1)}</span><span className="text-subtle text-xs ml-0.5"> hPa</span></td>
                      <td className="text-right"><span className="grad-text-humidity font-bold">{obs.humidity?.toFixed(1)}</span><span className="text-subtle text-xs ml-0.5">%</span></td>
                      <td className="text-right"><Badge label={obs.source} variant={obs.source} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog isOpen={!!stopConfirmId} title="Stop Collection Session"
        message="Stop the active data collection session?"
        confirmLabel="Stop" danger
        onConfirm={() => handleStop(stopConfirmId)}
        onCancel={() => setStopConfirmId(null)} />
    </div>
  );
}








