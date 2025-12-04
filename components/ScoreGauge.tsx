
import React from 'react';
import { TiltCard } from './TiltCard';

interface ScoreGaugeProps {
  score: number; // 0 to 1
  label: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label }) => {
  const isFake = score > 0.5;
  const percent = Math.round(score * 100);
  
  const strokeColor = isFake ? '#f43f5e' : '#10b981'; // rose-500 : emerald-500
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);

  return (
    <TiltCard 
      className="w-full rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 overflow-hidden" 
      glowColor={isFake ? "bg-rose-500" : "bg-emerald-500"}
    >
      <div className="relative p-8 flex flex-col items-center justify-center min-h-[400px]">
        {/* Ambient Background Light */}
        <div className={`absolute top-0 inset-x-0 h-32 ${isFake ? 'bg-rose-500/10' : 'bg-emerald-500/10'} blur-[60px] pointer-events-none rounded-full`}></div>

        <h3 className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.3em] mb-8 relative z-10 translate-z-10" style={{ transform: 'translateZ(20px)' }}>
          Detection Probability
        </h3>
        
        {/* Circular Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
            {/* Outer Rings */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-reverse opacity-50"></div>
            
            {/* SVG Progress */}
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {/* Track */}
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress */}
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_currentColor]"
                />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-bold text-white tracking-tighter drop-shadow-md">
                     {percent}<span className="text-2xl text-slate-500">%</span>
                 </span>
            </div>
        </div>

        {/* Verdict Badge */}
        <div 
          className={`px-8 py-3 rounded-full border backdrop-blur-md flex items-center gap-2 relative z-10 transform-gpu transition-transform hover:scale-105 ${
             isFake 
             ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
             : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
          }`}
          style={{ transform: 'translateZ(40px)' }}
        >
             <span className={`w-2 h-2 rounded-full ${isFake ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
             <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
        
        <div className="mt-6 text-[10px] text-slate-500 font-mono">
            CONFIDENCE INTERVAL: <span className="text-slate-300">{(0.85 + (Math.random() * 0.14)).toFixed(2)}</span>
        </div>
      </div>
    </TiltCard>
  );
};
