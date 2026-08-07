import React, { useState, useEffect } from 'react';
import { Download, Users, UserCheck, User, ShieldCheck } from 'lucide-react';
import { 
  DocumentRecord, 
  AuditLog, 
  UserSecurityConfig,
  FamilyMember,
  FAMILY_MEMBERS
} from './types';
import { 
  loadRecords, 
  loadRecordsFromIDB,
  saveRecords, 
  loadLogs, 
  addAuditLog, 
  loadSecurityConfig, 
  saveSecurityConfig 
} from './utils/storage';
import { encryptData } from './utils/crypto';
import { downloadRecord, downloadCategoryRecords } from './utils/download';

// Components
import { QatarHeader } from './components/QatarHeader';
import { PinLockModal } from './components/PinLockModal';
import { UploadBox } from './components/UploadBox';
import { DocumentCard } from './components/DocumentCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PrintDocumentModal } from './components/PrintDocumentModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
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
  const [selectedMember, setSelectedMember] = useState<FamilyMember | 'ALL'>('ALL');
  const [selectedSecurityFilter, setSelectedSecurityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Active Modals & Editing
  const [editingRecord, setEditingRecord] = useState<DocumentRecord | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string; desc: string } | null>(null);
  const [activePrintModal, setActivePrintModal] = useState<DocumentRecord | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<{ url: string; title: string; fileName: string; fileSize?: number } | null>(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState<boolean>(false);
  const [showMfaModal, setShowMfaModal] = useState<boolean>(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      const loadedRecs = await loadRecordsFromIDB();
      const loadedLgs = loadLogs();
      const loadedCfg = loadSecurityConfig();
      
      setRecords(loadedRecs);
      setLogs(loadedLgs);
      setConfig(loadedCfg);
    };
    initData();
  }, []);

  // Sync Records to LocalStorage & IndexedDB
  const updateRecords = async (newRecords: DocumentRecord[]) => {
    setRecords(newRecords);
    await saveRecords(newRecords);
  };

  // Sync Security Config
  const handleUpdateConfig = (newConfig: UserSecurityConfig) => {
    setConfig(newConfig);
    saveSecurityConfig(newConfig);
    addAuditLog('MFA_UPDATED', `Security config updated by ${newConfig.ownerName}`);
    setLogs(loadLogs());
  };

  // Unlock Handler
  const handleUnlockVault = async () => {
    setIsUnlocked(true);
    const freshRecs = await loadRecordsFromIDB();
    if (freshRecs && freshRecs.length > 0) {
      setRecords(freshRecs);
    }
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
        member: recordData.member || previous.member || (selectedMember !== 'ALL' ? selectedMember : 'Jakir'),
        description: recordData.description || previous.description,
        encryptedContent: encryptedPayload || previous.encryptedContent,
        updatedAt: new Date().toISOString()
      } as DocumentRecord;

      updatedList[existingIndex] = updatedRecord;
      await updateRecords(updatedList);
      setEditingRecord(null);

      addAuditLog('DOC_UPDATED', `Updated record: "${updatedRecord.subject}"`);
    } else {
      // Create new - Assign member correctly
      const targetMember: FamilyMember = recordData.member || (selectedMember !== 'ALL' ? selectedMember : 'Jakir');
      const newRecord: DocumentRecord = {
        id: `doc-${Date.now()}`,
        subject: recordData.subject || 'Untitled Record',
        category: recordData.category || 'Identity',
        member: targetMember,
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
      await updateRecords(updatedList);

      if (newRecord.attachment && newRecord.attachment.videoUrl) {
        addAuditLog('VIDEO_LINK_SAVED', `Saved video link: "${newRecord.subject}"`);
      } else {
        addAuditLog('DOC_ENCRYPTED_SAVED', `Created encrypted document: "${newRecord.subject}"`);
      }
    }

    setLogs(loadLogs());
  };

  // Delete Record Handler
  const handleDeleteRecord = async (id: string) => {
    const target = records.find(r => r.id === id);
    const updated = records.filter(r => r.id !== id);
    await updateRecords(updated);
    if (target) {
      addAuditLog('DOC_DELETED', `Deleted record: "${target.subject}"`, 'WARNING');
      setLogs(loadLogs());
    }
  };

  // Star Bookmark Handler
  const handleToggleStar = async (id: string) => {
    const updated = records.map(r => 
      r.id === id ? { ...r, starred: !r.starred } : r
    );
    await updateRecords(updated);
  };

  // Scroll to Box 1 helper for mobile
  const scrollToBox1 = () => {
    document.getElementById('upload-box-1')?.scrollIntoView({ behavior: 'smooth' });
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

    // Member Page Filter match
    const recordMember = record.member || 'Jakir';
    const matchesMember = selectedMember === 'ALL' || recordMember === selectedMember;

    return matchesSearch && matchesCategory && matchesSecurity && matchesMember;
  });

  // Priority Sorting: 1st Attached Document (Files/Photos/PDFs), 2nd Facebook Links, 3rd YouTube Links
  const getAttachmentPriority = (record: DocumentRecord): number => {
    if (!record.attachment) return 1; // Default document
    if (record.attachment.videoType === 'facebook') return 2; // Facebook Link
    if (record.attachment.videoType === 'youtube') return 3;  // YouTube Link
    if (record.attachment.videoUrl) {
      if (record.attachment.videoUrl.includes('facebook') || record.attachment.videoUrl.includes('fb.watch')) return 2;
      if (record.attachment.videoUrl.includes('youtube') || record.attachment.videoUrl.includes('youtu.be')) return 3;
      return 3;
    }
    return 1; // 1st: Attached Document (Files / Photos / PDFs)
  };

  const sortedFilteredRecords = [...filteredRecords].sort((a, b) => {
    const prioA = getAttachmentPriority(a);
    const prioB = getAttachmentPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-slate-800 font-sans pb-28 lg:pb-12 selection:bg-[#8A1538] selection:text-white">
      
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
        
        {/* Family Members Selector Bar & Dedicated Member Pages */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#8A1538]" />
                <span>Family Members Vault Directory / সদস্যভিত্তিক পেজ</span>
              </h2>
              <p className="text-xs text-slate-500">
                select a member (Jakir, Ayesha, Nowrin, Nowshad) to open their dedicated page and view all their personal documents & credentials.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>Total Family Vault Records:</span>
              <span className="font-bold text-[#8A1538]">{records.length}</span>
            </div>
          </div>

          {/* Member Selector Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* All Members Button */}
            <button
              type="button"
              onClick={() => setSelectedMember('ALL')}
              className={`p-3.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all shadow-xs cursor-pointer ${
                selectedMember === 'ALL'
                  ? 'bg-[#8A1538] border-[#8A1538] text-white shadow-md scale-102 ring-2 ring-[#8A1538]/30'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>All Members (সকল)</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedMember === 'ALL' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}>
                {records.length} Documents
              </span>
            </button>

            {/* Individual Family Member Page Tabs (Jakir, Ayesha, Nowrin, Nowshad) */}
            {FAMILY_MEMBERS.map(m => {
              const count = records.filter(r => (r.member || 'Jakir') === m).length;
              const isSelected = selectedMember === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`p-3.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 transition-all shadow-xs cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#8A1538] to-[#600A25] border-[#D4AF37] text-white shadow-lg scale-105 ring-4 ring-[#8A1538]/20'
                      : 'bg-sky-50/60 border-sky-200 text-slate-800 hover:bg-sky-100 hover:border-sky-400'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">👤</span>
                    <span className="text-sm font-extrabold">{m}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${isSelected ? 'bg-[#D4AF37] text-[#4A0427] font-extrabold' : 'bg-sky-200/80 text-sky-950 font-bold'}`}>
                    {count} Files
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Encrypted Upload & Record Form */}
        <UploadBox
          onSaveRecord={handleSaveRecord}
          editingRecord={editingRecord}
          onCancelEdit={() => setEditingRecord(null)}
          userPin={config.pin}
          selectedMemberFilter={selectedMember}
        />

        {/* Main Vault Content Grid */}
        <div className="w-full space-y-4">
            
            {/* Dedicated Member Page Banner */}
            {selectedMember !== 'ALL' && (
              <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 rounded-2xl p-5 text-white shadow-lg border-2 border-sky-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border-2 border-sky-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-serif font-bold text-xl text-white">
                        {selectedMember}'s Personal Vault Page
                      </h2>
                      <span className="text-[10px] bg-sky-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Dedicated Member View
                      </span>
                    </div>
                    <p className="text-xs text-sky-200 mt-1">
                      Viewing all verified documents, passports, certificates, and media records assigned to <strong>{selectedMember}</strong> ({filteredRecords.length} Items).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMember('ALL')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-100 font-bold text-xs border border-sky-300/40 transition-all shrink-0 flex items-center space-x-1"
                >
                  <span>Show All Members</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="font-serif font-bold text-xl text-[#8A1538] tracking-wider uppercase flex items-center space-x-2">
                <span>{selectedMember === 'ALL' ? 'Encrypted Document Repository' : `${selectedMember}'s Documents`}</span>
                <span className="text-xs bg-[#8A1538] text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {filteredRecords.length}
                </span>
              </h2>

              <div className="flex items-center space-x-2">
                {filteredRecords.length > 0 && (
                  <button
                    onClick={() => downloadCategoryRecords(selectedCategory, filteredRecords, 'txt')}
                    className="px-3 py-1 bg-[#8A1538] hover:bg-[#75112F] text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-all"
                    title={`Download all ${selectedCategory === 'ALL' ? 'Vault' : selectedCategory} records`}
                  >
                    <Download className="w-3.5 h-3.5 text-amber-200" />
                    <span>Download {selectedCategory === 'ALL' ? 'All' : selectedCategory}</span>
                  </button>
                )}
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Click any record to decrypt or download
                </span>
              </div>
            </div>

            {/* Empty State */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  🔍
                </div>
                <h3 className="font-bold text-slate-700 text-base">No encrypted records found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No records match your search criteria. Add a new item or reset search filters.
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
              /* Grid Layout (3 cards per row) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedFilteredRecords.map(record => (
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
                    onOpenPdfModal={(url, title, fileName, fileSize) => setActivePdfModal({ url, title, fileName, fileSize })}
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
                    {sortedFilteredRecords.map(record => (
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
                            onClick={() => downloadRecord(record)}
                            className="px-2 py-1 bg-[#8A1538] hover:bg-[#75112F] text-white font-bold rounded text-[10px] inline-flex items-center space-x-1 shadow-xs"
                            title="Download Record"
                          >
                            <Download className="w-3 h-3 text-amber-200" />
                            <span>Download</span>
                          </button>
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

      </main>

      {/* Mobile Android Bottom Navigation Bar */}
      <MobileBottomNav
        onScrollToBox1={scrollToBox1}
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

      {/* Interactive PDF Document Viewer Modal */}
      {activePdfModal && (
        <PdfPreviewModal
          pdfUrl={activePdfModal.url}
          title={activePdfModal.title}
          fileName={activePdfModal.fileName}
          fileSize={activePdfModal.fileSize}
          onClose={() => setActivePdfModal(null)}
        />
      )}

    </div>
  );
}
