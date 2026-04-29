import React from 'react';

interface MapaInterativoParaProps {
  onRegionClick: (region: string) => void;
  selectedRegion?: string;
}

const MapaInterativoPara: React.FC<MapaInterativoParaProps> = ({ onRegionClick, selectedRegion }) => {
  // Contorno oficial simplificado do Pará (Extraído do GeoJSON IBGE)
  const stateOutline = "M 28.7,3.4 L 30.7,3.2 L 30.7,3.1 L 30.3,3.4 L 30.0,3.6 L 29.8,3.3 L 29.4,3.4 L 29.2,3.7 L 29.0,3.8 L 28.6,3.8 L 28.3,3.7 L 28.0,4.0 L 28.1,4.2 L 27.8,4.5 L 27.5,4.3 L 27.1,4.3 L 26.9,4.3 L 26.7,4.3 L 26.7,4.4 L 26.5,4.4 L 26.4,4.4 L 26.3,4.3 L 26.2,4.4 L 26.1,4.4 L 26.1,4.4 L 26.0,4.5 L 25.9,4.5 L 25.8,4.5 L 25.7,4.5 L 25.6,4.5 L 25.4,4.4 L 25.3,4.6 L 25.2,4.6 L 25.0,4.5 L 24.9,4.4 L 24.9,4.3 L 24.9,4.2 L 24.8,4.1 L 24.7,4.2 L 24.4,4.2 L 24.3,4.1 L 24.2,4.0 L 24.1,4.0 L 24.0,3.9 L 24.0,3.8 L 23.9,3.8 L 23.8,3.7 L 23.7,3.7 L 23.7,3.6 L 23.6,3.6 L 23.3,3.6 L 23.2,3.7 L 23.1,3.8 L 23.2,3.9 L 23.3,3.9 L 23.2,4.1 L 23.0,4.2 L 23.1,4.3 L 23.2,4.4 L 23.2,4.5 L 23.1,4.5 L 23.0,4.6 L 22.9,4.7 L 22.9,4.8 L 22.8,4.9 L 22.9,5.0 L 22.9,5.1 L 22.8,5.1 L 22.7,5.1 L 22.6,5.0 L 22.5,4.8 L 22.5,4.9 L 22.5,4.8 L 22.4,4.8 L 22.4,4.9 L 22.4,5.0 L 22.3,5.1 L 22.4,5.2 L 22.3,5.2 L 22.2,5.3 L 22.2,5.4 L 22.1,5.5 L 22.1,5.6 L 22.0,5.6 L 22.1,5.7 L 22.2,5.8 L 22.3,5.8 L 22.4,5.8 L 22.5,5.9 L 22.6,5.9 L 22.7,5.9 L 22.7,6.0 L 22.8,6.1 L 22.7,6.2 L 22.6,6.2 L 22.7,6.3 L 22.8,6.4 L 23.0,6.4 L 23.1,6.4 L 23.2,6.5 L 23.2,6.6 L 23.1,6.6 L 23.2,6.7 L 23.3,6.7 L 23.2,6.8 L 23.3,6.8 L 23.3,6.9 L 23.3,7.0 L 23.5,7.0 L 23.6,7.1 L 23.8,7.3 L 23.8,7.4 L 23.8,7.5 L 23.8,7.6 L 23.7,7.8 L 23.6,7.7 L 23.6,7.8 L 23.7,8.1 L 23.6,8.2 L 23.7,8.3 L 23.8,8.4 L 23.8,8.6 L 23.7,8.6 L 23.6,8.7 L 23.4,8.9 L 23.3,8.9 L 23.2,9.0 L 23.1,9.0 L 22.9,8.9 L 22.8,8.8 L 22.7,8.9 L 22.7,8.8 L 22.6,8.8 L 22.5,8.8 L 22.5,8.9 L 22.4,8.8 L 22.3,8.9 L 22.2,8.8 L 22.1,8.8 L 22.1,8.7 L 22.0,8.7 L 21.9,8.5 L 21.8,8.5 L 21.7,8.5 L 21.5,8.5 L 21.4,8.4 L 21.3,8.5 L 21.2,8.6 L 21.1,8.6 L 21.0,8.5 L 20.8,8.4 L 20.7,8.3 L 20.6,8.3 L 20.5,8.2 L 20.3,8.1 L 20.2,8.2 L 20.1,8.2 L 20.0,8.3 L 20.0,8.2 L 19.9,8.2 L 19.8,8.2 L 19.8,8.1 L 19.7,8.1 L 19.6,8.0 L 19.6,8.1 L 19.5,8.1 L 19.4,8.0 L 19.3,8.2 L 19.1,8.2 L 19.0,8.3 L 18.9,8.3 L 18.8,8.3 L 18.8,8.4 L 18.6,8.4 L 18.5,8.3 L 18.5,8.2 L 18.4,8.2 L 18.3,8.1 L 18.2,8.1 L 18.1,8.2 L 18.1,8.3 L 17.9,8.4 L 17.9,8.3 L 17.8,8.4 L 17.7,8.3 L 17.5,8.3 L 17.4,8.3 L 17.4,8.4 L 17.3,8.4 L 17.3,8.5 L 17.2,8.6 L 17.1,8.7 L 17.0,8.7 L 17.0,8.8 L 16.9,8.8 L 17.0,8.8 L 16.9,8.7 L 16.8,8.6 L 16.7,8.6 L 16.7,8.5 L 16.6,8.6 L 16.5,8.5 L 16.4,8.5 L 16.3,8.5 L 16.2,8.4 L 16.2,8.5 L 16.1,8.4 L 16.1,8.3 L 16.0,8.2 L 15.8,8.3 L 15.7,8.3 L 15.6,8.3 L 15.6,8.4 L 15.5,8.4 L 15.4,8.4 L 15.3,8.3 L 15.2,8.2 L 15.1,8.1 L 15.0,8.1 L 15.0,8.1 L 15.0,8.0 L 14.9,8.0 L 14.8,7.9 L 14.8,7.7 L 14.7,7.6 L 14.8,7.5 L 14.7,7.5 L 14.6,7.6 L 14.5,7.5 L 14.5,7.6 L 14.3,7.7 L 14.3,7.8 L 14.1,7.7 L 14.0,7.8 L 13.8,7.9 L 13.7,8.0 L 13.6,8.0 L 13.6,8.2 L 13.4,8.1 L 13.4,8.0 L 13.4,8.0 L 13.3,7.9 L 13.3,7.8 L 13.3,7.8 L 13.0,7.7 L 13.0,7.9 L 12.9,7.8 L 12.8,7.9 L 12.7,7.8 L 12.6,7.9 L 12.7,8.0 L 12.5,8.0 L 12.6,8.1 L 12.6,8.3 L 12.5,8.3 L 12.4,8.3 L 12.3,8.3 L 12.3,8.4 L 12.1,8.4 L 12.1,8.5 L 12.0,8.6 L 12.1,8.7 L 12.1,8.8 L 12.0,8.9 L 12.0,9.0 L 12.0,9.1 L 11.9,9.1 L 11.9,9.2 L 11.7,9.3 L 11.7,9.2 L 11.7,9.3 L 11.6,9.3 L 11.5,9.3 L 11.6,9.5 L 11.5,9.6 L 11.4,9.6 L 11.4,9.8 L 11.4,9.8 L 11.3,9.8 L 11.2,9.8 L 11.3,9.9 L 11.2,10.0 L 11.1,10.1 L 11.0,10.0 L 11.0,10.1 L 10.9,10.1 L 11.0,10.0 L 10.9,10.0 L 10.8,10.0 L 10.7,10.1 L 10.6,10.0 L 10.5,10.1 L 10.4,10.1 L 10.3,10.1 L 10.2,10.0 L 10.2,9.9 L 10.1,10.0 L 10.0,9.9 L 10.0,9.8 L 10.0,9.8 L 9.9,9.8 L 9.9,9.9 L 9.9,9.8 L 9.8,9.8 L 9.8,9.9 L 9.7,9.8 L 9.6,9.9 L 9.5,9.8 L 9.4,9.8 L 9.4,9.9 L 9.3,9.8 L 9.3,10.0 L 9.2,10.0 L 9.3,10.1 L 9.2,10.1 L 9.1,10.1 L 9.0,10.1 L 8.9,10.1 L 8.9,10.1 L 8.8,10.2 L 8.6,10.2 L 8.6,10.2 L 8.5,10.2 L 8.4,10.2 L 8.4,10.3 L 8.4,10.4 L 8.3,10.4 L 8.1,10.4 L 8.0,10.4 L 8.0,10.3 L 7.9,10.4 L 7.9,10.3 L 7.8,10.3 L 7.8,10.4 L 7.7,10.4 L 7.8,10.5 L 7.8,10.6 L 7.8,10.8 L 7.8,10.9 L 7.9,11.0 L 7.8,11.0 L 7.8,11.1 L 7.7,11.1 L 7.8,11.2 L 7.7,11.2 L 7.7,11.3 L 7.7,11.4 L 7.6,11.4 L 7.7,11.5 L 7.5,11.5 L 7.4,11.4 L 7.2,11.3 L 7.2,11.4 L 7.2,11.5 L 7.0,11.5 L 7.0,11.4 L 6.9,11.4 L 6.8,11.5 L 6.7,11.5 L 6.5,11.5 L 6.6,11.4 L 6.5,11.3 L 6.5,11.2 L 6.5,11.1 L 6.3,11.0 L 6.2,11.0 L 6.1,11.0 L 5.9,11.2 L 5.8,11.1 L 5.7,11.1 L 5.7,11.0 L 5.6,11.0 L 5.5,11.0 L 5.4,11.0 L 5.3,11.0 L 5.3,10.8 L 5.2,10.8 L 5.1,10.8 L 5.1,10.9 L 5.0,11.0 L 5.1,11.0 L 4.9,11.1 L 4.9,11.2 L 4.7,11.3 L 4.7,11.4 L 4.7,11.5 L 4.7,11.6 L 4.8,11.6 L 4.8,11.7 L 4.7,11.8 L 4.6,11.8 L 4.5,11.7 L 4.3,11.8 L 4.3,11.9 L 4.2,11.9 L 4.1,11.8 L 3.9,11.8 L 3.8,11.8 L 3.8,12.0 L 3.8,12.1 L 3.8,12.2 L 3.8,12.3 L 4.0,12.4 L 4.1,12.5 L 4.2,12.5 L 4.0,12.7 L 4.1,12.9 L 4.0,13.0 L 4.0,13.1 L 3.9,13.1 L 3.9,13.3 L 3.8,13.3 L 3.7,13.2 L 3.7,13.3 L 3.7,13.4 L 3.6,13.3 L 3.5,13.2 L 3.5,13.1 L 3.4,13.2 L 3.3,13.1 L 3.3,13.2 L 3.2,13.2 L 3.2,13.3 L 3.2,13.4 L 3.2,13.3 L 3.0,13.3 L 3.0,13.2 L 2.9,13.2 L 2.8,13.2 L 2.7,13.2 L 2.6,13.2 L 2.5,13.2 L 2.5,13.1 L 2.3,13.1 L 2.2,13.2 L 2.2,13.2 L 2.1,13.4 L 2.1,13.5 L 2.2,13.6 L 2.0,13.8 L 1.9,13.8 L 1.8,13.9 L 1.8,14.0 L 1.7,14.0 L 1.7,13.9 L 1.6,13.9 L 1.5,14.0 L 1.5,14.0 L 1.5,14.0 L 1.4,14.1 L 1.3,14.1 L 1.4,14.0 L 1.3,13.9 L 1.3,13.9 L 1.2,14.0 L 1.1,14.0 L 1.1,13.8 L 1.0,13.8 L 1.0,13.7 L 0.9,13.6 L 0.8,13.6 L 0.8,16.1 L 0.8,18.5 L 0.8,21.1 L 0.8,23.2 L 0.9,23.3 L 0.9,23.5 L 0.9,23.6 L 1.0,23.6 L 1.0,23.7 L 1.0,24.1 L 1.1,24.2 L 1.1,24.3 L 0.9,24.6 L 0.9,24.8 L 1.0,25.1 L 1.0,25.1 L 1.0,25.2 L 1.0,25.2 L 1.0,25.4 L 1.0,25.7 L 1.2,25.9 L 1.4,26.0 L 1.4,26.0 L 1.5,26.0 L 1.6,26.1 L 1.6,26.0 L 1.7,26.1 L 1.8,26.2 L 2.0,26.3 L 2.0,26.4 L 2.1,26.4 L 2.1,26.5 L 2.0,26.7 L 2.1,26.9 L 2.2,27.0 L 2.2,27.1 L 2.2,27.2 L 2.2,27.3 L 2.1,27.4 L 2.1,27.4 L 2.1,27.5 L 2.1,27.6 L 2.1,27.8 L 2.0,27.8 L 2.1,27.9 L 2.2,28.0 L 2.2,28.0 L 2.2,28.1 L 2.3,28.2 L 2.3,28.3 L 2.4,28.4 L 2.6,28.5 L 2.6,28.6 L 2.6,28.6 L 2.8,28.6 L 2.8,28.6 L 3.0,28.9 L 3.1,29.0 L 3.1,29.0 L 3.1,29.0 L 3.3,29.1 L 3.3,29.2 L 3.4,29.2 L 3.4,29.3 L 3.7,29.4 L 3.7,29.5 L 3.8,29.5 L 3.8,29.5 L 3.8,29.5 L 3.8,29.5 L 3.9,29.5 L 3.9,29.6 L 3.9,29.7 L 4.0,29.7 L 4.0,29.8 L 4.1,29.8 L 4.1,29.7 L 4.2,29.7 L 4.3,29.9 L 4.4,29.9 L 4.2,30.0 L 4.2,30.1 L 4.2,30.2 L 4.4,30.4 L 4.4,30.5 L 4.5,30.5 L 4.5,30.6 L 4.5,30.6 L 4.4,30.7 L 4.4,30.8 L 4.5,30.8 L 4.4,31.0 L 4.5,31.1 L 4.6,31.1 L 4.6,31.1 L 4.7,31.1 L 4.7,31.2 L 4.9,31.3 L 4.9,31.5 L 5.0,31.5 L 4.9,31.6 L 5.0,31.6 L 5.0,31.6 L 5.1,31.7 L 5.2,31.8 L 5.2,31.9 L 5.6,31.8 L 5.6,31.8 L 5.7,31.8 L 5.8,32.0 L 6.0,32.0 L 6.2,32.3 L 6.3,32.4 L 6.4,32.5 L 6.5,32.5 L 6.7,32.2 L 6.8,32.2 L 6.7,32.0 L 7.0,32.0 L 7.1,31.9 L 7.0,31.8 L 7.1,31.7 L 7.4,31.6 L 7.4,31.5 L 7.6,31.6 L 7.6,31.7 L 7.6,31.8 L 7.6,31.9 L 7.9,32.0 L 7.9,32.0 L 7.9,32.1 L 7.9,32.3 L 8.0,32.4 L 8.0,32.5 L 7.9,32.6 L 7.8,33.0 L 7.8,33.2 L 7.7,33.2 L 7.7,33.3 L 7.7,33.4 L 7.8,33.5 L 7.9,33.5 L 7.9,33.6 L 7.9,33.7 L 8.1,33.8 L 8.4,33.7 L 8.4,33.6 L 8.4,33.4 L 8.6,33.2 L 8.7,33.3 L 8.9,33.1 L 9.1,32.8 L 9.1,32.4 L 9.6,32.3 L 9.7,32.0 L 10.1,31.9 L 10.4,31.9 L 10.8,32.0 L 11.3,31.7 L 11.7,31.5 L 12.0,31.6 L 12.2,32.0 L 12.5,32.2 L 12.9,32.4 L 13.1,32.3 L 13.6,32.4 L 13.9,32.5 L 14.1,32.6 L 14.4,32.7 L 14.6,32.7 L 14.9,32.4 L 15.3,32.4 L 15.7,32.2 L 16.1,32.3 L 16.7,32.3 L 17.2,32.1 L 17.5,32.1 L 17.8,32.3 L 18.2,32.2 L 18.6,32.4 L 19.0,32.6 L 19.4,32.5 L 19.8,32.5 L 20.1,32.8 L 20.4,32.9 L 20.7,32.9 L 21.1,33.0 L 21.4,32.9 L 21.7,32.3 L 21.6,31.7 L 21.8,31.6 L 21.8,31.3 L 21.5,31.0 L 21.2,30.8 L 21.1,30.6 L 20.9,30.4 L 20.6,30.2 L 20.7,29.9 L 20.2,29.8 L 19.9,29.6 L 20.1,29.3 L 20.3,29.0 L 20.4,28.8 L 20.6,29.1 L 20.8,29.0 L 20.8,28.8 L 21.1,28.5 L 21.1,28.3 L 20.9,28.2 L 21.1,27.8 L 21.3,27.6 L 21.7,27.7 L 22.0,27.9 L 22.4,28.1 L 23.0,28.3 L 23.5,28.6 L 24.1,28.5 L 24.5,28.4 L 25.0,28.3 L 26.2,28.5 L 27.4,27.8 Z";

  // Zoneamento dos CPRs dentro da silhueta do Pará (Coordenadas ajustadas)
  const regions = [
    { id: 'CPR I - Santarém', name: 'Santarém (CPR I)', path: 'M 10,25 L 35,22 L 35,45 L 12,48 Z', color: '#1e40af' },
    { id: 'CPR XII - Breves', name: 'Breves (CPR XII)', path: 'M 48,15 L 65,12 L 62,35 L 45,38 Z', color: '#dc2626' },
    { id: 'CPR XI - Soure', name: 'Soure (CPR XI)', path: 'M 65,12 L 80,10 L 82,25 L 68,28 Z', color: '#16a34a' },
    { id: 'CPR IX - Abaetetuba', name: 'Abaetetuba (CPR IX)', path: 'M 62,28 L 75,25 L 78,40 L 65,42 Z', color: '#2563eb' },
    { id: 'CPRM - Belém', name: 'Metropolitana (CPRM)', path: 'M 78,25 L 85,25 L 85,35 L 78,35 Z', color: '#facc15' },
    { id: 'CPR III - Castanhal', name: 'Castanhal (CPR III)', path: 'M 80,15 L 95,12 L 95,25 L 85,28 Z', color: '#10b981' },
    { id: 'CPR VII - Capanema', name: 'Capanema (CPR VII)', path: 'M 95,12 L 105,10 L 105,30 L 95,30 Z', color: '#7c3aed' },
    { id: 'CPR VI - Paragominas', name: 'Paragominas (CPR VI)', path: 'M 75,40 L 105,30 L 105,60 L 80,65 Z', color: '#3b82f6' },
    { id: 'CPR IV - Tucuruí', name: 'Tucuruí (CPR IV)', path: 'M 55,45 L 75,40 L 80,65 L 58,68 Z', color: '#4f46e5' },
    { id: 'CPR II - Marabá', name: 'Marabá (CPR II)', path: 'M 58,68 L 80,65 L 90,85 L 65,82 Z', color: '#4338ca' },
    { id: 'CPR V - Redenção', name: 'Redenção (CPR V)', path: 'M 65,82 L 90,85 L 85,100 L 60,100 Z', color: '#2563eb' },
    { id: 'CPR XIII - São Félix do Xingu', name: 'S. Félix do Xingu (CPR XIII)', path: 'M 40,68 L 58,68 L 65,82 L 60,100 L 45,95 Z', color: '#eab308' },
    { id: 'CPR VIII - Altamira', name: 'Altamira (CPR VIII)', path: 'M 35,22 L 48,15 L 62,35 L 58,68 L 40,68 L 30,55 Z', color: '#16a34a' },
    { id: 'CPR X - Itaituba', name: 'Itaituba (CPR X)', path: 'M 5,25 L 12,48 L 30,55 L 40,68 L 45,95 L 5,95 L 0,75 Z', color: '#dc2626' },
  ];

  return (
    <div className="relative w-full aspect-[1/1] bg-slate-900/40 rounded-3xl border border-slate-800 p-6 overflow-hidden shadow-2xl group transition-all hover:border-blue-500/30">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/70 mb-1">Mapa Tático de Operações</h4>
        <p className="text-xl font-black text-white tracking-tighter">ESTADO DO PARÁ</p>
        <div className="mt-1 h-1 w-12 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
      </div>
      
      <svg viewBox="-5 0 110 110" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.15)] filter saturate-[1.2]">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* ClipPath usando o contorno oficial para garantir que nada saia do formato do estado */}
          <clipPath id="para-outline">
            <path d={stateOutline} />
          </clipPath>
        </defs>
        
        {/* Sombra de fundo do estado */}
        <path 
          d={stateOutline} 
          fill="rgba(15, 23, 42, 0.8)" 
          stroke="rgba(59, 130, 246, 0.2)" 
          strokeWidth="1.5"
        />

        {/* Regiões interativas clipadas pelo contorno oficial */}
        <g clipPath="url(#para-outline)">
          {regions.map((region) => (
            <path
              key={region.id}
              d={region.path}
              fill={selectedRegion === region.id ? region.color : 'rgba(30, 41, 59, 0.4)'}
              stroke={selectedRegion === region.id ? '#fff' : 'rgba(255,255,255,0.05)'}
              strokeWidth={selectedRegion === region.id ? '1' : '0.2'}
              className="cursor-pointer transition-all duration-300 hover:fill-blue-500/30 hover:z-20"
              onClick={() => onRegionClick(region.id)}
              style={{ filter: selectedRegion === region.id ? 'url(#glow)' : 'none' }}
            >
              <title>{region.name}</title>
            </path>
          ))}
        </g>

        {/* Borda final para definição */}
        <path 
          d={stateOutline} 
          fill="none" 
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="0.5" 
          pointerEvents="none"
        />
      </svg>
      
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Região Atual</span>
          <span className="text-xs font-black text-blue-400 uppercase">
            {selectedRegion ? regions.find(r => r.id === selectedRegion)?.name : 'Selecione uma CPR'}
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
