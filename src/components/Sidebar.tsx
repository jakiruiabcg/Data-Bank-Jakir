import React from 'react';
import { 
  Folder, 
  ShieldCheck, 
  Youtube, 
  Facebook, 
  Activity, 
  Clock, 
  Lock, 
  ChevronRight, 
  FileText, 
  Video, 
  CreditCard, 
  Key, 
  HeartPulse, 
  FileCode,
  Smartphone
} from 'lucide-react';
import { CategoryType, AuditLog, DocumentRecord } from '../types';

interface SidebarProps {
  records: DocumentRecord[];
  logs: AuditLog[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenAuditLogs: () => void;
  onOpenMfa: () => void;
  mfaEnabled: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  records,
  logs,
  selectedCategory,
  onSelectCategory,
  onOpenAuditLogs,
  onOpenMfa,
  mfaEnabled,
}) => {
  // Count records per category
  const getCategoryCount = (catName: string) => {
    if (catName === 'ALL') return records.length;
    if (catName === 'Videos & Media') {
      return records.filter(r => r.category === 'Videos & Media' || (r.attachment && r.attachment.videoUrl)).length;
    }
    return records.filter(r => r.category === catName).length;
  };

  const categories = [
    { label: 'All Vault Items', value: 'ALL', icon: Folder },
    { label: 'Identity & Passports', value: 'Identity', icon: ShieldCheck },
    { label: 'Saved Videos & Media', value: 'Videos & Media', icon: Video },
    { label: 'Credentials & Passwords', value: 'Credentials', icon: Key },
    { label: 'Financial Records', value: 'Financial', icon: CreditCard },
    { label: 'Legal & Contracts', value: 'Legal', icon: FileCode },
    { label: 'Personal Notes', value: 'Personal Notes', icon: FileText },
    { label: 'Medical Records', value: 'Medical', icon: HeartPulse },
  ];

  // Saved videos preview count
  const videoCount = getCategoryCount('Videos & Media');
  const recentLogs = logs.slice(0, 5);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      
      {/* File Categories Panel */}
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden">
        <div className="bg-[#4A0427] px-4 py-3.5 border-b border-[#D4AF37]/30 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-[#F3E5AB]">
              File Categories
            </h3>
          </div>
          <span className="text-[10px] bg-[#36011B] text-[#D4AF37] px-2 py-0.5 rounded font-bold border border-[#D4AF37]/30">
            Akter Vault
          </span>
        </div>

        <div className="p-2 space-y-1">
          {categories.map(cat => {
            const IconComponent = cat.icon;
            const count = getCategoryCount(cat.value);
            const isSelected = selectedCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#4A0427] text-[#F3E5AB] shadow-md border border-[#D4AF37]/40'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#4A0427]'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#D4AF37]' : 'text-[#4A0427]'}`} />
                  <span className="truncate">{cat.label}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-[#70002A] text-[#F3E5AB]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Watch Later Special Widget */}
      <div className="bg-gradient-to-br from-[#70002A] to-[#4A0427] rounded-2xl border border-[#D4AF37]/40 p-4 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Youtube className="w-4 h-4 text-rose-400" />
            <Facebook className="w-4 h-4 text-blue-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#F3E5AB]">
              Saved Video Library
            </h4>
          </div>
          <span className="text-xs font-extrabold text-[#D4AF37] bg-[#36011B] px-2 py-0.5 rounded">
            {videoCount} Saved
          </span>
        </div>

        <p className="text-[11px] text-slate-200 mb-3 leading-relaxed">
          YouTube & Facebook video links saved for offline watch and quick search.
        </p>

        <button
          onClick={() => onSelectCategory('Videos & Media')}
          className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-xs rounded-xl shadow hover:brightness-110 transition-all flex items-center justify-center space-x-1"
        >
          <span>Watch Saved Videos</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Activity Logs Widget */}
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden">
        <div className="bg-[#4A0427] px-4 py-3 border-b border-[#D4AF37]/30 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-[#F3E5AB]">
              Recent Activity Logs
            </h3>
          </div>
          <button
            onClick={onOpenAuditLogs}
            className="text-[10px] text-[#E2C376] hover:text-white underline font-semibold"
          >
            View All
          </button>
        </div>

        <div className="p-3 space-y-2.5">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-2">No recent events recorded</p>
          ) : (
            recentLogs.map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#4A0427]/30 transition-all text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A0427] text-[11px] uppercase tracking-wide">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2 leading-tight">
                  {log.details}
                </p>
                <div className="text-[9px] text-slate-400 font-mono">
                  {log.user} • {log.device}
                </div>
              </div>
            ))
          )}

          <button
            onClick={onOpenAuditLogs}
            className="w-full mt-2 py-2 text-center text-xs text-[#4A0427] font-bold hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center justify-center space-x-1"
          >
            <span>Open Real-Time Audit Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
};
