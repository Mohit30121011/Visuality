
import React, { useState } from 'react';
import { User, SubscriptionTier } from '../types';

interface SettingsViewProps {
  user: User;
  onUpdateProfile: (name: string, email: string) => void;
  onUpgrade: (plan: SubscriptionTier) => void;
  onCouponRedeem: (plan: SubscriptionTier) => void;
  onCancelSubscription: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateProfile, onUpgrade, onCouponRedeem, onCancelSubscription, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('subscription');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Cancel Confirmation State
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const calculateProgress = () => {
    return (user.credits / user.maxCredits) * 100;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'FREE100') {
      onCouponRedeem('Pro');
      setCouponMessage({ type: 'success', text: 'Coupon applied! Upgraded to Pro Plan successfully.' });
      setCouponCode('');
      // Clear success message after 3 seconds
      setTimeout(() => setCouponMessage(null), 4000);
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid coupon code.' });
    }
  };

  const formattedJoinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in p-4 sm:p-0 min-h-[80vh]">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-4 backdrop-blur-md sticky top-24">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'subscription' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span className="font-medium text-sm">Plan & Usage</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'profile' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-medium text-sm">Profile</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Current Usage Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-slate-400 text-xs font-mono tracking-widest uppercase mb-1">Current Plan</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-white">{user.plan} Tier</span>
                      {user.plan === 'Free' && (
                        <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase rounded-full border border-white/5">
                          Limited
                        </span>
                      )}
                      {user.plan === 'Pro' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase rounded-full shadow-lg shadow-indigo-500/30">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-mono text-white font-light">
                        {user.credits} <span className="text-slate-500 text-lg">/ {user.maxCredits}</span>
                     </div>
                     <div className="text-slate-500 text-xs uppercase tracking-wide mt-1">Credits Remaining</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden mb-2">
                   <div 
                      className={`h-full rounded-full transition-all duration-1000 ${user.credits < 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      style={{ width: `${calculateProgress()}%` }}
                   ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Renews automatically on Nov 1, 2025</span>
                  {user.credits < 5 && <span className="text-rose-400">Low credits remaining</span>}
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* FREE */}
                <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative group ${user.plan === 'Free' ? 'bg-white/[0.02] border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}>
                    {user.plan === 'Free' && <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full"></div>}
                    <h3 className="text-white font-bold text-lg mb-1">Starter</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-white">₹0</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="text-slate-400 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            5 Credits / month
                        </li>
                        <li className="text-slate-400 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Basic Analysis
                        </li>
                    </ul>
                    <button 
                        disabled={user.plan === 'Free'}
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${user.plan === 'Free' ? 'bg-white/5 text-slate-500 cursor-default' : 'bg-white text-black hover:bg-slate-200'}`}
                    >
                        {user.plan === 'Free' ? 'Current Plan' : 'Downgrade'}
                    </button>
                </div>

                {/* PRO */}
                <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative group overflow-hidden ${user.plan === 'Pro' ? 'bg-black border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {user.plan === 'Pro' && <div className="absolute top-4 right-4 text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">CURRENT</div>}
                    
                    <h3 className="text-white font-bold text-lg mb-1 relative z-10">Pro Analyst</h3>
                    <div className="flex items-baseline gap-1 mb-4 relative z-10">
                        <span className="text-2xl font-bold text-white">₹2,499</span>
                        <span className="text-slate-500 text-xs">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8 relative z-10">
                        <li className="text-slate-300 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            100 Credits / month
                        </li>
                        <li className="text-slate-300 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Deep Biometric Audit
                        </li>
                        <li className="text-slate-300 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            PDF Reports
                        </li>
                    </ul>
                    <button 
                        onClick={() => onUpgrade('Pro')}
                        disabled={user.plan === 'Pro'}
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all relative z-10 ${user.plan === 'Pro' ? 'bg-white/5 text-slate-500 cursor-default' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25'}`}
                    >
                        {user.plan === 'Pro' ? 'Active' : 'Upgrade to Pro'}
                    </button>
                    {user.plan === 'Pro' && (
                        <button 
                           onClick={() => setShowCancelConfirm(true)}
                           className="w-full mt-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors underline decoration-rose-500/30 relative z-10"
                        >
                          Cancel Subscription
                        </button>
                    )}
                </div>

                {/* ENTERPRISE */}
                <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative group ${user.plan === 'Enterprise' ? 'bg-white/[0.02] border-indigo-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}>
                    <h3 className="text-white font-bold text-lg mb-1">Agency</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-white">₹16,999</span>
                        <span className="text-slate-500 text-xs">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="text-slate-400 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Unlimited Credits
                        </li>
                        <li className="text-slate-400 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            API Access
                        </li>
                    </ul>
                    <button 
                        onClick={() => onUpgrade('Enterprise')}
                        disabled={user.plan === 'Enterprise'}
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${user.plan === 'Enterprise' ? 'bg-white/5 text-slate-500 cursor-default' : 'bg-white text-black hover:bg-slate-200'}`}
                    >
                        {user.plan === 'Enterprise' ? 'Current Plan' : 'Contact Sales'}
                    </button>
                    {user.plan === 'Enterprise' && (
                        <button 
                           onClick={() => setShowCancelConfirm(true)}
                           className="w-full mt-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors underline decoration-rose-500/30 relative z-10"
                        >
                          Cancel Subscription
                        </button>
                    )}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  Redeem Coupon
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                   <div className="relative flex-grow">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code (e.g., FREE100)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all placeholder-slate-600 text-sm uppercase tracking-wider"
                      />
                   </div>
                   <button 
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all text-sm whitespace-nowrap"
                   >
                      Apply Coupon
                   </button>
                </div>
                {couponMessage && (
                   <div className={`mt-3 text-xs font-medium ${couponMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-2 animate-fade-in`}>
                      {couponMessage.type === 'success' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {couponMessage.text}
                   </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
             <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md animate-fade-in max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-24 h-24 rounded-full object-cover border-2 border-white/10" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                                {user.name.substring(0,2).toUpperCase()}
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg hover:bg-slate-200 transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <p className="text-slate-500 text-sm">Member since {formattedJoinDate}</p>
                    </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-all placeholder-slate-600 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-all placeholder-slate-600 text-sm"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         {isSaved && <span className="text-emerald-400 text-sm font-medium animate-fade-in">Changes saved successfully</span>}
                         <button 
                            type="submit"
                            className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-sm shadow-lg shadow-white/5 transition-all ml-auto"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
             </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)}></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
                <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-400 border border-rose-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cancel Subscription?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    You will lose access to premium features and your credit limit will be reset to the Free tier (5 credits/mo).
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                    >
                        Keep Plan
                    </button>
                    <button 
                        onClick={() => {
                            onCancelSubscription();
                            setShowCancelConfirm(false);
                        }}
                        className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors shadow-lg shadow-rose-500/20"
                    >
                        Confirm Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
