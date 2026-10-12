import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from 'react-leaflet';
import { useLiveObservations } from '../hooks/useLiveObservations.js';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { collectionService } from '../services/collectionService.js';
import { Badge } from '../components/common/Badge.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
}

import * as L from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState, useMemo } from 'react';
import { AltitudeProfileChart } from '../components/charts/AltitudeProfileChart.jsx';
import { SoundingChart } from '../components/charts/SoundingChart.jsx';

function MapEvents({ center, isAutoPanEnabled, setIsAutoPanEnabled }) {
  const map = useMap();
  useMapEvents({ dragstart: () => { if (isAutoPanEnabled) setIsAutoPanEnabled(false); } });
  useEffect(() => { setTimeout(() => { map.invalidateSize(); }, 200); }, [map]);
  useEffect(() => { if (center && isAutoPanEnabled) map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 }); }, [center, isAutoPanEnabled, map]);
  return null;
}

export function FlightTrackingPage() {
  const liveObs = useLiveObservations();
  const { dataSourceMode } = useDataSource();
  const { summary, refetch } = useDashboard();
  const { user } = useAuth();
  const canControl = user?.role === 'admin' || user?.role === 'operator';
  const [isStarting, setIsStarting] = useState(false);
  const [stopConfirmId, setStopConfirmId] = useState(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'myaccessToken';

  const mapTypes = {
    mapbox: {
      name: 'Mapbox Streets',
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1
    },
    satellite: { 
      name: 'Satellite', 
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
      overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', 
      attribution: '&copy; Esri',
      maxZoom: 19
    }
  };
  const [selectedMapType, setSelectedMapType] = useState('mapbox');
  const [mapInstance, setMapInstance] = useState(null);
  const [isAutoPanEnabled, setIsAutoPanEnabled] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);

  const pathData = useMemo(() => {
    return [...liveObs]
      .filter(obs => obs.source === dataSourceMode && obs.latitude != null && obs.longitude != null)
      .reverse(); 
  }, [liveObs, dataSourceMode]);

  const latest = pathData[pathData.length - 1];
  const start = pathData[0];
  const positions = pathData.map(obs => [obs.latitude, obs.longitude]);
  const distanceKm = start && latest ? calculateDistance(start.latitude, start.longitude, latest.latitude, latest.longitude) : 0;

  let ascentRate = 0;
  if (pathData.length >= 2) {
    const p1 = pathData[pathData.length - 2];
    const p2 = pathData[pathData.length - 1];
    const dt = (new Date(p2.recordedAt) - new Date(p1.recordedAt)) / 1000;
    if (dt > 0) ascentRate = (p2.altitude - p1.altitude) / dt;
  }

  function handleFitBounds() {
    if (mapInstance && positions.length > 0) {
      mapInstance.fitBounds(positions, { padding: [50, 50] });
      setIsAutoPanEnabled(false);
    }
  }

  async function handleStart() {
    setIsStarting(true);
    try { 
      await collectionService.start({ sessionName: 'Flight Tracking ' + new Date().toLocaleString() }); 
      await refetch();
      toast.success('Session started');
    } catch (err) { toast.error(err.message); }
    finally { setIsStarting(false); }
  }

  async function handleStop(sessionId) {
    try { 
      await collectionService.stop(sessionId); 
      setStopConfirmId(null); 
      await refetch();
      toast.success('Session stopped');
    } catch (err) { toast.error(err.message); setStopConfirmId(null); }
  }

  const pulsatingIcon = useMemo(() => new L.divIcon({
    className: 'pulsating-dot',
    html: '<div class="ring"></div><div class="circle"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }), []);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full min-h-screen" style={{ background: 'var(--neu-bg)' }}>
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-2xl font-bold text-main">Flight Tracking</h1>
          <p className="text-subtle text-sm mt-0.5">Real-time balloon location and path</p>
        </div>
        
        <div className="flex items-center flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-subtle font-bold">Map Source:</span>
            <select
              value={selectedMapType}
              onChange={(e) => setSelectedMapType(e.target.value)}
              className="neu-pressed px-3 py-1.5 text-xs font-bold rounded-lg text-main outline-none focus:ring-2 focus:ring-[var(--accent-primary)] cursor-pointer"
            >
              {Object.entries(mapTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          {latest && (
            <div className="flex gap-4">
              <div className="neu-flat px-4 py-2 text-right">
                <p className="text-[10px] uppercase text-subtle font-bold tracking-widest">Altitude</p>
                <p className="font-bold text-main">{latest.altitude?.toFixed(0)} <span className="text-xs text-subtle">m</span></p>
              </div>
              <div className="neu-flat px-4 py-2 text-right">
                <p className="text-[10px] uppercase text-subtle font-bold tracking-widest">Ascent Rate</p>
                <p className="font-bold text-main">{ascentRate > 0 ? '+' : ''}{ascentRate.toFixed(1)} <span className="text-xs text-subtle">m/s</span></p>
              </div>
              <div className="neu-flat px-4 py-2 text-right">
                <p className="text-[10px] uppercase text-subtle font-bold tracking-widest">Distance</p>
                <p className="font-bold text-main">{distanceKm.toFixed(2)} <span className="text-xs text-subtle">km</span></p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 neu-flat p-2 rounded-2xl relative z-10 flex flex-col" style={{ minHeight: '500px', height: '60vh' }}>
        
        {/* Advanced Map Controls Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 p-2 bg-[var(--neu-surface)]/60 backdrop-blur-xl border border-[var(--border-subtle)]/50 rounded-xl shadow-xl shadow-black/5">
          <button 
            onClick={() => setIsAutoPanEnabled(!isAutoPanEnabled)}
            className={"px-3 py-2 flex items-center gap-2 rounded-lg text-xs font-bold transition-all hover:scale-105 " + (isAutoPanEnabled ? 'shadow-md shadow-emerald-500/20' : 'hover:bg-[var(--neu-surface-raised)]/80 text-main')}
            style={isAutoPanEnabled ? { background: '#10b981', color: '#ffffff' } : {}}
          >
            <span className="text-sm">{isAutoPanEnabled ? String.fromCodePoint(0x1F3AF) : String.fromCodePoint(0x26F6)}</span>
            {isAutoPanEnabled ? 'Auto-Center: ON' : 'Auto-Center: OFF'}
          </button>
          
          <button 
            onClick={() => setShowTrajectory(!showTrajectory)}
            className="px-3 py-2 flex items-center gap-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:bg-[var(--neu-surface-raised)]/80 text-main"
          >
            <span className="text-sm">{showTrajectory ? String.fromCodePoint(0x1F441, 0xFE0F) : String.fromCodePoint(0x1F6E4, 0xFE0F)}</span>
            {showTrajectory ? 'Hide Path' : 'Show Path'}
          </button>
          
          <button 
            onClick={handleFitBounds}
            className="px-3 py-2 flex items-center gap-2 rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md shadow-[var(--accent-primary)]/20"
            style={{ background: 'var(--accent-primary)', color: 'var(--neu-bg)' }}
          >
            <span className="text-sm">{String.fromCodePoint(0x1F50D)}</span>
            Fit Bounds
          </button>
        </div>

        {positions.length > 0 ? (
          <MapContainer 
            ref={setMapInstance}
            center={positions[positions.length - 1]} 
            zoom={12} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem', minHeight: '480px' }}
          >
            <MapEvents 
              center={positions[positions.length - 1]} 
              isAutoPanEnabled={isAutoPanEnabled}
              setIsAutoPanEnabled={setIsAutoPanEnabled}
            />
            
            <TileLayer 
              url={mapTypes[selectedMapType].url} 
              attribution={mapTypes[selectedMapType].attribution} 
              maxZoom={mapTypes[selectedMapType].maxZoom || 18}
              tileSize={mapTypes[selectedMapType].tileSize || 256}
              zoomOffset={mapTypes[selectedMapType].zoomOffset || 0}
            />
            {mapTypes[selectedMapType].overlayUrl && (
              <TileLayer url={mapTypes[selectedMapType].overlayUrl} zIndex={10} maxZoom={mapTypes[selectedMapType].maxZoom || 18} />
            )}
            
            {showTrajectory && (
              <Polyline positions={positions} color="var(--accent-primary, #3b82f6)" weight={4} opacity={0.7} />
            )}
            
            {start && (
              <CircleMarker center={[start.latitude, start.longitude]} radius={6} color="#10b981" fillColor="#10b981" fillOpacity={1}>
                <Popup>Launch Point<br/>{new Date(start.recordedAt).toLocaleTimeString()}</Popup>
              </CircleMarker>
            )}

            {latest && (
              <Marker position={[latest.latitude, latest.longitude]} icon={pulsatingIcon}>
                <Popup>
                  <div className="text-xs">
                    <b>Current Position</b><br/>
                    Lat: {latest.latitude}<br/>
                    Lng: {latest.longitude}<br/>
                    Alt: {latest.altitude}m<br/>
                    Speed: {latest.windSpeed}m/s
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-subtle">
            <p className="text-4xl mb-2">🗺️</p>
            <p>No location data available.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-flat p-4 rounded-2xl h-[350px]">
          <h3 className="text-main font-bold mb-2">Altitude Profile & Ascent Dynamics</h3>
          <AltitudeProfileChart data={pathData} />
        </div>
        <div className="neu-flat p-4 rounded-2xl h-[350px]">
          <h3 className="text-main font-bold mb-2 flex items-center justify-between">
            <span>Atmospheric Sounding (Skew-T Log-P)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Calculated Dewpoint</span>
          </h3>
          <SoundingChart data={pathData} />
        </div>
      </div>

      <ConfirmDialog isOpen={!!stopConfirmId} title="Stop Collection Session"
        message="Stop the active data collection session?"
        confirmLabel="Stop" danger
        onConfirm={() => handleStop(stopConfirmId)}
        onCancel={() => setStopConfirmId(null)} />
    </div>
  );
}
