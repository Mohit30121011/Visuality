
import React, { useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Helper to handle potential default export wrapper
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

if (pdfjs?.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface TextInputProps {
  onTextSubmit: (text: string, isFile: boolean) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ onTextSubmit }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      if (!pdfjs.getDocument) {
          throw new Error("PDF.js library not correctly initialized");
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      return fullText;
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const processFile = async (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result as string);
        onTextSubmit(e.target?.result as string, true);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setIsProcessing(true);
      try {
        const extractedText = await extractPdfText(file);
        if (!extractedText || extractedText.trim().length === 0) throw new Error("No text found");
        setText(extractedText);
        onTextSubmit(extractedText, true);
      } catch (error) {
        alert("Could not read PDF file.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("Please upload a supported file type (.txt, .md, .pdf).");
    }
  };

  const handleSubmit = () => {
    if (text.trim().length < 10) {
      alert("Please enter at least 10 characters.");
      return;
    }
    onTextSubmit(text, false);
  };

  return (
    <div className="w-full space-y-6">
      <div
        className={`relative flex flex-col w-full h-72 border border-dashed rounded-[2.5rem] transition-all duration-300 overflow-hidden
          ${isDragging 
            ? 'border-indigo-500/50 bg-indigo-500/10' 
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isProcessing && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-md">
             <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3"></div>
             <span className="text-white/80 font-medium text-xs tracking-widest">PROCESSING PDF...</span>
           </div>
        )}

        <textarea
          className="w-full h-full bg-transparent p-8 resize-none focus:outline-none text-slate-200 placeholder-slate-600 font-mono text-sm z-10 relative"
          placeholder="Paste text or drag & drop file (TXT, PDF, MD)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {/* Actions Bar inside textarea container */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex justify-end items-center gap-3">
            <label className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors flex items-center gap-2 backdrop-blur-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Import File
                <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFileChange} />
            </label>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="text-[10px] text-slate-500 font-mono font-medium tracking-wide">
           {text.length} CHARS {text.length > 5000 && <span className="text-amber-500/80 ml-2">• TRUNCATED</span>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || isProcessing}
          className="px-8 py-3 bg-white text-black hover:bg-slate-200 font-medium rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 duration-200"
        >
          Analyze Text
        </button>
      </div>
    </div>
  );
};
