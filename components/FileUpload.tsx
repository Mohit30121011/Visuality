
import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setIsProcessing(true);
        // Small delay to allow UI to update and show the loading state clearly
        const file = e.dataTransfer.files[0];
        setTimeout(() => {
             onFileSelect(file);
             setIsProcessing(false); 
        }, 600);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      const file = e.target.files[0];
       setTimeout(() => {
             onFileSelect(file);
             setIsProcessing(false); 
        }, 600);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-72 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 cursor-pointer group shadow-2xl overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
           <div className="w-12 h-12 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
           <span className="text-white/90 font-medium text-xs tracking-[0.2em] uppercase animate-pulse">Processing...</span>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
        <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-indigo-500/30">
            <svg
            className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
            >
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
            </svg>
        </div>
        <p className="mb-2 text-base text-slate-300 font-medium">
          Drop image here or <span className="text-indigo-400">browse</span>
        </p>
        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">PNG, JPG, WEBP • Max 20MB</p>
      </div>
      <input
        type="file"
        className="opacity-0 w-full h-full cursor-pointer relative z-10"
        accept="image/*"
        onChange={handleChange}
        disabled={isProcessing}
      />
    </div>
  );
};
