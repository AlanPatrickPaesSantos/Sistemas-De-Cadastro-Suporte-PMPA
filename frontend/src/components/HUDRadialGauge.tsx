import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface HUDRadialGaugeProps {
  value: number;
  max?: number;
  title: string;
  icon: React.ReactNode;
  colorClass: "red" | "blue";
  onClick?: () => void;
  isLoading?: boolean;
  suffixSingular?: string;
  suffixPlural?: string;
}

export function HUDRadialGauge({
  value,
  max = 100,
  title,
  icon,
  colorClass,
  onClick,
  isLoading = false,
  suffixSingular = "Equipamento",
  suffixPlural = "Equipamentos",
}: HUDRadialGaugeProps) {
  const [animatedStroke, setAnimatedStroke] = useState(0);

  // Parâmetros SVG para renderização do círculo
  const radius = 30;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (isLoading) return;
    // Garante que o percentual não exceda 100% para o desenho do progresso
    const percentage = Math.min((value / max) * 100, 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    setAnimatedStroke(strokeDashoffset);
  }, [value, max, isLoading, circumference]);

  const colorConfig = {
    red: {
      gradientFrom: "#ef4444",
      gradientTo: "#f97316",
      bgCircle: "stroke-red-500/10 dark:stroke-red-500/5",
      glowColor: "rgba(239, 68, 68, 0.4)",
      iconBg: "bg-red-50 dark:bg-red-950/20 text-red-500 group-hover:bg-red-500 group-hover:text-white",
      hoverShadow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
      indicatorColor: "bg-red-500 shadow-[0_0_8px_#ef4444]"
    },
    blue: {
      gradientFrom: "#004e9a",
      gradientTo: "#3b82f6",
      bgCircle: "stroke-blue-500/10 dark:stroke-blue-500/5",
      glowColor: "rgba(59, 130, 246, 0.4)",
      iconBg: "bg-blue-50 dark:bg-blue-950/20 text-[#004e9a] dark:text-blue-400 group-hover:bg-[#004e9a] group-hover:text-white",
      hoverShadow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      indicatorColor: "bg-blue-500 shadow-[0_0_8px_#3b82f6]"
    }
  }[colorClass];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 backdrop-blur-md p-5 md:p-6 cursor-pointer transition-all duration-500 flex items-center justify-between overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/40 hover:-translate-y-0.5 ${colorConfig.hoverShadow}`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-3 rounded-xl transition-all duration-500 ${colorConfig.iconBg}`}>
          {icon}
        </div>
        <div>
          <span className="block text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            {title}
          </span>
          <p className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
            {isLoading ? "Buscando..." : <>{value} {value === 1 ? suffixSingular : suffixPlural}</>}
          </p>
        </div>
      </div>

      {/* GAUGE RADIAL SVG (Design HUD Futurista) */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0 z-10 select-none">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={`gaugeGrad-${colorClass}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.gradientFrom} />
              <stop offset="100%" stopColor={colorConfig.gradientTo} />
            </linearGradient>
          </defs>
          
          {/* Círculo de fundo */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className={colorConfig.bgCircle}
          />
          
          {/* Círculo de progresso */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            stroke={`url(#gaugeGrad-${colorClass})`}
            strokeDasharray={circumference}
            strokeDashoffset={isLoading ? circumference : animatedStroke}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 3px ${colorConfig.glowColor})`
            }}
          />
        </svg>
        
        {/* Contador Central */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            <span className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tighter">
              {value}
            </span>
          )}
        </div>
      </div>

      {/* Indicador de Corner Glow */}
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`w-1.5 h-1.5 rounded-full ${colorConfig.indicatorColor}`} />
      </div>
    </div>
  );
}
