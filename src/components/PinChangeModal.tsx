import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserSecurityConfig } from '../types';

interface PinChangeModalProps {
  config: UserSecurityConfig;
  onUpdateConfig: (newConfig: UserSecurityConfig) => void;
  onClose: () => void;
}

export const PinChangeModal: React.FC<PinChangeModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (currentPin !== config.pin) {
      setError('Current Security PIN is incorrect. (Default PIN is 2020)');
      return;
    }

    if (newPin.length < 4) {
      setError('New PIN must be at least 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and confirmation PIN do not match.');
      return;
    }

    const updated = { ...config, pin: newPin };
    onUpdateConfig(updated);
    setSuccess(`Security PIN updated successfully! New PIN is now active.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#4A0427] border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#70002A] via-[#5C0632] to-[#36011B] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#36011B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F3E5AB] tracking-wide uppercase">
                Change Security PIN
              </h2>
              <p className="text-xs text-slate-300">
                Master Vault Protection (Default: 2020)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#36011B] hover:bg-[#70002A] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Current Security PIN * (Default: 2020)
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="e.g. 2020"
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#36011B] border border-[#D4AF37]/30 text-white font-mono text-center font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              New Security PIN *
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="Enter new numeric PIN"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#36011B] border border-[#D4AF37]/30 text-white font-mono text-center font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Confirm New Security PIN *
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="Re-enter new PIN"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#36011B] border border-[#D4AF37]/30 text-white font-mono text-center font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 active:scale-98 transition-all"
          >
            Update Security PIN
          </button>

        </form>

      </div>
    </div>
  );
};
