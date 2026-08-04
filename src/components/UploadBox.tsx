import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  FileText, 
  Youtube, 
  Facebook, 
  Video, 
  Lock, 
  Tag, 
  CheckCircle2, 
  X,
  PlusCircle,
  Save,
  Paperclip,
  Sparkles,
  Image as ImageIcon,
  Eye,
  Maximize2
} from 'lucide-react';
import { DocumentRecord, CategoryType, EncryptionLevel, Attachment, FamilyMember, FAMILY_MEMBERS } from '../types';
import { parseVideoUrl, formatBytes } from '../utils/crypto';
import { PdfPreviewModal } from './PdfPreviewModal';

interface UploadBoxProps {
  onSaveRecord: (record: Partial<DocumentRecord>) => void;
  editingRecord: DocumentRecord | null;
  onCancelEdit: () => void;
  userPin: string;
  selectedMemberFilter?: FamilyMember | 'ALL' | 'All';
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onSaveRecord,
  editingRecord,
  onCancelEdit,
  userPin,
  selectedMemberFilter = 'ALL'
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CategoryType>('Identity');

  const getActiveMember = (): FamilyMember => {
    if (selectedMemberFilter && selectedMemberFilter !== 'ALL' && selectedMemberFilter !== 'All') {
      return selectedMemberFilter as FamilyMember;
    }
    return 'Jakir';
  };

  const [member, setMember] = useState<FamilyMember>(getActiveMember());
  const [description, setDescription] = useState('');
  const [encryptionLevel, setEncryptionLevel] = useState<EncryptionLevel>('AES-256-GCM');
  const [tagsInput, setTagsInput] = useState('');
  
  // Attachment state (1. Attach Document, 2. Facebook Link, 3. YouTube Link)
  const [attachmentType, setAttachmentType] = useState<'file' | 'facebook' | 'youtube'>('file');
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPreview, setVideoPreview] = useState<ReturnType<typeof parseVideoUrl>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Pre-fill if editing record
  useEffect(() => {
    const activeMem = getActiveMember();
    if (editingRecord) {
      setSubject(editingRecord.subject || '');
      setCategory(editingRecord.category || 'Identity');
      setMember(editingRecord.member || activeMem);
      setDescription(editingRecord.description || '');
      setEncryptionLevel(editingRecord.encryptionLevel || 'AES-256-GCM');
      setTagsInput(editingRecord.tags ? editingRecord.tags.join(', ') : '');
      
      if (editingRecord.attachment) {
        if (editingRecord.attachment.videoUrl) {
          const type = editingRecord.attachment.videoType === 'facebook' || editingRecord.attachment.videoUrl.includes('facebook') ? 'facebook' : 'youtube';
          setAttachmentType(type);
          setVideoUrlInput(editingRecord.attachment.videoUrl);
          setVideoPreview(parseVideoUrl(editingRecord.attachment.videoUrl));
        } else {
          setAttachmentType('file');
          setAttachedFile(editingRecord.attachment);
        }
      } else {
        setAttachedFile(null);
        setVideoUrlInput('');
        setVideoPreview(null);
      }
    } else {
      setMember(activeMem);
    }
  }, [editingRecord, selectedMemberFilter]);

  const resetForm = () => {
    const activeMem = getActiveMember();
    setSubject('');
    setCategory('Identity');
    setMember(activeMem);
    setDescription('');
    setEncryptionLevel('AES-256-GCM');
    setTagsInput('');
    setAttachedFile(null);
    setVideoUrlInput('');
    setVideoPreview(null);
    setAttachmentType('file');
  };

  // Handle Video URL Change
  const handleVideoUrlChange = (url: string) => {
    setVideoUrlInput(url);
    const parsed = parseVideoUrl(url);
    setVideoPreview(parsed);
    if (parsed && category !== 'Videos & Media') {
      setCategory('Videos & Media');
    }
  };

  // Process File and Generate Image / PDF Thumbnail
  const processFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const isPdf = file.type === 'application/pdf' || 
                    dataUrl.startsWith('data:application/pdf') || 
                    /\.pdf$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || 
                      dataUrl.startsWith('data:image/') || 
                      /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(file.name);

      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type || (isPdf ? 'application/pdf' : isImage ? 'image/jpeg' : 'application/octet-stream'),
        dataUrl: dataUrl,
        previewUrl: isImage || isPdf ? dataUrl : undefined
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsSubmitting(true);

    // Prepare tags array
    const tagsArr = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Prepare Attachment (Order: 1st Document, 2nd Facebook, 3rd YouTube)
    let finalAttachment: Attachment | undefined = undefined;
    if ((attachmentType === 'facebook' || attachmentType === 'youtube') && videoUrlInput.trim()) {
      const parsed = parseVideoUrl(videoUrlInput);
      const isFb = attachmentType === 'facebook' || (parsed && parsed.type === 'facebook');
      finalAttachment = {
        name: subject || (isFb ? 'Saved Facebook Link' : 'Saved YouTube Link'),
        size: 0,
        type: 'video/link',
        videoUrl: videoUrlInput.trim(),
        videoType: isFb ? 'facebook' : 'youtube',
        videoId: parsed?.videoId
      };
    } else if (attachedFile) {
      finalAttachment = attachedFile;
    }

    const recordData: Partial<DocumentRecord> = {
      id: editingRecord ? editingRecord.id : `doc-${Date.now()}`,
      subject: subject.trim(),
      category,
      member,
      description: description.trim(),
      encryptionLevel,
      isEncrypted: encryptionLevel === 'AES-256-GCM',
      tags: tagsArr,
      attachment: finalAttachment,
      updatedAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSaveRecord(recordData);
      setIsSubmitting(false);
      setSuccessMsg(editingRecord ? 'Record updated successfully!' : 'Document encrypted & saved to vault!');
      if (!editingRecord) resetForm();

      setTimeout(() => setSuccessMsg(''), 3000);
    }, 400);
  };

  return (
    <div id="upload-box-1" className="bg-white rounded-2xl border-2 border-sky-400 shadow-xl overflow-hidden transition-all">
      
      {/* Box 1 Header - LIGHT BLUE THEME */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 px-6 py-4 border-b border-sky-300/40 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-sky-950/50 border border-sky-200/50 flex items-center justify-center text-sky-100 shadow-xs">
            {editingRecord ? <Save className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg tracking-wide uppercase text-white flex items-center space-x-2">
              <span>{editingRecord ? 'Edit Encrypted Document' : 'Encrypted Upload & Document Entry'}</span>
            </h2>
            <p className="text-xs text-sky-100/90">
              AES-256 Hardware Encrypted Entry • PIN Protected Access
            </p>
          </div>
        </div>

        {editingRecord && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center space-x-1 text-xs bg-sky-950/60 hover:bg-sky-900 text-sky-100 px-3 py-1.5 rounded-lg border border-sky-200/40 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        
        {/* Row 1: Subject, Category, Member */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider">
              Subject (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Passport Scan, Qatar Privilege Card, Video Tutorial"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as CategoryType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm font-medium bg-slate-50 transition-all"
            >
              <option value="Identity">Identity & Passports</option>
              <option value="Credentials">Credentials & Passwords</option>
              <option value="Videos & Media">Videos & Watch Later</option>
              <option value="Financial">Financial & Banking</option>
              <option value="Legal">Legal & Contracts</option>
              <option value="Personal Notes">Personal Notes</option>
              <option value="Medical">Medical & Health</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center justify-between">
              <span>Member (সদস্য) *</span>
            </label>
            <select
              value={member}
              onChange={e => setMember(e.target.value as FamilyMember)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sky-400 font-bold focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 text-sm bg-sky-50/80 text-sky-950 transition-all shadow-xs"
            >
              {FAMILY_MEMBERS.map(m => (
                <option key={m} value={m}>
                  👤 {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider">
            Description & Encrypted Payload Details
          </label>
          <textarea
            rows={3}
            placeholder="Enter confidential notes, secret account codes, reference numbers, or video description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm transition-all"
          />
        </div>

        {/* Attachment Toggle (Order: 1st Attach Document, 2nd Facebook Link, 3rd YouTube Link) */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider">
              Attachment / Media Type
            </label>
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => setAttachmentType('file')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  attachmentType === 'file'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>1. Attach Document</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentType('facebook')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  attachmentType === 'facebook'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>2. Facebook Link</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentType('youtube')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  attachmentType === 'youtube'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>3. YouTube Link</span>
              </button>
            </div>
          </div>

          {attachmentType === 'file' ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                isDragging 
                  ? 'border-sky-500 bg-sky-100/80 ring-4 ring-sky-300/30' 
                  : 'border-sky-300 hover:border-sky-500 bg-sky-50/50'
              }`}
            >
              {attachedFile ? (
                /* PDF THUMBNAIL PREVIEW */
                attachedFile.type === 'application/pdf' || attachedFile.name.toLowerCase().endsWith('.pdf') || (attachedFile.dataUrl && attachedFile.dataUrl.startsWith('data:application/pdf')) ? (
                  <div className="relative group bg-slate-900 rounded-xl p-3 border-2 border-rose-500 shadow-lg text-white text-left transition-all">
                    {/* PDF Header bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="p-1.5 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                              PDF Document
                            </span>
                            <p className="text-xs font-bold text-rose-100 truncate">{attachedFile.name}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {formatBytes(attachedFile.size)} • PDF Attachment Ready
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {attachedFile.dataUrl && (
                          <button
                            type="button"
                            onClick={() => setShowPdfModal(true)}
                            className="p-1.5 rounded-lg bg-rose-900 hover:bg-rose-600 text-white border border-rose-700 transition-colors flex items-center space-x-1 text-xs font-bold px-2.5"
                            title="Full PDF Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview PDF</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                          title="Remove PDF"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live PDF Thumbnail Canvas Box */}
                    <div className="relative rounded-lg overflow-hidden bg-white border border-rose-900/40 h-44 flex items-center justify-center group">
                      {attachedFile.dataUrl && attachedFile.dataUrl.startsWith('data:application/pdf') ? (
                        <iframe
                          src={`${attachedFile.dataUrl}#toolbar=0&navpanes=0&view=FitH`}
                          title={attachedFile.name}
                          className="w-full h-full pointer-events-none rounded bg-white"
                        />
                      ) : (
                        <div className="text-center text-slate-700 p-4 space-y-2">
                          <FileText className="w-10 h-10 mx-auto text-rose-600" />
                          <p className="text-xs font-bold text-slate-800">{attachedFile.name}</p>
                        </div>
                      )}
                      
                      {/* Badge overlay */}
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center space-x-1.5 border border-rose-400/40 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        <span>Attached PDF Thumbnail Preview</span>
                      </div>
                    </div>
                  </div>
                ) : (attachedFile.previewUrl || (attachedFile.dataUrl && attachedFile.dataUrl.startsWith('data:image/')) || (attachedFile.type && attachedFile.type.startsWith('image/'))) ? (
                  /* IMAGE THUMBNAIL PREVIEW (PASSPORT, VISA, DOC PHOTOS) */
                  <div className="relative group bg-slate-900 rounded-xl p-3 border-2 border-sky-400 shadow-lg text-white text-left transition-all">
                    {/* Header bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-sky-200 truncate">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {formatBytes(attachedFile.size)} • Photo Attachment Preview
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(attachedFile.previewUrl || attachedFile.dataUrl || null)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Full Image View"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-xs"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image canvas box */}
                    <div className="relative rounded-lg overflow-hidden bg-black/80 border border-slate-800 max-h-56 flex items-center justify-center p-2 group">
                      <img
                        src={attachedFile.previewUrl || attachedFile.dataUrl}
                        alt={attachedFile.name}
                        className="max-h-52 w-auto object-contain rounded shadow-xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                        onClick={() => setPreviewModalUrl(attachedFile.previewUrl || attachedFile.dataUrl || null)}
                      />
                      
                      {/* Badge overlay */}
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center space-x-1.5 border border-white/20 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        <span>Attached Photo Thumbnail (Passport / Visa / ID)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* OTHER FILE PREVIEW (DOCS, TXT) */
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-sky-300 shadow-sm text-left">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatBytes(attachedFile.size)} • {attachedFile.type}
                        </p>
                        <span className="inline-block mt-1 text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold border border-sky-300">
                          File Ready for AES-256 Encryption
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0"
                      title="Remove File"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : (
                <label className="cursor-pointer block space-y-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center border border-sky-200 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Click to browse or drop file (Passport, Visa, PDF, Photo, Doc)
                    </span>
                    <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">
                      Attached photo will display as thumbnail preview
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </label>
              )}
            </div>
          ) : attachmentType === 'facebook' ? (
            <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  Save Facebook Video / Post Link (2. Facebook Link)
                </span>
              </div>
              <input
                type="url"
                placeholder="https://www.facebook.com/watch/?v=... or https://fb.watch/..."
                value={videoUrlInput}
                onChange={e => handleVideoUrlChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />

              {videoPreview && (
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-xs flex items-center space-x-2 text-blue-800 font-bold">
                  <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">
                    Valid Facebook Video Link Detected! Save to Vault.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200">
              <div className="flex items-center space-x-2">
                <Youtube className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">
                  Save YouTube Video Link (3. YouTube Link)
                </span>
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={videoUrlInput}
                onChange={e => handleVideoUrlChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
              />

              {videoPreview && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-xs flex items-center space-x-2 text-rose-800 font-bold">
                    <Youtube className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="truncate">
                      Valid YouTube Video Link Detected! Embed Player ready.
                    </span>
                  </div>

                  {/* YouTube Thumbnail Preview */}
                  {videoPreview.type === 'youtube' && videoPreview.videoId && (
                    <div className="relative rounded-xl overflow-hidden border border-rose-300 shadow-md bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${videoPreview.videoId}/hqdefault.jpg`}
                        alt="YouTube Video Thumbnail"
                        className="w-full h-36 object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                          <Youtube className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold bg-black/75 px-2 py-1 rounded backdrop-blur-xs truncate">
                        YouTube Video Thumbnail Preview
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !subject.trim()}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/40 hover:brightness-110 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <span>Encrypting Payload...</span>
            ) : editingRecord ? (
              <>
                <Save className="w-4 h-4 text-sky-100" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-sky-100" />
                <span>Encrypt & Save to Data Bank</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Lightbox Modal for Full Resolution Image Preview */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-300 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Full Resolution Passport / Visa / Document Preview</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center p-2 bg-black/70 rounded-xl border border-slate-800">
              <img
                src={previewModalUrl}
                alt="Full Attachment Preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal Viewer for Attached PDF File */}
      {showPdfModal && attachedFile && (attachedFile.dataUrl || attachedFile.previewUrl) && (
        <PdfPreviewModal
          title={subject || attachedFile.name}
          pdfUrl={attachedFile.dataUrl || attachedFile.previewUrl!}
          fileName={attachedFile.name}
          fileSize={attachedFile.size}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
