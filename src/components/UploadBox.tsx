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
  Sparkles
} from 'lucide-react';
import { DocumentRecord, CategoryType, EncryptionLevel, Attachment } from '../types';
import { parseVideoUrl, formatBytes } from '../utils/crypto';

interface UploadBoxProps {
  onSaveRecord: (record: Partial<DocumentRecord>) => void;
  editingRecord: DocumentRecord | null;
  onCancelEdit: () => void;
  userPin: string;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onSaveRecord,
  editingRecord,
  onCancelEdit,
  userPin,
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CategoryType>('Identity');
  const [description, setDescription] = useState('');
  const [encryptionLevel, setEncryptionLevel] = useState<EncryptionLevel>('AES-256-GCM');
  const [tagsInput, setTagsInput] = useState('');
  
  // Attachment state
  const [attachmentType, setAttachmentType] = useState<'file' | 'video'>('file');
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPreview, setVideoPreview] = useState<ReturnType<typeof parseVideoUrl>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill if editing record
  useEffect(() => {
    if (editingRecord) {
      setSubject(editingRecord.subject || '');
      setCategory(editingRecord.category || 'Identity');
      setDescription(editingRecord.description || '');
      setEncryptionLevel(editingRecord.encryptionLevel || 'AES-256-GCM');
      setTagsInput(editingRecord.tags ? editingRecord.tags.join(', ') : '');
      
      if (editingRecord.attachment) {
        if (editingRecord.attachment.videoUrl) {
          setAttachmentType('video');
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
      resetForm();
    }
  }, [editingRecord]);

  const resetForm = () => {
    setSubject('');
    setCategory('Identity');
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

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
        previewUrl: file.type.startsWith('image/') ? (reader.result as string) : undefined
      });
    };
    reader.readAsDataURL(file);
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

    // Prepare Attachment
    let finalAttachment: Attachment | undefined = undefined;
    if (attachmentType === 'video' && videoUrlInput.trim()) {
      const parsed = parseVideoUrl(videoUrlInput);
      finalAttachment = {
        name: subject || 'Saved Video Link',
        size: 0,
        type: 'video/link',
        videoUrl: videoUrlInput.trim(),
        videoType: parsed?.type || 'other',
        videoId: parsed?.videoId
      };
    } else if (attachedFile) {
      finalAttachment = attachedFile;
    }

    const recordData: Partial<DocumentRecord> = {
      id: editingRecord ? editingRecord.id : `doc-${Date.now()}`,
      subject: subject.trim(),
      category,
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
    <div id="upload-box-1" className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl overflow-hidden transition-all">
      
      {/* Box 1 Header */}
      <div className="bg-gradient-to-r from-[#4A0427] via-[#5C0632] to-[#70002A] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#36011B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            {editingRecord ? <Save className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg tracking-wide uppercase text-[#F3E5AB]">
              {editingRecord ? 'Edit Encrypted Document' : 'BOX 01: Encrypted Upload & Document Entry'}
            </h2>
            <p className="text-xs text-slate-300">
              AES-256 Hardware Encrypted Entry • PIN Protected Access
            </p>
          </div>
        </div>

        {editingRecord && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center space-x-1 text-xs bg-[#36011B] hover:bg-[#4A0427] text-[#D4AF37] px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 transition-all"
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
        
        {/* Row 1: Subject & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider">
              Subject (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Passport Scan, Qatar Privilege Card, Video Tutorial"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#4A0427] focus:ring-2 focus:ring-[#4A0427]/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as CategoryType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#4A0427] focus:ring-2 focus:ring-[#4A0427]/20 text-sm font-medium bg-slate-50 transition-all"
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
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider">
            Description & Encrypted Payload Details
          </label>
          <textarea
            rows={3}
            placeholder="Enter confidential notes, secret account codes, reference numbers, or video description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#4A0427] focus:ring-2 focus:ring-[#4A0427]/20 text-sm transition-all"
          />
        </div>

        {/* Attachment Toggle (File vs Video Link) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider">
              Attachment / Media Payload
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setAttachmentType('file')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  attachmentType === 'file'
                    ? 'bg-[#4A0427] text-[#F3E5AB] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentType('video')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  attachmentType === 'video'
                    ? 'bg-[#4A0427] text-[#F3E5AB] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube / Facebook Link</span>
              </button>
            </div>
          </div>

          {attachmentType === 'file' ? (
            <div className="border-2 border-dashed border-slate-300 hover:border-[#4A0427] rounded-xl p-4 text-center transition-colors bg-slate-50/60">
              {attachedFile ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3 text-left overflow-hidden">
                    <FileText className="w-6 h-6 text-[#4A0427] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{formatBytes(attachedFile.size)} • {attachedFile.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 rounded hover:bg-rose-50 text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-1">
                  <Upload className="w-6 h-6 text-[#4A0427] mx-auto" />
                  <span className="text-xs font-semibold text-slate-700 block">
                    Click to browse or drop file (PDF, Image, Doc)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    File will be client-side encrypted before storage
                  </span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-2 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">
                  Save YouTube or Facebook Video Link for Later Watch
                </span>
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://www.facebook.com/..."
                value={videoUrlInput}
                onChange={e => handleVideoUrlChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
              />

              {videoPreview && (
                <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-xs flex items-center space-x-2 text-rose-800">
                  {videoPreview.type === 'youtube' ? (
                    <Youtube className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : videoPreview.type === 'facebook' ? (
                    <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Video className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className="truncate">
                    Valid {videoPreview.type.toUpperCase()} Link Detected! Embed Player ready.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Tags & Encryption Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Search Tags (comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. travel, 2026, confidential, pin-2020"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#4A0427] uppercase tracking-wider flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Security Tier</span>
            </label>
            <select
              value={encryptionLevel}
              onChange={e => setEncryptionLevel(e.target.value as EncryptionLevel)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
            >
              <option value="AES-256-GCM">AES-256-GCM Hardware Encryption (PIN 2020 Key)</option>
              <option value="Standard Safe">Standard Storage (Unencrypted Link)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !subject.trim()}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-[#4A0427] via-[#5C0632] to-[#70002A] text-[#F3E5AB] border border-[#D4AF37]/50 hover:brightness-110 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <span>Encrypting Payload...</span>
            ) : editingRecord ? (
              <>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <span>Encrypt & Save to Data Bank</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
