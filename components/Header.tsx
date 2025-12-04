import React, { useState, useEffect } from 'react';

interface HeaderProps {
  currentMode: 'image' | 'text';
  onModeChange: (mode: 'image' | 'text') => void;
  isLoggedIn: boolean;
  user?: { name: string; email: string; avatarUrl?: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  onHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentMode, 
  onModeChange,
  isLoggedIn,
  user,
  onLoginClick,
  onLogoutClick,
  onSettingsClick,
  onHistoryClick
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when mode changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentMode]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSettingsClick = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    onSettingsClick();
  };

  const handleHistoryClick = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    onHistoryClick();
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isMobileMenuOpen ? 'bg-black' : 'bg-black/40 backdrop-blur-xl border-b border-white/5'}`}>
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group z-50" onClick={() => onModeChange('image')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-mono text-xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform group-hover:scale-105">
              V
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold text-white tracking-tight leading-none group-hover:opacity-100 transition-opacity">
                VISU<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">A</span>L<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">I</span>TY
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">AI Forensics</span>
            </div>
          </div>
          
          {/* Desktop Actions Group (Nav + Auth) */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Mode Switcher - Sliding Pill Animation */}
            <nav className="relative flex items-center p-1 bg-white/5 border border-white/5 rounded-full backdrop-blur-md w-72">
              {/* Animated Background Pill */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-0.5rem)] rounded-full bg-white/10 border border-white/10 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  currentMode === 'image' ? 'left-1' : 'left-1/2'
                }`}
              ></div>

              <button 
                onClick={() => onModeChange('image')}
                className={`relative z-10 w-1/2 py-2 text-xs font-medium rounded-full transition-colors duration-300 ${
                  currentMode === 'image' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Image Analysis
              </button>
              <button 
                onClick={() => onModeChange('text')}
                className={`relative z-10 w-1/2 py-2 text-xs font-medium rounded-full transition-colors duration-300 ${
                  currentMode === 'text' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Text Analysis
              </button>
            </nav>

             {/* Auth/Profile */}
             {isLoggedIn && user ? (
               <div className="relative pl-4 border-l border-white/5">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 hover:bg-white/5 py-1 pr-3 pl-1 rounded-full transition-all border border-transparent hover:border-white/5"
                  >
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          className="w-9 h-9 rounded-full border border-white/10 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {user.name.substring(0,2).toUpperCase()}
                        </div>
                      )}
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                      <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
                          <div className="absolute right-0 mt-4 w-64 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in-up origin-top-right ring-1 ring-white/5">
                              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                                  <p className="text-sm text-white font-medium truncate mt-1">{user.email}</p>
                              </div>
                              <div className="py-2">
                                  <button onClick={handleHistoryClick} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors group">
                                      <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      Analysis History
                                  </button>
                                  <button 
                                      onClick={handleSettingsClick}
                                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors group"
                                  >
                                      <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                      Settings
                                  </button>
                              </div>
                              <div className="border-t border-white/5 py-2 mt-1">
                                  <button 
                                      onClick={() => {
                                          setIsProfileOpen(false);
                                          onLogoutClick();
                                      }}
                                      className="flex w-full items-center gap-3 px-5 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                      Sign Out
                                  </button>
                              </div>
                          </div>
                      </>
                  )}
               </div>
             ) : (
               <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                   <button 
                      onClick={onLoginClick}
                      className="px-6 py-2.5 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
                   >
                      Log In
                   </button>
               </div>
             )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden z-50 p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 flex flex-col items-end gap-1.5">
              <span className={`h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
              <span className={`h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
              <span className={`h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl transition-all duration-500 md:hidden flex flex-col pt-20 px-6 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Mobile Nav Switcher */}
          <div className="space-y-6">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-4">Select Mode</div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onModeChange('image')}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all active:scale-95 duration-200 ${
                  currentMode === 'image' 
                    ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5' 
                    : 'bg-white/5 border-transparent text-slate-400'
                }`}
              >
                <span className="text-sm font-medium">Image Forensics</span>
              </button>
              <button 
                onClick={() => onModeChange('text')}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all active:scale-95 duration-200 ${
                  currentMode === 'text' 
                    ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5' 
                    : 'bg-white/5 border-transparent text-slate-400'
                }`}
              >
                <span className="text-sm font-medium">Text Analysis</span>
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
             <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-4">Account</div>
             {isLoggedIn && user ? (
               <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                 <div className="flex items-center gap-4 mb-4">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                     <button onClick={handleSettingsClick} className="py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors">Settings</button>
                     <button onClick={handleHistoryClick} className="py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors">History</button>
                 </div>
                 <button 
                  onClick={() => {
                    onLogoutClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-rose-500/10 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/20 transition-colors"
                 >
                   Sign Out
                 </button>
               </div>
             ) : (
               <div className="space-y-3">
                 <button 
                   onClick={() => {
                     setIsMobileMenuOpen(false);
                     onLoginClick();
                   }}
                   className="w-full py-4 bg-white text-black rounded-2xl font-bold shadow-lg shadow-white/10"
                 >
                   Log In
                 </button>
               </div>
             )}
          </div>
      </div>
    </>
  );
};