import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  LayoutGrid, 
  List, 
  Lock, 
  Youtube, 
  ShieldCheck, 
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { CategoryType } from '../types';

interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedSecurityFilter: string;
  onSecurityFilterChange: (sec: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  resultCount: number;
  totalCount: number;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Vault Items', value: 'ALL' },
  { label: 'Videos & Media', value: 'Videos & Media' },
  { label: 'Identity & Passports', value: 'Identity' },
  { label: 'Credentials', value: 'Credentials' },
  { label: 'Financial', value: 'Financial' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Personal Notes', value: 'Personal Notes' },
  { label: 'Medical', value: 'Medical' },
];

export const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSecurityFilter,
  onSecurityFilterChange,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
}) => {
  return (
    <div id="search-box-2" className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl overflow-hidden">
      
      {/* Box 2 Header */}
      <div className="bg-gradient-to-r from-[#4A0427] via-[#5C0632] to-[#70002A] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#36011B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg tracking-wide uppercase text-[#F3E5AB]">
              BOX 02: Quick Search & Filter Console
            </h2>
            <p className="text-xs text-slate-300">
              Instant Document Query • Indexing {totalCount} Encrypted Items
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-[#36011B] p-1 rounded-xl border border-[#D4AF37]/30">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid Card View"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-[#70002A] text-[#F3E5AB] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Compact Table View"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-[#70002A] text-[#F3E5AB] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Search Controls */}
      <div className="p-5 space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#4A0427] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Quick search by subject, description, tag, file name, or YouTube/Facebook link..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-[#4A0427] focus:ring-4 focus:ring-[#4A0427]/10 text-sm font-medium transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onCategoryChange(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4A0427] text-[#F3E5AB] border border-[#D4AF37] shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Security Tier Filter */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A0427]" />
            <select
              value={selectedSecurityFilter}
              onChange={e => onSecurityFilterChange(e.target.value)}
              className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Security Tiers</option>
              <option value="ENCRYPTED">AES-256 Encrypted Only</option>
              <option value="VIDEOS">Saved Videos Only (YT/FB)</option>
            </select>
          </div>

        </div>

        {/* Live Filter Counter Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="font-semibold text-[#4A0427]">
            Showing {resultCount} of {totalCount} records
            {searchQuery && ` for query "${searchQuery}"`}
          </span>

          {(searchQuery || selectedCategory !== 'ALL' || selectedSecurityFilter !== 'ALL') && (
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('ALL');
                onSecurityFilterChange('ALL');
              }}
              className="text-xs text-rose-700 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
