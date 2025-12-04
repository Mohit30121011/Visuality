
import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { TiltCard } from './TiltCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AnalysisViewProps {
  result: AnalysisResult;
  imageUrl: string | null;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, imageUrl, onReset }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  // PDF Ref
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleReport = () => {
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setFeedbackSent(true);
    }, 1200);
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = pdfRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`visuality_report_${result.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in p-4 sm:p-0">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Report</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-slate-500 text-xs font-mono bg-white/5 px-2 py-1 rounded">ID: {result.id.substring(0,8)}...</span>
                <span className="text-slate-500 text-xs font-medium">{new Date(result.timestamp).toLocaleDateString()}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all border border-white/5 backdrop-blur-sm flex items-center gap-2"
             >
                {isDownloading ? (
                   <>
                     <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                     Generating...
                   </>
                ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4v12" /></svg>
                     PDF Report
                   </>
                )}
             </button>

             <button 
                onClick={handleReport}
                disabled={isReporting || feedbackSent}
                className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all border border-white/5 backdrop-blur-sm ${feedbackSent ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
             >
                {isReporting ? 'Sending...' : feedbackSent ? 'Feedback Sent' : 'Report Issue'}
             </button>

            <button 
                onClick={onReset}
                className="px-6 py-2.5 text-sm font-medium text-black bg-white hover:bg-slate-200 rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
                New Analysis
            </button>
        </div>
      </div>

      {/* VISIBLE Web Layout */}
      <div className="p-8 bg-[#000000] rounded-[3rem]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image & Score */}
            <div className="lg:col-span-4 space-y-8">
                {/* Image Preview - REACTIVE */}
                <TiltCard className="rounded-[2.5rem] bg-black/40 border border-white/10 shadow-2xl overflow-hidden aspect-square">
                    <div className="relative w-full h-full flex items-center justify-center p-2" style={{ transform: 'translateZ(20px)' }}>
                        {imageUrl ? (
                        <>
                            <img 
                                src={imageUrl} 
                                alt="Analyzed" 
                                className="w-full h-full object-contain relative z-10"
                            />
                            <div className="absolute top-4 left-4 z-20">
                                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-white font-medium border border-white/10 shadow-lg">SOURCE</span>
                            </div>
                        </>
                        ) : (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-slate-500 text-sm">Source image not stored in history</p>
                        </div>
                        )}
                    </div>
                </TiltCard>

                {/* Score - Already Reactive inside ScoreGauge */}
                <ScoreGauge score={result.score} label={result.label} />
            </div>

            {/* Right Column: Deep Dive */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Signal Cards - REACTIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'CNN ARTIFACTS', score: result.signals.cnn_score, color: 'bg-indigo-500', glow: 'bg-indigo-500' },
                        { label: 'PRNU RESIDUAL', score: result.signals.prnu_score, color: 'bg-purple-500', glow: 'bg-purple-500' },
                        { label: 'FREQ ANOMALY', score: result.signals.freq_score, color: 'bg-blue-500', glow: 'bg-blue-500' }
                    ].map((signal, idx) => (
                        <TiltCard key={idx} className="bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md" glowColor={signal.glow}>
                            <div className="p-6 h-full flex flex-col justify-between" style={{ transform: 'translateZ(20px)' }}>
                                <div className="text-slate-500 text-[10px] font-mono tracking-widest mb-3">{signal.label}</div>
                                <div>
                                    <div className="flex justify-between items-baseline mb-4">
                                        <div className="text-3xl font-semibold text-white">{(signal.score * 100).toFixed(0)}</div>
                                        <div className="text-xs text-slate-500">%</div>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${signal.color} h-full rounded-full`} style={{ width: `${signal.score * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* Explanation - REACTIVE */}
                <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] backdrop-blur-md">
                    <div className="p-8" style={{ transform: 'translateZ(10px)' }}>
                        <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                            Forensic Summary
                        </h3>
                        <p className="text-slate-300 leading-relaxed font-light text-lg">
                            {result.explanation}
                        </p>
                    </div>
                </TiltCard>
            </div>
        </div>
      </div>

      {/* --- HIDDEN PDF TEMPLATE --- */}
      <div 
        ref={pdfRef}
        style={{ 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px', 
          width: '210mm', 
          minHeight: '297mm',
          padding: '20mm',
          backgroundColor: '#000000',
          color: 'white',
          fontFamily: 'Inter, sans-serif'
        }}
      >
          {/* PDF Header */}
          <div className="flex justify-between items-center mb-10 border-b border-white/20 pb-6">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">VISU<span className="text-indigo-400">A</span>L<span className="text-indigo-400">I</span>TY</h1>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">AI Forensic Analysis Report</p>
              </div>
              <div className="text-right">
                  <div className="text-xs text-slate-500">Analysis ID</div>
                  <div className="font-mono text-sm">{result.id.split('-')[0]}</div>
                  <div className="text-xs text-slate-500 mt-2">Date</div>
                  <div>{new Date(result.timestamp).toLocaleDateString()}</div>
              </div>
          </div>

          {/* Verdict Section */}
          <div className="flex justify-between gap-8 mb-10">
              <div className="flex-1">
                 <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Classification</div>
                 <div className={`text-6xl font-bold ${result.score > 0.5 ? 'text-rose-500' : 'text-emerald-500'} mb-2`}>
                     {(result.score * 100).toFixed(0)}%
                 </div>
                 <div className="text-xl font-medium text-white mb-4 uppercase">
                     Likelihood {result.label}
                 </div>
              </div>
              
              <div className="flex-1 space-y-4">
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CNN Artifacts</span><span>{(result.signals.cnn_score * 100).toFixed(0)}%</span></div>
                      <div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-indigo-500 h-full rounded-full" style={{ width: `${result.signals.cnn_score * 100}%` }}></div></div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>PRNU Residual</span><span>{(result.signals.prnu_score * 100).toFixed(0)}%</span></div>
                      <div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-purple-500 h-full rounded-full" style={{ width: `${result.signals.prnu_score * 100}%` }}></div></div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Frequency Anomaly</span><span>{(result.signals.freq_score * 100).toFixed(0)}%</span></div>
                      <div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${result.signals.freq_score * 100}%` }}></div></div>
                  </div>
              </div>
          </div>

          {/* Image */}
          <div className="mb-8 w-full h-64 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
             {imageUrl && <img src={imageUrl} className="h-full object-contain" />}
          </div>

          {/* Explanation */}
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-2">Forensic Summary</h3>
              <p className="text-slate-300 text-xs leading-relaxed text-justify">
                  {result.explanation}
              </p>
          </div>

           {/* Footer */}
           <div className="mt-auto pt-8 flex justify-between text-[8px] text-slate-500 uppercase tracking-wider border-t border-white/10">
              <div>Visuality AI Engine v2.0</div>
              <div>Confidential Forensic Report</div>
          </div>
      </div>
    </div>
  );
};
