
import React, { useMemo } from 'react';

interface LoadingViewProps {
  mode: 'image' | 'text';
  previewUrl: string | null;
  progress: number;
  onCancel: () => void;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ mode, previewUrl, progress, onCancel }) => {
  // Determine status message based on progress and mode
  const status = useMemo(() => {
    if (mode === 'image') {
        if (progress < 20) return "Preprocessing Image Data...";
        if (progress < 40) return "Analyzing Frequency Spectrum...";
        if (progress < 60) return "Detecting Compression Artifacts...";
        if (progress < 80) return "Auditing Biometric & Micro-Geometry...";
        return "Finalizing Forensic Report...";
    } else {
        if (progress < 20) return "Tokenizing Input Text...";
        if (progress < 40) return "Calculating Perplexity & Burstiness...";
        if (progress < 60) return "Analyzing Stylometric Patterns...";
        if (progress < 80) return "Scanning for AI Hallucinations...";
        return "Compiling Linguistic Profile...";
    }
  }, [progress, mode]);

  // Calculate estimated time remaining (assuming ~3s total process for the demo)
  const secondsRemaining = useMemo(() => {
    const totalDuration = 3.0; // seconds
    const remaining = totalDuration * (1 - progress / 100);
    return Math.max(0.1, remaining).toFixed(1);
  }, [progress]);

  return (
    <div className="relative w-full h-full flex items-center justify-center animate-fade-in p-6">
      
      {/* iOS-style Blurry Card */}
      <div className="relative w-full max-w-sm bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center overflow-hidden">
        
        {/* Top Shine/Reflection */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Visual Preview Container with Scan Effect */}
        <div className="relative w-32 h-32 mb-8 rounded-[1.5rem] overflow-hidden bg-black shadow-inner border border-white/5 ring-1 ring-white/5 flex items-center justify-center">
          {mode === 'image' ? (
              previewUrl ? (
                <>
                  <img 
                    src={previewUrl} 
                    alt="Analyzing" 
                    className="w-full h-full object-cover opacity-80" 
                  />
                  {/* Apple-style Scanning Light */}
                  <div className="absolute inset-0 z-10 animate-scan">
                     <div className="w-full h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent blur-md"></div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                   <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>
              )
          ) : (
              // Text Mode Visual
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50">
                  <div className="absolute inset-2 border border-white/10 rounded-xl flex flex-col gap-2 p-2 opacity-50">
                      <div className="h-1.5 w-3/4 bg-white/20 rounded-full"></div>
                      <div className="h-1.5 w-full bg-white/20 rounded-full"></div>
                      <div className="h-1.5 w-5/6 bg-white/20 rounded-full"></div>
                      <div className="h-1.5 w-full bg-white/20 rounded-full"></div>
                  </div>
                  <svg className="w-10 h-10 text-indigo-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {/* Text Scan Effect */}
                  <div className="absolute inset-0 z-10 animate-scan">
                     <div className="w-full h-8 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent blur-sm"></div>
                  </div>
              </div>
          )}
        </div>

        {/* Text Status */}
        <div className="w-full text-center space-y-1 mb-8">
            <h3 className="text-white font-medium text-lg tracking-tight">
                {mode === 'image' ? 'Scanning Visuals' : 'Analyzing Linguistics'}
            </h3>
            <p className="text-slate-400 text-sm font-light min-h-[20px]">{status}</p>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full space-y-4">
            <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className={`h-full shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full transition-all duration-300 ease-out relative overflow-hidden ${mode === 'image' ? 'bg-white' : 'bg-indigo-400'}`}
                        style={{ width: `${progress}%` }}
                    >
                        {/* Shimmer effect inside the bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-shimmer"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">AI Model v2.0</span>
                    <span className="text-[10px] text-slate-400 font-mono">{secondsRemaining}s remaining</span>
                </div>
            </div>

            <button 
                onClick={onCancel}
                className="w-full py-3 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-rose-500/20 hover:border-rose-500 shadow-lg shadow-rose-500/10 active:scale-95"
            >
                Cancel Analysis
            </button>
        </div>

      </div>
    </div>
  );
};
