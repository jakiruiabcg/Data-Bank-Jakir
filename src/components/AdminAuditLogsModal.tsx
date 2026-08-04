import React, { useState } from 'react';
import { X, Activity, Download, Trash2, Filter, ShieldCheck, Clock, Monitor } from 'lucide-react';
import { AuditLog } from '../types';

interface AdminAuditLogsModalProps {
  logs: AuditLog[];
  onClose: () => void;
  onClearLogs?: () => void;
}

export const AdminAuditLogsModal: React.FC<AdminAuditLogsModalProps> = ({
  logs,
  onClose,
  onClearLogs,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesQuery = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.device.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'User', 'Device', 'Status', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.action,
      `"${l.user}"`,
      `"${l.device}"`,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vault_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-4xl bg-[#4A0427] border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#70002A] via-[#5C0632] to-[#36011B] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#36011B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F3E5AB] tracking-wide uppercase">
                Administrator Real-Time Audit Logs
              </h2>
              <p className="text-xs text-slate-300">
                Live Event Tracking • Security Monitoring for Jakir Vault
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

        {/* Filter Controls Bar */}
        <div className="p-4 bg-[#36011B] border-b border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#4A0427] border border-[#D4AF37]/30 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#4A0427] border border-[#D4AF37]/30 text-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warnings</option>
              <option value="ALERT">Alerts</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold rounded-lg shadow hover:brightness-110 transition-all flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* Logs Table / List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-[#4A0427]/60">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Activity className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm">No audit log records match your criteria.</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 bg-[#36011B] rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : log.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {log.status}
                    </span>

                    <span className="font-bold text-[#F3E5AB] text-xs font-mono">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </span>
                </div>

                <p className="text-slate-200 text-xs font-sans leading-relaxed">
                  {log.details}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-[#D4AF37]/10">
                  <span className="flex items-center space-x-1">
                    <Monitor className="w-3 h-3 text-slate-400" />
                    <span>User: {log.user} ({log.device})</span>
                  </span>

                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-[#36011B] border-t border-[#D4AF37]/30 text-xs text-slate-300 flex items-center justify-between">
          <span>Total Recorded Events: {filteredLogs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#5C0632] hover:bg-[#70002A] text-white border border-[#D4AF37]/30 transition-all font-semibold"
          >
            Close Audit Logs
          </button>
        </div>

      </div>
    </div>
  );
};
