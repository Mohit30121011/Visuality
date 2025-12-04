import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { LoadingView } from './components/LoadingView';
import { TextInput } from './components/text/TextInput';
import { TextAnalysisView } from './components/text/TextAnalysisView';
import { LoginModal } from './components/LoginModal';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { HistoryView } from './components/HistoryView';
import { analyzeImage } from './services/geminiService';
import { analyzeText } from './services/textService';
import { AnalysisResult, TextAnalysisResult, AppState, UploadState, TextState, User, SubscriptionTier, ViewMode, HistoryItem } from './types';
import { TiltCard } from './components/TiltCard';

const App: React.FC = () => {
  // Global Mode State
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [view, setView] = useState<ViewMode>('HOME');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Cancellation & Async Control
  const analysisScope = useRef(0);
  const progressInterval = useRef<any>(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingUpgradePlan, setPendingUpgradePlan] = useState<SubscriptionTier | null>(null);

  // Data State
  const [uploadState, setUploadState] = useState<UploadState>({ file: null, previewUrl: null });
  const [imageResult, setImageResult] = useState<AnalysisResult | null>(null);
  const [textState, setTextState] = useState<TextState>({ text: '', isFile: false });
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);
  
  // Animation Refs
  const bgBlob1Ref = useRef<HTMLDivElement>(null);
  const bgBlob2Ref = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  
  // Animation State Refs
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  // History State - Initialize empty, managed by useEffect based on User
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Linear Interpolation Helper
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Handle Physics-based Animations (Cursor, Parallax, Spotlight)
  useEffect(() => {
    // Initial mouse position (center screen) to prevent jump
    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    smoothMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
        
        // Instant update for the small dot (improves responsiveness feel)
        if (cursorDotRef.current) {
            cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        }
    };

    const animate = () => {
        // 1. Smooth Mouse Follower (The Ring)
        const { x: targetX, y: targetY } = mouseRef.current;
        const { x: currentX, y: currentY } = smoothMouseRef.current;

        // Factor 0.15 gives a nice "weighty" feel. Lower = slower/heavier.
        const smoothX = lerp(currentX, targetX, 0.15);
        const smoothY = lerp(currentY, targetY, 0.15);

        smoothMouseRef.current = { x: smoothX, y: smoothY };

        if (cursorRingRef.current) {
            cursorRingRef.current.style.transform = `translate3d(${smoothX}px, ${smoothY}px, 0) translate(-50%, -50%)`;
        }

        // 2. Parallax Background Blobs
        // We use the smooth position for blobs to make them feel floating
        const { innerWidth, innerHeight } = window;
        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        
        // Normalize -1 to 1 based on center
        const moveX = (smoothX - centerX) / centerX;
        const moveY = (smoothY - centerY) / centerY;

        if (bgBlob1Ref.current) {
            // Blob 1 moves opposite to mouse
            bgBlob1Ref.current.style.transform = `translate(${moveX * -40}px, ${moveY * -40}px)`;
        }
        if (bgBlob2Ref.current) {
            // Blob 2 moves with mouse
            bgBlob2Ref.current.style.transform = `translate(${moveX * 30}px, ${moveY * 30}px)`;
        }

        // 3. Spotlight Gradient
        if (spotlightRef.current) {
            spotlightRef.current.style.background = `radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(255,255,255,0.06), transparent 40%)`;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Handle Device Orientation (Mobile Tilt)
  useEffect(() => {
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
        if (e.beta === null || e.gamma === null) return;
        
        const tiltX = Math.min(Math.max(e.gamma / 25, -1), 1); 
        const tiltY = Math.min(Math.max((e.beta - 45) / 25, -1), 1);

        if (bgBlob1Ref.current) {
            bgBlob1Ref.current.style.transform = `translate(${tiltX * -40}px, ${tiltY * -40}px)`;
        }
        if (bgBlob2Ref.current) {
            bgBlob2Ref.current.style.transform = `translate(${tiltX * 30}px, ${tiltY * 30}px)`;
        }
    };
    
    if (window.matchMedia("(pointer: coarse)").matches) {
         window.addEventListener('deviceorientation', onDeviceOrientation);
    }
    return () => {
        window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, []);

  // Load History when User changes
  useEffect(() => {
    if (user?.email) {
      try {
        const key = `visuality_history_${user.email}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          setHistory(JSON.parse(saved));
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.warn("Failed to parse history from local storage", e);
        setHistory([]);
      }
    } else {
      // Clear history view when logged out
      setHistory([]);
    }
  }, [user?.email]);

  const saveToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev];
      if (user?.email) {
        // Save immediately to user-specific key
        localStorage.setItem(`visuality_history_${user.email}`, JSON.stringify(newHistory));
      }
      return newHistory;
    });
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      setHistory([]);
      if (user?.email) {
        localStorage.removeItem(`visuality_history_${user.email}`);
      }
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.type === 'image') {
      setMode('image');
      setImageResult(item);
      setUploadState({ file: null, previewUrl: null }); 
    } else {
      setMode('text');
      setTextResult(item);
      setTextState({ text: item.analyzed_text, isFile: false });
    }
    setAppState(AppState.COMPLETE);
    setView('HOME');
  };

  const handleModeChange = (newMode: 'image' | 'text') => {
    setMode(newMode);
    setView('HOME');
    setError(null);
    setAppState(AppState.IDLE); // Reset state when switching modes
  };

  const handleLogin = (email: string, name?: string, avatarUrl?: string) => {
    setUser({
      name: name || email.split('@')[0] || 'Analyst',
      email: email,
      avatarUrl: avatarUrl,
      plan: 'Free',
      credits: 5,
      maxCredits: 5,
      joinedAt: new Date().toISOString()
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('HOME');
  };

  const checkCredits = (): boolean => {
    if (!user) {
      setIsLoginModalOpen(true);
      return false;
    }
    if (user.credits <= 0) {
      alert("You have reached your analysis limit. Please upgrade your plan in Settings.");
      setView('SETTINGS');
      return false;
    }
    return true;
  };

  const deductCredit = () => {
    if (user) {
      setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - 1) } : null);
    }
  };

  const refundCredit = () => {
      if (user) {
          setUser(prev => prev ? { ...prev, credits: prev.credits + 1 } : null);
      }
  };

  const handleUpdateProfile = (name: string, email: string) => {
    setUser(prev => prev ? { ...prev, name, email } : null);
  };

  const handleUpgradeRequest = (tier: SubscriptionTier) => {
    if (!user) return;
    setPendingUpgradePlan(tier);
    setIsPaymentModalOpen(true);
  };

  const handleCouponRedeem = (plan: SubscriptionTier) => {
    if (!user) return;
    let newCredits = user.credits;
    let maxCredits = user.maxCredits;
    if (plan === 'Pro') {
      newCredits = 100;
      maxCredits = 100;
    } else if (plan === 'Enterprise') {
      newCredits = 9999;
      maxCredits = 9999;
    }
    setUser({
      ...user,
      plan: plan,
      credits: newCredits,
      maxCredits: maxCredits
    });
  };

  const handleCancelSubscription = () => {
    if (user) {
      setUser({
        ...user,
        plan: 'Free',
        credits: Math.min(user.credits, 5),
        maxCredits: 5
      });
      alert("Your subscription has been cancelled and reverted to the Free plan.");
    }
  };

  const handlePaymentConfirm = () => {
    if (!user || !pendingUpgradePlan) return;
    handleCouponRedeem(pendingUpgradePlan);
    setPendingUpgradePlan(null);
  };

  const getPriceForPlan = (plan: SubscriptionTier | null) => {
    if (plan === 'Pro') return '₹2,499.00';
    if (plan === 'Enterprise') return '₹16,999.00';
    return '₹0.00';
  };

  const simulateProgress = () => {
    setProgress(0);
    const intervalId = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        const increment = Math.max(0.5, Math.random() * 4);
        return Math.min(90, prev + increment);
      });
    }, 150);
    progressInterval.current = intervalId;
    return intervalId;
  };

  const handleCancelAnalysis = () => {
      analysisScope.current += 1;
      if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
      }
      setAppState(AppState.IDLE);
      setProgress(0);
      refundCredit();
  };

  const handleFileSelect = async (file: File) => {
    if (!checkCredits()) return;
    analysisScope.current += 1;
    const currentScope = analysisScope.current;
    const objectUrl = URL.createObjectURL(file);
    setUploadState({ file, previewUrl: objectUrl });
    setAppState(AppState.ANALYZING);
    setError(null);
    deductCredit();
    simulateProgress();
    try {
      const result = await analyzeImage(file);
      if (analysisScope.current !== currentScope) return;
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);
      const historyItem: HistoryItem = { ...result, type: 'image' };
      saveToHistory(historyItem);
      setTimeout(() => {
        if (analysisScope.current !== currentScope) return;
        setImageResult(result);
        setAppState(AppState.COMPLETE);
      }, 600);
    } catch (err) {
      if (analysisScope.current !== currentScope) return;
      if (progressInterval.current) clearInterval(progressInterval.current);
      console.error(err);
      setError("Failed to analyze image. Please ensure API Key is set.");
      setAppState(AppState.ERROR);
    }
  };

  const handleTextSubmit = async (text: string, isFile: boolean) => {
    if (!checkCredits()) return;
    analysisScope.current += 1;
    const currentScope = analysisScope.current;
    setTextState({ text, isFile });
    setAppState(AppState.ANALYZING);
    setError(null);
    deductCredit();
    simulateProgress();
    try {
      const result = await analyzeText(text);
      if (analysisScope.current !== currentScope) return;
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);
      const historyItem: HistoryItem = { ...result, type: 'text' };
      saveToHistory(historyItem);
      setTimeout(() => {
        if (analysisScope.current !== currentScope) return;
        setTextResult(result);
        setAppState(AppState.COMPLETE);
      }, 600);
    } catch (err) {
      if (analysisScope.current !== currentScope) return;
      if (progressInterval.current) clearInterval(progressInterval.current);
      console.error(err);
      setError("Failed to analyze text. Please ensure API Key is set.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    if (mode === 'image') {
      if (uploadState.previewUrl) URL.revokeObjectURL(uploadState.previewUrl);
      setUploadState({ file: null, previewUrl: null });
      setImageResult(null);
    } else {
      setTextState({ text: '', isFile: false });
      setTextResult(null);
    }
    setError(null);
    setProgress(0);
    setAppState(AppState.IDLE);
  };

  useEffect(() => {
    return () => {
      if (uploadState.previewUrl) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState.previewUrl]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-white/20 overflow-x-hidden md:cursor-none cursor-auto">
      {/* Custom Cursor Elements - Hidden on mobile */}
      <div 
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
      ></div>
      <div 
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/40 rounded-full pointer-events-none z-[9998] transition-opacity duration-300 ease-out hidden md:block"
        style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
      ></div>

      {/* Spotlight Overlay */}
      <div 
        ref={spotlightRef} 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 opacity-80"
      ></div>

      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-20 bg-black"></div>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
            ref={bgBlob1Ref}
            className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 animate-pulse-slow transition-transform duration-300 ease-out will-change-transform ${mode === 'image' ? 'bg-indigo-600' : 'bg-emerald-600'}`}
        ></div>
        <div 
            ref={bgBlob2Ref}
            className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-10 animate-pulse-slow transition-transform duration-300 ease-out will-change-transform"
        ></div>
      </div>

      <Header 
        currentMode={mode} 
        onModeChange={handleModeChange}
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onSettingsClick={() => setView('SETTINGS')}
        onHistoryClick={() => setView('HISTORY')}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={pendingUpgradePlan}
        price={getPriceForPlan(pendingUpgradePlan)}
        onConfirm={handlePaymentConfirm}
      />

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative z-10">
        
        {view === 'SETTINGS' && user ? (
          <SettingsView 
            user={user} 
            onUpdateProfile={handleUpdateProfile}
            onUpgrade={handleUpgradeRequest}
            onCouponRedeem={handleCouponRedeem}
            onCancelSubscription={handleCancelSubscription}
            onBack={() => setView('HOME')}
          />
        ) : view === 'HISTORY' ? (
          <HistoryView 
            history={history}
            onLoadItem={loadHistoryItem}
            onClearHistory={handleClearHistory}
            onBack={() => setView('HOME')}
          />
        ) : (
          <>
            {/* HOME VIEW: IDLE STATE */}
            {appState === AppState.IDLE && (
              <div 
                className="w-full max-w-2xl text-center space-y-10 animate-fade-in-up"
              >
                <div className="space-y-6">
                  {mode === 'image' ? (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
                      VISU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">A</span>L<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">I</span>TY <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">DETECTOR</span>
                    </h1>
                  ) : (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
                      VISU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">A</span>L<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">I</span>TY LINGUISTICS
                    </h1>
                  )}
                  
                  <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed font-light">
                    {mode === 'image' 
                      ? "Distinguish natural photography from generative AI using advanced deep learning fingerprints." 
                      : "Identify machine-generated text through stylometric patterns and perplexity analysis."}
                  </p>
                </div>

                {/* Reactive Landing Page Component using TiltCard with subtle rotation */}
                <div className="w-full">
                  <TiltCard maxRotation={3} scale={1.01} className="rounded-[2.5rem]" glowColor={mode === 'image' ? "bg-indigo-500" : "bg-emerald-500"}>
                    {mode === 'image' ? (
                       <FileUpload onFileSelect={handleFileSelect} />
                    ) : (
                       <TextInput onTextSubmit={handleTextSubmit} />
                    )}
                  </TiltCard>
                </div>

                <div className="flex justify-center gap-12 pt-4 border-t border-white/5 opacity-60">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">99.2%</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">&lt;2s</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Latency</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">AES-256</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Encryption</div>
                    </div>
                </div>
              </div>
            )}

            {/* ANALYZING STATE */}
            {appState === AppState.ANALYZING && (
              <LoadingView 
                mode={mode} // Pass mode for improved visual feedback
                previewUrl={uploadState.previewUrl} 
                progress={progress} 
                onCancel={handleCancelAnalysis}
              />
            )}

            {/* ERROR STATE */}
            {appState === AppState.ERROR && (
              <div className="w-full max-w-md text-center space-y-6 animate-fade-in p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400 border border-rose-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">Analysis Interrupted</h2>
                    <p className="text-slate-400 mt-2 font-light">{error}</p>
                </div>
                <button 
                    onClick={handleReset}
                    className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-full transition-all font-medium"
                >
                    Try Again
                </button>
              </div>
            )}

            {/* COMPLETE STATE */}
            {appState === AppState.COMPLETE && (
              <>
                {mode === 'image' && imageResult && (
                  <AnalysisView 
                    result={imageResult} 
                    imageUrl={uploadState.previewUrl} 
                    onReset={handleReset}
                  />
                )}
                {mode === 'text' && textResult && (
                  <TextAnalysisView
                    result={textResult}
                    onReset={handleReset}
                  />
                )}
              </>
            )}
          </>
        )}

      </main>

      {/* Improved Sticky Footer */}
      <footer className="w-full py-8 border-t border-white/5 bg-black/40 backdrop-blur-lg text-center relative z-20 mt-auto">
        <div className="flex justify-center gap-8 mb-4 text-xs font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">System Status</a>
        </div>
        <p className="text-slate-600 text-[10px] max-w-xl mx-auto px-4 leading-relaxed font-mono uppercase tracking-wide">
            VISUALITY AI &copy; {new Date().getFullYear()}. PROBABILISTIC ANALYSIS ONLY. NOT LEGAL EVIDENCE.
        </p>
      </footer>
    </div>
  );
};

export default App;