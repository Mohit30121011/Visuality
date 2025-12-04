import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadItem, onClearHistory, onBack }) => {
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'TEXT'>('ALL');

  const filteredHistory = useMemo(() => {
    if (filter === 'ALL') return history;
    return history.filter(item => item.type === (filter === 'IMAGE' ? 'image' : 'text'));
  }, [history, filter]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in p-4 sm:p-0 min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analysis History</h1>
            <p className="text-slate-500 text-sm mt-1">Review past forensic reports</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onClearHistory}
            className="px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
        {(['ALL', 'IMAGE', 'TEXT'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === f 
                ? 'bg-white text-black shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No history found</p>
            <p className="text-slate-600 text-sm mt-1">Analyses you perform will appear here.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-white/10 flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              {/* Icon/Thumbnail */}
              <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/10 overflow-hidden ${
                item.type === 'image' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {item.type === 'image' && item.thumbnail ? (
                    <img src={item.thumbnail} alt="Analysis Source" className="w-full h-full object-cover" />
                ) : item.type === 'image' ? (
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                ) : (
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )}
              </div>

              {/* Details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                     item.type === 'image' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                   }`}>
                     {item.type === 'image' ? 'Image Analysis' : 'Text Analysis'}
                   </span>
                   <span className="text-slate-500 text-xs font-mono">{formatDate(item.timestamp)}</span>
                </div>
                
                <h3 className="text-white font-medium truncate pr-4">
                  {item.type === 'image' ? (item.label === 'synthetic' ? 'Detected Synthetic Content' : 'Verified Natural Image') : (item.label === 'ai' ? 'AI-Generated Text Pattern' : 'Human-Written Pattern')}
                </h3>
                
                <p className="text-slate-400 text-sm mt-1 line-clamp-1 font-light">
                  {item.explanation}
                </p>
              </div>

              {/* Score & Action */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 pl-0 md:pl-6 md:border-l border-white/5">
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    (item.type === 'image' && item.score > 0.5) || (item.type === 'text' && item.score > 0.5) 
                      ? 'text-rose-400' 
                      : 'text-emerald-400'
                  }`}>
                    {(item.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Probability</div>
                </div>

                <button 
                  onClick={() => onLoadItem(item)}
                  className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
                >
                  View Report
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};