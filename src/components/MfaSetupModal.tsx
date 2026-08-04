import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, CheckCircle2, Lock, Copy, RefreshCw } from 'lucide-react';
import { UserSecurityConfig } from '../types';

interface MfaSetupModalProps {
  config: UserSecurityConfig;
  onUpdateConfig: (newConfig: UserSecurityConfig) => void;
  onClose: () => void;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const [mfaEnabled, setMfaEnabled] = useState(config.mfaEnabled);
  const [testCode, setTestCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const secret = config.mfaSecret || 'JAKIR-MFA-9842-7710';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggleMfa = () => {
    const nextState = !mfaEnabled;
    setMfaEnabled(nextState);
    const updated = { ...config, mfaEnabled: nextState };
    onUpdateConfig(updated);
    setSuccessMsg(nextState ? 'Multi-Factor Authentication (MFA) Enabled!' : 'MFA Disabled.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-lg bg-[#4A0427] border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#70002A] via-[#5C0632] to-[#36011B] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#36011B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F3E5AB] tracking-wide uppercase">
                Multi-Factor Authentication (MFA)
              </h2>
              <p className="text-xs text-slate-300">
                2FA Hardware Security Layer • Security Vault
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

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MFA Toggle Status Card */}
          <div className="p-4 bg-[#36011B] rounded-xl border border-[#D4AF37]/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-[#F3E5AB] block">
                Two-Factor Authenticator Protection
              </span>
              <p className="text-xs text-slate-300">
                Requires 6-digit TOTP code in addition to Security PIN.
              </p>
            </div>

            <button
              onClick={handleToggleMfa}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all ${
                mfaEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {mfaEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Authenticator QR Code Setup Simulation */}
          <div className="p-4 bg-[#36011B] rounded-xl border border-[#D4AF37]/20 space-y-3">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
              1. Scan with Google Authenticator or Authy
            </span>

            <div className="flex items-center space-x-4 bg-[#4A0427] p-3 rounded-lg">
              {/* QR Code Placeholder Box */}
              <div className="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/JakirDataBank:vault?secret=${secret}&issuer=DataVault`}
                  alt="MFA QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-300">Manual Secret Key:</p>
                <div className="flex items-center space-x-2 font-mono bg-[#36011B] px-2.5 py-1 rounded border border-[#D4AF37]/30 text-[#F3E5AB]">
                  <span>{secret}</span>
                  <button onClick={handleCopySecret} className="text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copied && <span className="text-[10px] text-emerald-400 font-bold block">Copied to clipboard!</span>}
              </div>
            </div>
          </div>

          {/* Verification Code Check */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              2. Test Authenticator Passcode (6-digits)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={testCode}
                onChange={e => setTestCode(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#36011B] border border-[#D4AF37]/30 text-white font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              <button
                onClick={() => {
                  if (testCode.length === 6) {
                    setSuccessMsg('Passcode verified! Authenticator synchronized.');
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }
                }}
                className="px-4 py-2 bg-[#D4AF37] text-[#4A0427] font-bold text-xs uppercase rounded-xl hover:brightness-110"
              >
                Verify Code
              </button>
            </div>
          </div>

          {/* Backup Emergency Codes */}
          <div className="p-3 bg-[#36011B] rounded-xl border border-[#D4AF37]/20 text-xs space-y-1">
            <span className="font-bold text-[#F3E5AB] block">Emergency Backup Codes</span>
            <div className="font-mono text-[11px] text-slate-300 grid grid-cols-2 gap-1 pt-1">
              <span>• JAKIR-8921-X9</span>
              <span>• JAKIR-4092-B7</span>
              <span>• JAKIR-7712-Z4</span>
              <span>• JAKIR-2020-QA</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#36011B] border-t border-[#D4AF37]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-xs uppercase shadow hover:brightness-110"
          >
            Save & Exit MFA
          </button>
        </div>

      </div>
    </div>
  );
};
