import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string; // e.g., "2020"
  onUnlock: () => void;
  ownerName: string;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  correctPin,
  onUnlock,
  ownerName,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 6) {
      const updated = pinInput + num;
      setPinInput(updated);
      setError('');
      if (updated === correctPin) {
        onUnlock();
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPinInput('');
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === correctPin) {
      onUnlock();
    } else {
      setAttempts(prev => prev + 1);
      setError(`Incorrect Security PIN. Default PIN is 2020. (Attempt ${attempts + 1})`);
      setPinInput('');
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, correctPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#230212]/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#4A0427] border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Luxury Header Banner */}
        <div className="bg-gradient-to-r from-[#70002A] via-[#5C0632] to-[#36011B] p-6 text-center border-b border-[#D4AF37]/30 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#36011B] border-2 border-[#D4AF37] shadow-lg mb-3">
            <ShieldCheck className="w-9 h-9 text-[#D4AF37]" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-wider text-white uppercase">
            Personal Data Bank
          </h2>
          <p className="text-xs text-[#E2C376] uppercase tracking-widest mt-1">
            Qatar Airways Security Vault • {ownerName}
          </p>
        </div>

        {/* PIN Entry Content */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-200">
              Enter Security PIN to Access Encrypted Records
            </p>
            <p className="text-xs text-[#D4AF37]/80">
              Master PIN Protection Enabled (Default: <span className="font-bold underline">2020</span>)
            </p>
          </div>

          {/* PIN Indicator Dots / Text */}
          <div className="flex justify-center items-center space-x-3 my-4">
            {[0, 1, 2, 3].map(idx => {
              const hasDigit = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all shadow-inner ${
                    hasDigit
                      ? 'border-[#D4AF37] bg-[#70002A] text-[#F3E5AB] scale-105'
                      : 'border-[#D4AF37]/30 bg-[#36011B]/60 text-transparent'
                  }`}
                >
                  {hasDigit ? pinInput[idx] || '•' : '•'}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center space-x-2 bg-rose-950/80 border border-rose-500/50 p-2.5 rounded-lg text-rose-200 text-xs text-center animate-bounce">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Touch Keypad for Mobile & Desktop */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-xl bg-[#5C0632] hover:bg-[#70002A] active:scale-95 border border-[#D4AF37]/30 text-white font-bold text-lg transition-all shadow-sm flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-[#36011B] hover:bg-[#4A0427] text-slate-300 font-semibold text-xs transition-all flex items-center justify-center"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-[#5C0632] hover:bg-[#70002A] active:scale-95 border border-[#D4AF37]/30 text-white font-bold text-lg transition-all shadow-sm flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-xl bg-[#36011B] hover:bg-[#4A0427] text-slate-300 font-semibold text-xs transition-all flex items-center justify-center"
            >
              DEL
            </button>
          </div>

          {/* Action Footer & Quick Unlock Button */}
          <div className="pt-2 flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Vault (2020)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-[#E2C376] hover:text-white flex items-center space-x-1 underline transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need PIN Hint?</span>
            </button>

            {showHint && (
              <div className="p-3 bg-[#36011B] rounded-lg border border-[#D4AF37]/30 text-xs text-[#F3E5AB] text-center w-full">
                🔒 Default system Security PIN is <strong className="text-white text-sm px-1.5 py-0.5 bg-[#70002A] rounded">2020</strong>. Click "Unlock Vault" above or press 2-0-2-0.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
