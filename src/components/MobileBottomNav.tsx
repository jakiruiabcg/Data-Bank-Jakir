import React from 'react';
import { ShieldCheck, PlusCircle, Youtube, LogOut } from 'lucide-react';

interface MobileBottomNavProps {
  onScrollToBox1: () => void;
  onSelectCategory: (cat: string) => void;
  onLockVault: () => void;
  recordCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onScrollToBox1,
  onSelectCategory,
  onLockVault,
  recordCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#4A0427] border-t-2 border-[#D4AF37] text-white shadow-2xl lg:hidden">
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        
        {/* Vault Home */}
        <button
          onClick={() => {
            onSelectCategory('ALL');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-[#D4AF37] active:scale-95 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Vault</span>
        </button>

        {/* Upload Form */}
        <button
          onClick={onScrollToBox1}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-sky-300 active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">Add Item</span>
        </button>

        {/* Saved Videos */}
        <button
          onClick={() => {
            onSelectCategory('Videos & Media');
            onScrollToBox1();
          }}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-rose-400 active:scale-95 transition-all"
        >
          <Youtube className="w-5 h-5 text-rose-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Videos</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={onLockVault}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-amber-300 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Sign Out</span>
        </button>

      </div>
    </nav>
  );
};
