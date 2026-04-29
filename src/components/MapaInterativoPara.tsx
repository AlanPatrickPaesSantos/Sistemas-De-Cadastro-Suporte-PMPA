import React from 'react';

interface MapaInterativoParaProps {
  onRegionClick: (region: string) => void;
  selectedRegion?: string;
}

const MapaInterativoPara: React.FC<MapaInterativoParaProps> = ({ onRegionClick, selectedRegion }) => {
  // Coordenadas mais precisas baseadas na imagem dos CPRs enviada
  const regions = [
    { id: 'CPR I - Santarém', name: 'Santarém (CPR I)', path: 'M 5,30 L 35,25 L 38,48 L 15,55 Z', color: '#1e3a8a' },
    { id: 'CPR XII - Breves', name: 'Breves (CPR XII)', path: 'M 45,28 L 58,25 L 55,45 L 42,48 Z', color: '#ef4444' },
    { id: 'CPR XI - Soure', name: 'Soure (CPR XI)', path: 'M 58,25 L 70,22 L 68,30 L 58,32 Z', color: '#22c55e' },
    { id: 'CPR IX - Abaetetuba', name: 'Abaetetuba (CPR IX)', path: 'M 60,32 L 68,30 L 70,40 L 58,45 Z', color: '#3b82f6' },
    { id: 'CPRM - Belém', name: 'Metropolitana (CPRM)', path: 'M 72,30 L 80,30 L 80,38 L 72,38 Z', color: '#facc15' },
    { id: 'CPR III - Castanhal', name: 'Castanhal (CPR III)', path: 'M 72,25 L 82,22 L 85,32 L 75,35 Z', color: '#10b981' },
    { id: 'CPR VII - Capanema', name: 'Capanema (CPR VII)', path: 'M 82,22 L 95,20 L 98,30 L 85,32 Z', color: '#8b5cf6' },
    { id: 'CPR VI - Paragominas', name: 'Paragominas (CPR VI)', path: 'M 70,40 L 85,32 L 95,55 L 75,65 Z', color: '#2563eb' },
    { id: 'CPR IV - Tucuruí', path: 'M 55,45 L 70,40 L 75,65 L 58,68 Z', name: 'Tucuruí (CPR IV)', color: '#6366f1' },
    { id: 'CPR II - Marabá', name: 'Marabá (CPR II)', path: 'M 58,68 L 75,65 L 85,85 L 65,82 Z', color: '#4338ca' },
    { id: 'CPR V - Redenção', name: 'Redenção (CPR V)', path: 'M 65,82 L 85,85 L 80,98 L 60,98 Z', color: '#3b82f6' },
    { id: 'CPR XIII - São Félix do Xingu', name: 'S. Félix do Xingu (CPR XIII)', path: 'M 40,68 L 58,68 L 65,82 L 60,98 L 45,95 Z', color: '#eab308' },
    { id: 'CPR VIII - Altamira', name: 'Altamira (CPR VIII)', path: 'M 35,25 L 45,28 L 55,45 L 58,68 L 40,68 L 30,55 Z', color: '#22c55e' },
    { id: 'CPR X - Itaituba', name: 'Itaituba (CPR X)', path: 'M 5,30 L 15,55 L 30,55 L 40,68 L 45,95 L 10,95 L 5,75 Z', color: '#dc2626' },
  ];

  return (
    <div className="relative w-full aspect-[1/1] bg-slate-900/40 rounded-3xl border border-slate-800 p-6 overflow-hidden shadow-2xl group transition-all hover:border-blue-500/30">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/70 mb-1">Mapa Tático de Operações</h4>
        <p className="text-xl font-black text-white tracking-tighter">ESTADO DO PARÁ</p>
        <div className="mt-1 h-1 w-12 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
      </div>
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.15)] filter saturate-[1.2]">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {regions.map((region) => (
          <path
            key={region.id}
            d={region.path}
            fill={selectedRegion === region.id ? region.color : 'rgba(30, 41, 59, 0.5)'}
            stroke={selectedRegion === region.id ? '#fff' : region.color}
            strokeWidth={selectedRegion === region.id ? '2' : '0.8'}
            strokeLinejoin="round"
            className="cursor-pointer transition-all duration-500 hover:fill-blue-500/20 hover:stroke-white hover:z-20"
            onClick={() => onRegionClick(region.id)}
            style={{ filter: selectedRegion === region.id ? 'url(#glow)' : 'none' }}
          >
            <title>{region.name}</title>
          </path>
        ))}
      </svg>
      
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Região Atual</span>
          <span className="text-xs font-black text-blue-400">
            {selectedRegion ? regions.find(r => r.id === selectedRegion)?.name : 'CLIQUE NO MAPA'}
          </span>
        </div>
        {selectedRegion && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRegionClick(''); }}
            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-black rounded-lg transition-all border border-blue-600/20 uppercase"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MapaInterativoPara;
