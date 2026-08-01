import React, { useState, useEffect } from 'react';
import { 
  DocumentRecord, 
  AuditLog, 
  UserSecurityConfig 
} from './types';
import { 
  loadRecords, 
  saveRecords, 
  loadLogs, 
  addAuditLog, 
  loadSecurityConfig, 
  saveSecurityConfig 
} from './utils/storage';
import { encryptData } from './utils/crypto';

// Components
import { QatarHeader } from './components/QatarHeader';
import { PinLockModal } from './components/PinLockModal';
import { UploadBox } from './components/UploadBox';
import { SearchBox } from './components/SearchBox';
import { Sidebar } from './components/Sidebar';
import { DocumentCard } from './components/DocumentCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PrintDocumentModal } from './components/PrintDocumentModal';
import { AdminAuditLogsModal } from './components/AdminAuditLogsModal';
import { MfaSetupModal } from './components/MfaSetupModal';
import { PinChangeModal } from './components/PinChangeModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  // State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<UserSecurityConfig>(loadSecurityConfig());

  // Search & Filter State (Box 2)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSecurityFilter, setSelectedSecurityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Active Modals & Editing
  const [editingRecord, setEditingRecord] = useState<DocumentRecord | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string; desc: string } | null>(null);
  const [activePrintModal, setActivePrintModal] = useState<DocumentRecord | null>(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState<boolean>(false);
  const [showMfaModal, setShowMfaModal] = useState<boolean>(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    const loadedRecs = loadRecords();
    const loadedLgs = loadLogs();
    const loadedCfg = loadSecurityConfig();
    
    setRecords(loadedRecs);
    setLogs(loadedLgs);
    setConfig(loadedCfg);
  }, []);

  // Sync Records to LocalStorage
  const updateRecords = (newRecords: DocumentRecord[]) => {
    setRecords(newRecords);
    saveRecords(newRecords);
  };

  // Sync Security Config
  const handleUpdateConfig = (newConfig: UserSecurityConfig) => {
    setConfig(newConfig);
    saveSecurityConfig(newConfig);
    addAuditLog('MFA_UPDATED', `Security config updated by ${newConfig.ownerName}`);
    setLogs(loadLogs());
  };

  // Unlock Handler
  const handleUnlockVault = () => {
    setIsUnlocked(true);
    addAuditLog('PIN_UNLOCKED', `Vault unlocked with Security PIN ${config.pin}`);
    setLogs(loadLogs());
  };

  // Lock Vault Handler
  const handleLockVault = () => {
    setIsUnlocked(false);
    addAuditLog('PIN_UNLOCKED', 'Vault manually locked');
    setLogs(loadLogs());
  };

  // Save / Update Record Handler (Box 1)
  const handleSaveRecord = async (recordData: Partial<DocumentRecord>) => {
    let encryptedPayload: string | undefined = undefined;

    // Encrypt content if AES-256 level selected
    if (recordData.isEncrypted && recordData.description) {
      encryptedPayload = await encryptData(recordData.description, config.pin);
    }

    const existingIndex = records.findIndex(r => r.id === recordData.id);

    if (existingIndex >= 0) {
      // Edit existing
      const updatedList = [...records];
      const previous = updatedList[existingIndex];
      const updatedRecord: DocumentRecord = {
        ...previous,
        ...recordData,
        description: recordData.description || previous.description,
        encryptedContent: encryptedPayload || previous.encryptedContent,
        updatedAt: new Date().toISOString()
      } as DocumentRecord;

      updatedList[existingIndex] = updatedRecord;
      updateRecords(updatedList);
      setEditingRecord(null);

      addAuditLog('DOC_UPDATED', `Updated record: "${updatedRecord.subject}"`);
    } else {
      // Create new
      const newRecord: DocumentRecord = {
        id: `doc-${Date.now()}`,
        subject: recordData.subject || 'Untitled Record',
        category: recordData.category || 'Identity',
        description: recordData.description || '',
        encryptedContent: encryptedPayload,
        attachment: recordData.attachment,
        tags: recordData.tags || [],
        encryptionLevel: recordData.encryptionLevel || 'AES-256-GCM',
        isEncrypted: recordData.isEncrypted ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessedCount: 0,
        starred: false
      };

      const updatedList = [newRecord, ...records];
      updateRecords(updatedList);

      if (newRecord.attachment && newRecord.attachment.videoUrl) {
        addAuditLog('VIDEO_LINK_SAVED', `Saved video link: "${newRecord.subject}"`);
      } else {
        addAuditLog('DOC_ENCRYPTED_SAVED', `Created encrypted document: "${newRecord.subject}"`);
      }
    }

    setLogs(loadLogs());
  };

  // Delete Record Handler
  const handleDeleteRecord = (id: string) => {
    const target = records.find(r => r.id === id);
    const updated = records.filter(r => r.id !== id);
    updateRecords(updated);
    if (target) {
      addAuditLog('DOC_DELETED', `Deleted record: "${target.subject}"`, 'WARNING');
      setLogs(loadLogs());
    }
  };

  // Star Bookmark Handler
  const handleToggleStar = (id: string) => {
    const updated = records.map(r => 
      r.id === id ? { ...r, starred: !r.starred } : r
    );
    updateRecords(updated);
  };

  // Scroll to Box 1 or Box 2 helper for mobile
  const scrollToBox1 = () => {
    document.getElementById('upload-box-1')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToBox2 = () => {
    document.getElementById('search-box-2')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered Records calculation (Box 2)
  const filteredRecords = records.filter(record => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      record.subject.toLowerCase().includes(q) ||
      record.description.toLowerCase().includes(q) ||
      (record.tags && record.tags.some(t => t.toLowerCase().includes(q))) ||
      (record.attachment && record.attachment.name.toLowerCase().includes(q)) ||
      (record.attachment?.videoUrl && record.attachment.videoUrl.toLowerCase().includes(q))
    );

    // Category match
    const matchesCategory = selectedCategory === 'ALL' || (
      selectedCategory === 'Videos & Media'
        ? record.category === 'Videos & Media' || (record.attachment && !!record.attachment.videoUrl)
        : record.category === selectedCategory
    );

    // Security Tier match
    const matchesSecurity = selectedSecurityFilter === 'ALL' || (
      selectedSecurityFilter === 'ENCRYPTED' ? record.isEncrypted :
      selectedSecurityFilter === 'VIDEOS' ? (record.attachment && !!record.attachment.videoUrl) : true
    );

    return matchesSearch && matchesCategory && matchesSecurity;
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-slate-800 font-sans pb-20 lg:pb-12 selection:bg-[#8A1538] selection:text-white">
      
      {/* PIN Lock Screen Overlay if not unlocked */}
      {!isUnlocked && (
        <PinLockModal
          correctPin={config.pin}
          onUnlock={handleUnlockVault}
          ownerName={config.ownerName}
        />
      )}

      {/* Qatar Airways Inspired Sleek Top Header */}
      <QatarHeader
        config={config}
        isUnlocked={isUnlocked}
        onLockVault={handleLockVault}
        onOpenPinChange={() => setShowPinChangeModal(true)}
        onOpenMfa={() => setShowMfaModal(true)}
        onOpenAuditLogs={() => setShowAuditLogsModal(true)}
        recordCount={records.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Hero Security Banner - Sleek Interface Theme */}
        <div className="bg-gradient-to-r from-[#8A1538] via-[#75112F] to-[#5C0B23] rounded-2xl border border-[#8A1538]/30 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 text-white font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                  Vault Active • Akter
                </span>
                <span className="text-xs text-amber-200 font-medium tracking-wider uppercase">
                  Sleek Interface • Qatar Luxury
                </span>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-wide text-white">
                Personal Data Bank & Video Vault
              </h1>

              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed opacity-95">
                Securely store client-side encrypted documents, sensitive credentials, and save YouTube & Facebook video links to watch later. Hardware PIN 2020 verification with real-time audit logs.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={scrollToBox1}
                className="px-4 py-2.5 rounded-xl bg-white text-[#8A1538] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-slate-100 active:scale-95 transition-all"
              >
                + Add Encrypted Item
              </button>
              <button
                onClick={scrollToBox2}
                className="px-4 py-2.5 rounded-xl bg-[#6B102B] hover:bg-[#8A1538] text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
              >
                Quick Search Box
              </button>
            </div>
          </div>
        </div>

        {/* 2 Main Boxes Grid (Box 1: Encrypted Upload & Box 2: Quick Search) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BOX 01: Encrypted Upload & Record Form */}
          <UploadBox
            onSaveRecord={handleSaveRecord}
            editingRecord={editingRecord}
            onCancelEdit={() => setEditingRecord(null)}
            userPin={config.pin}
          />

          {/* BOX 02: Quick Search & Filtering Console */}
          <SearchBox
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSecurityFilter={selectedSecurityFilter}
            onSecurityFilterChange={setSelectedSecurityFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultCount={filteredRecords.length}
            totalCount={records.length}
          />

        </div>

        {/* Main Vault Content & Sidebar Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar (Categories & Activity Log Feed) */}
          <Sidebar
            records={records}
            logs={logs}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenAuditLogs={() => setShowAuditLogsModal(true)}
            onOpenMfa={() => setShowMfaModal(true)}
            mfaEnabled={config.mfaEnabled}
          />

          {/* Right Main Grid / Table of Document Records */}
          <div className="flex-1 w-full space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-[#8A1538] tracking-wider uppercase flex items-center space-x-2">
                <span>Encrypted Document Repository</span>
                <span className="text-xs bg-[#8A1538] text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {filteredRecords.length}
                </span>
              </h2>

              <span className="text-xs text-slate-500 hidden sm:inline">
                Click any record to decrypt or watch video link
              </span>
            </div>

            {/* Empty State */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  🔍
                </div>
                <h3 className="font-bold text-slate-700 text-base">No encrypted records found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No records match your search criteria. Add a new item in Box 01 or reset search filters in Box 02.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedSecurityFilter('ALL');
                  }}
                  className="px-4 py-2 bg-[#8A1538] text-white font-bold text-xs rounded-xl shadow hover:bg-[#75112F]"
                >
                  Clear Search Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredRecords.map(record => (
                  <DocumentCard
                    key={record.id}
                    record={record}
                    userPin={config.pin}
                    onEdit={rec => {
                      setEditingRecord(rec);
                      scrollToBox1();
                    }}
                    onDelete={handleDeleteRecord}
                    onPrint={rec => setActivePrintModal(rec)}
                    onWatchVideo={(url, title, desc) => setActiveVideoModal({ url, title, desc })}
                    onToggleStar={handleToggleStar}
                  />
                ))}
              </div>
            ) : (
              /* Compact Table Layout */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#8A1538] text-white font-serif uppercase tracking-wider">
                      <th className="p-3.5 font-bold">Subject</th>
                      <th className="p-3.5 font-bold">Category</th>
                      <th className="p-3.5 font-bold">Security Tier</th>
                      <th className="p-3.5 font-bold">Updated</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">
                          {record.subject}
                          {record.attachment?.videoUrl && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-800 font-bold">
                              Video
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600 font-semibold">{record.category}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${record.isEncrypted ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {record.encryptionLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">{new Date(record.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-1">
                          {record.attachment?.videoUrl && (
                            <button
                              onClick={() => setActiveVideoModal({
                                url: record.attachment!.videoUrl!,
                                title: record.subject,
                                desc: record.description
                              })}
                              className="px-2 py-1 bg-[#8A1538] text-white font-bold rounded text-[10px]"
                            >
                              Watch
                            </button>
                          )}
                          <button
                            onClick={() => setActivePrintModal(record)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[10px]"
                          >
                            Print PDF
                          </button>
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              scrollToBox1();
                            }}
                            className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="px-2 py-1 bg-rose-50 text-rose-600 font-bold rounded text-[10px]"
                          >
                            Del
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Mobile Android Bottom Navigation Bar */}
      <MobileBottomNav
        onScrollToBox1={scrollToBox1}
        onScrollToBox2={scrollToBox2}
        onSelectCategory={setSelectedCategory}
        onLockVault={handleLockVault}
        recordCount={records.length}
      />

      {/* Video Player Modal */}
      {activeVideoModal && (
        <VideoPlayerModal
          videoUrl={activeVideoModal.url}
          title={activeVideoModal.title}
          description={activeVideoModal.desc}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Printable PDF Voucher Modal */}
      {activePrintModal && (
        <PrintDocumentModal
          record={activePrintModal}
          onClose={() => setActivePrintModal(null)}
        />
      )}

      {/* Admin Real-Time Audit Logs Modal */}
      {showAuditLogsModal && (
        <AdminAuditLogsModal
          logs={logs}
          onClose={() => setShowAuditLogsModal(false)}
        />
      )}

      {/* MFA Security Setup Modal */}
      {showMfaModal && (
        <MfaSetupModal
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onClose={() => setShowMfaModal(false)}
        />
      )}

      {/* PIN Change Modal */}
      {showPinChangeModal && (
        <PinChangeModal
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onClose={() => setShowPinChangeModal(false)}
        />
      )}

    </div>
  );
}
