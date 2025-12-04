
import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionTier | null;
  onConfirm: () => void;
  price: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onConfirm, price }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const handleMockPayment = () => {
    setIsProcessing(true);
    
    // Simulate network latency and processing
    setTimeout(() => {
        setIsSuccess(true);
        // Close modal after showing success message
        setTimeout(() => {
            onConfirm();
            onClose();
        }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-[420px] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-0 shadow-2xl animate-fade-in-up overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-white/[0.03] p-8 border-b border-white/5">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Checkout</h2>
                    <p className="text-slate-400 text-xs">Test Payment Gateway (Demo)</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-400 uppercase tracking-wider">Total</div>
                    <div className="text-2xl font-bold text-white">{price}</div>
                </div>
            </div>
            <div className="mt-6 flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                    {plan[0]}
                </div>
                <div>
                    <div className="text-white text-sm font-medium">Upgrading to {plan} Plan</div>
                    <div className="text-indigo-300 text-xs">Billed monthly</div>
                </div>
            </div>
        </div>

        {/* Body Section */}
        <div className="p-8 space-y-6">
            {!isSuccess ? (
                <>
                    <div className="bg-white text-black p-4 rounded-xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold tracking-widest">VISA</span>
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wider">**** 4242</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-emerald-500"></div>
                    </div>

                    <div className="text-xs text-slate-500 text-center leading-relaxed px-4">
                        This is a simulation. No real money will be charged.
                    </div>

                    <button 
                        onClick={handleMockPayment}
                        disabled={isProcessing}
                        className="w-full bg-[#00baf2] hover:bg-[#009fd0] text-white font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(0,186,242,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Pay {price}</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </>
                        )}
                    </button>
                    
                    <div className="text-center">
                        <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isProcessing}
                        className="text-sm text-slate-500 hover:text-white transition-colors"
                        >
                            Cancel Transaction
                        </button>
                    </div>
                </>
            ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                         <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Payment Successful</h3>
                    <p className="text-slate-400 text-sm">Your account has been upgraded.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
