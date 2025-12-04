
import React, { useState, useRef } from 'react';
import { TextAnalysisResult } from '../../types';
import { ScoreGauge } from '../ScoreGauge';
import { TiltCard } from '../TiltCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface TextAnalysisViewProps {
  result: TextAnalysisResult;
  onReset: () => void;
}

export const TextAnalysisView: React.FC<TextAnalysisViewProps> = ({ result, onReset }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  // Two refs: one for visible UI, one for PDF generation
  const pdfRef = useRef<HTMLDivElement>(null);

  const renderHighlightedText = () => {
    let content = result.analyzed_text;
    const sentences = content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [content];

    return (
      <div className="font-mono text-sm leading-8 text-slate-300">
        {sentences.map((sentence, idx) => {
          const isSuspicious = result.suspicious_sentences.some(s => 
            s.includes(sentence.trim()) || sentence.includes(s.trim().substring(0, 20))
          );
          
          return (
            <span 
              key={idx} 
              className={`transition-all duration-300 mr-1 ${isSuspicious ? 'bg-rose-500/20 text-rose-100 px-1 py-0.5 rounded box-decoration-clone border-b border-rose-500/30' : ''}`}
            >
              {sentence}
            </span>
          );
        })}
      </div>
    );
  };

  const handleReport = () => {
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setFeedbackSent(true);
    }, 1000);
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

      pdf.save(`visuality_text_report_${result.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in p-4 sm:p-0">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Text Analysis Report</h2>
             <div className="flex items-center gap-3 mt-2">
                <span className="text-slate-500 text-xs font-mono bg-white/5 px-2 py-1 rounded">ID: {result.id.substring(0,8)}...</span>
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
            <button onClick={onReset} className="px-6 py-2.5 text-sm font-medium text-black bg-white hover:bg-slate-200 rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                New Analysis
            </button>
        </div>
      </div>

      {/* Visible Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Score & Signals */}
          <div className="lg:col-span-4 space-y-8">
              <ScoreGauge score={result.score} label={result.label.toUpperCase()} />

              <div className="space-y-4">
                  <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md" glowColor="bg-indigo-500">
                      <div className="p-6" style={{ transform: 'translateZ(20px)' }}>
                          <div className="flex justify-between items-end mb-4">
                              <span className="text-slate-500 text-[10px] font-mono tracking-widest">PERPLEXITY</span>
                              <span className="text-slate-200 font-semibold text-xl">{(result.signals.perplexity_score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${result.signals.perplexity_score * 100}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-3 font-medium">Predictability Score: {result.signals.perplexity_score > 0.7 ? 'HIGH (AI-like)' : 'LOW (Human-like)'}</p>
                      </div>
                  </TiltCard>

                  <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md" glowColor="bg-purple-500">
                      <div className="p-6" style={{ transform: 'translateZ(20px)' }}>
                          <div className="flex justify-between items-end mb-4">
                              <span className="text-slate-500 text-[10px] font-mono tracking-widest">BURSTINESS</span>
                              <span className="text-slate-200 font-semibold text-xl">{(result.signals.burstiness_score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${result.signals.burstiness_score * 100}%` }}></div>
                          </div>
                      </div>
                  </TiltCard>

                  <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md">
                      <div className="p-6" style={{ transform: 'translateZ(20px)' }}>
                          <div className="text-slate-500 text-[10px] font-mono tracking-widest mb-4">STYLISTIC FLAGS</div>
                          <div className="flex flex-wrap gap-2">
                              {result.signals.formatting_flags.length > 0 ? (
                                  result.signals.formatting_flags.map((f, i) => (
                                      <span key={i} className="text-[10px] px-3 py-1.5 bg-white/10 text-slate-200 rounded-full border border-white/5 font-medium uppercase tracking-wide">{f}</span>
                                  ))
                              ) : (
                                  <span className="text-xs text-slate-600 italic">No flags.</span>
                              )}
                          </div>
                      </div>
                  </TiltCard>
              </div>

              {/* Explanation (No Reverse Prompt) */}
              <div className="space-y-4">
                <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-md">
                    <div className="p-6" style={{ transform: 'translateZ(10px)' }}>
                        <h3 className="text-slate-200 text-sm font-medium mb-3">AI Summary</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{result.explanation}</p>
                    </div>
                </TiltCard>
              </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="lg:col-span-8">
              <TiltCard className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] backdrop-blur-md h-full">
                  <div className="p-8 flex flex-col h-full min-h-[600px]" style={{ transform: 'translateZ(10px)' }}>
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">Semantic Analysis</h3>
                          <div className="flex gap-3 text-xs">
                              <span className="flex items-center gap-2 text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Probability AI
                              </span>
                          </div>
                      </div>
                      <div className="flex-grow p-6 bg-black/20 rounded-3xl border border-white/5 overflow-y-auto max-h-[700px] custom-scrollbar shadow-inner relative z-10" style={{ transform: 'translateZ(20px)' }}>
                          {renderHighlightedText()}
                      </div>
                      <div className="mt-6 flex justify-between items-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
                          <span>Word Count: {result.analyzed_text.split(/\s+/).length}</span>
                          <span>Engine: {result.model_version}</span>
                      </div>
                  </div>
              </TiltCard>
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
                  <h1 className="text-3xl font-bold tracking-tight">VISU<span className="text-indigo-400">A</span>L<span className="text-indigo-400">I</span>TY LINGUISTICS</h1>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Natural Language Forensics Report</p>
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
                 <div className={`text-5xl font-bold ${result.score > 0.5 ? 'text-rose-500' : 'text-emerald-500'} mb-2`}>
                     {(result.score * 100).toFixed(0)}%
                 </div>
                 <div className="text-xl font-medium text-white mb-4 uppercase">
                     {result.label} GENERATED
                 </div>
              </div>
              
              <div className="flex-1 space-y-4">
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Perplexity</span><span>{(result.signals.perplexity_score * 100).toFixed(0)}%</span></div>
                      <div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-indigo-500 h-full rounded-full" style={{ width: `${result.signals.perplexity_score * 100}%` }}></div></div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Burstiness</span><span>{(result.signals.burstiness_score * 100).toFixed(0)}%</span></div>
                      <div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-purple-500 h-full rounded-full" style={{ width: `${result.signals.burstiness_score * 100}%` }}></div></div>
                  </div>
              </div>
          </div>

          {/* Explanation */}
          <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-2">Analysis Summary</h3>
              <p className="text-slate-300 text-xs leading-relaxed text-justify">
                  {result.explanation}
              </p>
          </div>
          
          {/* Content Sample */}
          <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Text Sample (Highlighted)</h3>
              <div className="font-mono text-[10px] leading-6 text-slate-300 text-justify">
                {renderHighlightedText()}
              </div>
          </div>
          
           {/* Footer */}
           <div className="mt-auto pt-8 flex justify-between text-[8px] text-slate-500 uppercase tracking-wider border-t border-white/10">
              <div>Visuality Text Engine v1.0</div>
              <div>Confidential Report</div>
          </div>
      </div>
    </div>
  );
};
