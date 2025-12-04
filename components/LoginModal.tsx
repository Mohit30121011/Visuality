import React, { useState, useEffect, useRef } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name?: string, avatarUrl?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // REAL GOOGLE OAUTH: Get this from Google Cloud Console
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('signin');
      setError(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setVerificationCode('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Initialize Real Google Sign-In
  useEffect(() => {
    if (isOpen && mode === 'signin' && window.google && GOOGLE_CLIENT_ID && googleButtonRef.current) {
        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: false,
                context: 'signin'
            });
            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                { 
                    theme: 'outline', 
                    size: 'large', 
                    width: '100%', // Dynamically resize
                    text: 'continue_with', 
                    shape: 'pill',
                    logo_alignment: 'left'
                }
            );
        } catch (e) {
            console.error("Google Auth Init Error:", e);
            setError("Google Sign-In failed to initialize. Check console.");
        }
    }
  }, [isOpen, mode, GOOGLE_CLIENT_ID]);

  // Handle Real Google JWT Response
  const handleGoogleCallback = (response: any) => {
      try {
          // 1. Get the raw JWT
          const jwtToken = response.credential;
          
          // 2. Client-side decode (Standard implementation)
          const parseJwt = (token: string) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
          };
          
          const payload = parseJwt(jwtToken);
          
          if (payload) {
              // 3. Extract user info
              const userEmail = payload.email;
              const userName = payload.name;
              const userPicture = payload.picture;
              
              // 4. Log the user in
              onLogin(userEmail, userName, userPicture);
              onClose();
          } else {
              throw new Error("Invalid Token Payload");
          }
      } catch (err) {
          console.error("Google Auth Error:", err);
          setError("Failed to verify Google account. Please try again.");
      }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- SIMULATED EMAIL LOGIN (Since there is no real DB) ---
    if (mode === 'forgot') {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Reset link sent (Simulation).");
            setMode('signin');
        }, 1000);
        return;
    }

    if (mode === 'verify') {
        if (verificationCode.length !== 6) {
            setError("Invalid code.");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLogin(email, name || email.split('@')[0]);
            onClose();
        }, 1000);
        return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'signup') {
          setMode('verify');
      } else {
          onLogin(email, email.split('@')[0]);
          onClose();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in transition-opacity duration-300" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-fade-in-up overflow-hidden group">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 opacity-70 group-hover:opacity-100"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full z-[150]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        {/* Header */}
        <div className="mt-2 mb-8 text-center relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400">V</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'verify' ? 'Check Inbox' : 'Reset Password'}
            </h2>
            <p className="text-slate-400 text-sm font-light">
                {mode === 'signin' ? 'Sign in to continue your analysis' : mode === 'signup' ? 'Join for professional forensics' : mode === 'verify' ? `Enter code sent to ${email}` : 'Secure account recovery'}
            </p>
        </div>

        {/* REAL Google Login Section */}
        {mode !== 'forgot' && mode !== 'verify' && (
            <>
                {GOOGLE_CLIENT_ID ? (
                    <div className="w-full mb-6 relative z-10 h-[44px]">
                        <div ref={googleButtonRef} className="w-full flex justify-center h-full"></div>
                    </div>
                ) : (
                    <div className="p-3 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-xs text-center relative z-10">
                        <strong>Setup Required:</strong> Add <code>REACT_APP_GOOGLE_CLIENT_ID</code> to enable Google OAuth.
                    </div>
                )}

                <div className="relative mb-6 z-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-medium">
                        <span className="bg-[#0f0f0f] px-3 text-slate-600">Or continue with</span>
                    </div>
                </div>
            </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center animate-pulse flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}

            {/* Verification Code Input */}
            {mode === 'verify' && (
                <div className="animate-fade-in-up space-y-4">
                     <input 
                        type="text" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-white/5"
                        placeholder="000000"
                        autoFocus
                    />
                </div>
            )}

            {/* Name Field - Only for Signup */}
            {mode === 'signup' && (
                <div className="animate-fade-in-up relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-slate-600 text-sm"
                        placeholder="Full Name"
                    />
                </div>
            )}

            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-slate-600 text-sm"
                            placeholder="Email address"
                            required
                        />
                    </div>
                
                    {mode !== 'forgot' && (
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-slate-600 text-sm"
                                placeholder="Password"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    )}
                    
                    {mode === 'signin' && (
                        <div className="flex justify-end">
                             <button type="button" onClick={() => setMode('forgot')} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                                Forgot password?
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Password - Only for Signup */}
            {mode === 'signup' && (
                <div className="animate-fade-in-up relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-slate-600 text-sm"
                        placeholder="Confirm Password"
                        required
                    />
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] duration-200 text-sm tracking-wide"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </>
                ) : (
                    <>
                    {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'verify' ? 'Verify Code' : 'Send Link'}
                    <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5 relative z-10">
            {mode !== 'verify' && (
                <button 
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {mode === 'signin' ? (
                        <>Don't have an account? <span className="text-indigo-400 font-medium hover:underline">Sign up</span></>
                    ) : mode === 'signup' ? (
                        <>Already have an account? <span className="text-indigo-400 font-medium hover:underline">Log in</span></>
                    ) : (
                        <span className="text-indigo-400 font-medium hover:underline flex items-center justify-center gap-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                             Back to Sign In
                        </span>
                    )}
                </button>
            )}
             {mode === 'verify' && (
                <button 
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-sm text-slate-400 hover:text-white transition-colors hover:underline"
                >
                    Change Email
                </button>
            )}
        </div>
      </div>
    </div>
  );
};