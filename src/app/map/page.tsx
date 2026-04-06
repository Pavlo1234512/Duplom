"use client";
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { 
  Skull, 
  TrendingDown, 
  Clock, 
  Layers3, 
  Activity, 
  ChevronRight, 
  X 
} from 'lucide-react';

// Типізація для налаштувань мапи
type MapTypeKey = 'tactical' | 'terrain' | 'satellite';

interface MapConfig {
  name: string;
  url: string;
  grayscale: number;
}

const mapTypes: Record<MapTypeKey, MapConfig> = {
  tactical: {
    name: "ТАКТИЧНА (УКР)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", 
    grayscale: 0.8
  },
  terrain: {
    name: "ТЕРЕН (OSM)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    grayscale: 0
  },
  satellite: {
    name: "СУПУТНИК (COLORED)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    grayscale: 0
  }
};

// Динамічний імпорт компонентів react-leaflet (тільки для клієнта)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

export default function OperationalMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentMapType, setCurrentMapType] = useState<MapTypeKey>('tactical');
  const [L, setL] = useState<any>(null);
  const [reports, setReports] = useState([]);
  const [hoursFilter, setHoursFilter] = useState(72);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    // Ініціалізація Leaflet та прапорця монтажу
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      setIsMounted(true);
    });

    // Отримання даних з API
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error("Помилка завантаження даних:", err));

    return () => setIsMounted(false);
  }, []);

  // Фільтрація за часом
  const filteredReports = useMemo(() => {
    return reports.filter((report: any) => {
      const reportDate = new Date(report.createdAt).getTime();
      const now = new Date().getTime();
      return (now - reportDate) / (1000 * 60 * 60) <= hoursFilter;
    });
  }, [reports, hoursFilter]);

  // Загальна статистика для HUD
  const stats = useMemo(() => {
    return filteredReports.reduce((acc: any, r: any) => ({
      kills: acc.kills + (r.enemy_killed || 0),
      vehicles: acc.vehicles + (r.vehicles?.count || 0)
    }), { kills: 0, vehicles: 0 });
  }, [filteredReports]);

  // Запобігання помилкам рендерингу на сервері
  if (!isMounted || !L) {
    return (
      <div className="h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-blue-500 font-mono animate-pulse uppercase tracking-[0.3em] text-sm">
          INITIALIZING_STRATCOM_ENGINE...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020408] relative overflow-hidden flex flex-col font-black italic uppercase select-none text-white">
      
      {/* ВЕРХНІЙ HUD (СТАТИСТИКА) */}
      <div className="absolute top-6 left-24 z-[1001] flex gap-3 pointer-events-none">
        <div className="bg-black/80 border-l-2 border-blue-600 p-4 backdrop-blur-xl rounded-r-lg shadow-2xl">
          <p className="text-[10px] text-blue-500 tracking-[0.2em] mb-1 italic">ОСОБОВИЙ СКЛАД</p>
          <div className="flex items-center gap-3">
            <Skull className="w-5 h-5 text-red-600/50" />
            <span className="text-3xl font-black">{stats.kills}</span>
          </div>
        </div>
        <div className="bg-black/80 border-l-2 border-orange-600 p-4 backdrop-blur-xl rounded-r-lg shadow-2xl">
          <p className="text-[10px] text-orange-500 tracking-[0.2em] mb-1 italic">ВТРАТИ ТЕХНІКИ</p>
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-orange-600/50" />
            <span className="text-3xl font-black">{stats.vehicles}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[48.3794, 31.1656]} 
          zoom={6} 
          className="h-full w-full"
          zoomControl={false}
          style={{ 
            // Вимикаємо фільтри для супутника, щоб зберегти колір
            filter: currentMapType === 'satellite' 
              ? 'none' 
              : `grayscale(${mapTypes[currentMapType].grayscale}) contrast(1.1) brightness(0.9) invert(0.05)`,
            background: '#020408' 
          }}
        >
          {/* Використання ключа key={currentMapType} усуває помилку appendChild */}
          <TileLayer 
            key={currentMapType}
            url={mapTypes[currentMapType].url}
            attribution='&copy; OSM &copy; Esri'
          />

          {filteredReports.map((report: any) => (
            report.coordinates && (
              <React.Fragment key={report._id}>
                <Circle 
                  center={report.coordinates}
                  radius={Math.max(5000, (report.enemy_killed || 0) * 450)}
                  pathOptions={{
                    fillColor: report.enemy_killed > 15 ? '#dc2626' : '#2563eb',
                    fillOpacity: 0.12,
                    color: report.enemy_killed > 15 ? '#dc2626' : '#2563eb',
                    weight: 1,
                    dashArray: '5, 10'
                  }}
                />
                <Marker 
                  position={report.coordinates}
                  eventHandlers={{ click: () => setSelectedReport(report) }}
                  icon={new L.DivIcon({
                    className: '',
                    html: `
                      <div class="relative flex items-center justify-center">
                        <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-[2]"></div>
                        <div class="w-4 h-4 bg-blue-600 rounded-sm rotate-45 border border-white/40 shadow-[0_0_15px_#2563eb]"></div>
                      </div>
                    `
                  })}
                />
              </React.Fragment>
            )
          ))}
        </MapContainer>

        {/* ПОВЗУНОК ЧАСУ */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1001] w-[400px] bg-black/90 p-5 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-blue-500 font-black italic">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] tracking-widest uppercase">ЧАСОВИЙ ДІАПАЗОН</span>
            </div>
            <span className="text-sm font-black text-white">{hoursFilter} ГОДИН</span>
          </div>
          <input 
            type="range" min="1" max="168" value={hoursFilter}
            onChange={(e) => setHoursFilter(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* САЙДБАР ЗВІТУ */}
        {selectedReport && (
          <div className="absolute top-0 right-0 w-[420px] h-full bg-[#05070a]/98 border-l border-white/5 z-[1100] p-10 backdrop-blur-3xl animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl pointer-events-auto">
            <button onClick={() => setSelectedReport(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all transform hover:rotate-90">
              <X className="w-7 h-7" />
            </button>
            <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
              <header className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <p className="text-[11px] tracking-[0.4em] font-black italic">{selectedReport.unit || 'ПІДРОЗДІЛ НЕВІДОМИЙ'}</p>
                </div>
                <h2 className="text-5xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">{selectedReport.location}</h2>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-600/5 p-5 rounded-2xl border border-red-600/20">
                  <p className="text-[9px] text-red-500/70 mb-1 font-black italic uppercase">ЛІКВІДОВАНО</p>
                  <p className="text-4xl text-red-600 font-black">-{selectedReport.enemy_killed}</p>
                </div>
                <div className="bg-orange-600/5 p-5 rounded-2xl border border-orange-600/20">
                  <p className="text-[9px] text-orange-500/70 mb-1 font-black italic uppercase">ТЕХНІКА</p>
                  <p className="text-4xl text-orange-500 font-black">-{selectedReport.vehicles?.count || 0}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-slate-600 flex items-center gap-2 font-black italic">
                   <ChevronRight className="w-3 h-3 text-blue-600" /> ТЕКСТ ДОНЕСЕННЯ
                </p>
                <div className="text-[13px] text-slate-300 bg-black p-6 rounded-2xl border border-white/5 not-italic leading-relaxed font-mono">
                  {selectedReport.rawText}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ПЕРЕМИКАЧ ШАРІВ */}
        <div className="absolute top-10 right-10 z-[1001] pointer-events-auto">
          <div className="relative group">
            <button className="w-14 h-14 bg-black/80 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all backdrop-blur-xl shadow-xl">
              <Layers3 className="w-6 h-6" />
            </button>
            <div className="absolute right-16 top-0 bg-black/90 p-4 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity min-w-[200px] shadow-2xl backdrop-blur-xl">
              <p className="text-[10px] text-slate-500 font-black tracking-widest mb-3 italic">ВИБІР ШАРУ</p>
              <div className="space-y-2">
                {(Object.keys(mapTypes) as MapTypeKey[]).map((type) => (
                  <button 
                    key={type}
                    onClick={() => setCurrentMapType(type)}
                    className={`w-full text-left px-3 py-2 rounded text-[10px] font-black italic uppercase transition-colors ${currentMapType === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {mapTypes[type].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container { background: #020408 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          background: #2563eb; border: 3px solid #fff; border-radius: 50%;
          box-shadow: 0 0 10px rgba(37,99,235,0.5);
        }
      `}</style>
    </div>
  );
}