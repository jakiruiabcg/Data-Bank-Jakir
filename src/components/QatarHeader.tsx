import React from 'react';
import { ShieldCheck, Lock, LogOut, Key, Activity, Sparkles, UserCheck, Smartphone } from 'lucide-react';
import { UserSecurityConfig } from '../types';

interface QatarHeaderProps {
  config: UserSecurityConfig;
  isUnlocked: boolean;
  onLockVault: () => void;
  onOpenPinChange: () => void;
  onOpenMfa: () => void;
  onOpenAuditLogs: () => void;
  recordCount: number;
}

export const QatarHeader: React.FC<QatarHeaderProps> = ({
  config,
  isUnlocked,
  onLockVault,
  onOpenPinChange,
  onOpenMfa,
  onOpenAuditLogs,
  recordCount,
}) => {
  return (
    <header className="bg-[#4A0427] text-white border-b-2 border-[#D4AF37] shadow-xl sticky top-0 z-30">
      {/* Top Gold Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3C4] via-40% to-[#C5A059]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Qatar Airways Inspired Logo & Brand Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-[#70002A] to-[#36011B] border border-[#D4AF37]/40 shadow-inner group cursor-pointer">
              {/* Luxury Oryx/Vault Icon */}
              <ShieldCheck className="w-6 h-6 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse border-2 border-[#4A0427]" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif tracking-widest text-lg sm:text-xl font-bold text-white uppercase">
                  Personal Data Bank
                </span>
                <span className="bg-[#D4AF37] text-[#4A0427] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                  {config.ownerName || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-[#E2C376] tracking-wider uppercase font-medium hidden sm:block">
                Secure Data Bank
              </p>
            </div>
          </div>

          {/* Center Badges (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#36011B]/80 border border-[#D4AF37]/30 text-[#F3E5AB]">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Vault: {recordCount} Encrypted Items</span>
            </div>

            <button
              onClick={onOpenMfa}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all ${
                config.mfaEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>MFA: {config.mfaEnabled ? 'Active (2FA)' : 'Disabled'}</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Audit Logs Trigger */}
            <button
              onClick={onOpenAuditLogs}
              title="Real-Time Admin Audit Logs"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5C0632] hover:bg-[#70002A] border border-[#D4AF37]/40 text-xs text-[#F3E5AB] transition-all shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Audit Logs</span>
            </button>

            {/* PIN Settings */}
            <button
              onClick={onOpenPinChange}
              title="Change Security PIN"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#5C0632] hover:bg-[#70002A] border border-[#D4AF37]/40 text-xs text-white transition-all flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">PIN Settings</span>
            </button>

            {/* Sign Out / Lock Vault */}
            <button
              onClick={onLockVault}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isUnlocked ? 'Sign Out' : 'Unlocked'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

