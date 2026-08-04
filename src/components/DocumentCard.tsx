import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Printer, 
  Edit3, 
  Trash2, 
  Youtube, 
  Facebook, 
  Video, 
  FileText, 
  Paperclip, 
  Tag, 
  Calendar, 
  ShieldCheck, 
  Play,
  ExternalLink,
  Star,
  Download,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { DocumentRecord } from '../types';
import { decryptData, formatBytes } from '../utils/crypto';
import { downloadRecord } from '../utils/download';

interface DocumentCardProps {
  record: DocumentRecord;
  userPin: string;
  onEdit: (record: DocumentRecord) => void;
  onDelete: (id: string) => void;
  onPrint: (record: DocumentRecord) => void;
  onWatchVideo: (videoUrl: string, title: string, desc: string) => void;
  onToggleStar?: (id: string) => void;
  onOpenPdfModal?: (url: string, title: string, fileName: string, fileSize?: number) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  record,
  userPin,
  onEdit,
  onDelete,
  onPrint,
  onWatchVideo,
  onToggleStar,
  onOpenPdfModal,
}) => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');

  const handleToggleDecrypt = async () => {
    if (isDecrypted) {
      setIsDecrypted(false);
      setDecryptedText('');
      return;
    }

    setIsDecrypting(true);
    setDecryptError('');

    try {
      if (record.encryptedContent) {
        const decrypted = await decryptData(record.encryptedContent, userPin);
        setDecryptedText(decrypted);
      } else {
        setDecryptedText(record.description);
      }
      setIsDecrypted(true);
    } catch (err) {
      setDecryptError('Decryption error. Invalid PIN key.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const isVideo = record.attachment && record.attachment.videoUrl;

  // Attachment type detection
  const att = record.attachment;
  const isPdf = !!att && (
    att.type === 'application/pdf' ||
    att.name.toLowerCase().endsWith('.pdf') ||
    (!!att.dataUrl && att.dataUrl.startsWith('data:application/pdf'))
  );
  const isImage = !!att && !isPdf && (
    (!!att.type && att.type.startsWith('image/')) ||
    (!!att.dataUrl && att.dataUrl.startsWith('data:image/')) ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(att.name)
  );

  const pdfTargetUrl = att?.dataUrl || (att?.type === 'application/pdf' ? att.previewUrl : undefined);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-[#D4AF37] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner & Status Header */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-start justify-between gap-2">
        
        <div className="flex flex-wrap items-center gap-1.5 truncate">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#4A0427] text-[#F3E5AB] border border-[#D4AF37]/30 shadow-xs shrink-0">
            {record.category}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-950 border border-sky-300 shrink-0 flex items-center space-x-1">
            <span>👤</span>
            <span>{record.member || 'Jakir'}</span>
          </span>

          {record.isEncrypted ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>AES-256</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Standard</span>
            </span>
          )}
        </div>

        {/* Star Button */}
        {onToggleStar && (
          <button
            onClick={() => onToggleStar(record.id)}
            className="text-slate-300 hover:text-amber-400 transition-colors p-1"
            title="Bookmark Item"
          >
            <Star className={`w-4 h-4 ${record.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Card Content */}
      <div className="p-5 space-y-3 flex-1">
        
        {/* Subject */}
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#4A0427] transition-colors line-clamp-2">
            {record.subject}
          </h3>
          <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Updated: {new Date(record.updatedAt).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Video Attachment Banner */}
        {isVideo && (
          <div className="p-3 bg-gradient-to-r from-rose-900 to-[#4A0427] rounded-xl text-white shadow-inner flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              {record.attachment?.videoType === 'youtube' ? (
                <Youtube className="w-6 h-6 text-rose-400 shrink-0" />
              ) : record.attachment?.videoType === 'facebook' ? (
                <Facebook className="w-6 h-6 text-blue-400 shrink-0" />
              ) : (
                <Video className="w-6 h-6 text-[#D4AF37] shrink-0" />
              )}
              <div className="truncate text-left">
                <p className="text-xs font-bold text-[#F3E5AB] truncate">
                  {record.attachment?.videoType === 'youtube' ? 'YouTube Saved Video' : 'Facebook Saved Video'}
                </p>
                <p className="text-[10px] text-slate-200 truncate font-mono">
                  {record.attachment?.videoUrl}
                </p>
              </div>
            </div>

            <button
              onClick={() => onWatchVideo(
                record.attachment!.videoUrl!, 
                record.subject, 
                record.description
              )}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C5A059] text-[#4A0427] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shrink-0 transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-[#4A0427]" />
              <span>Watch</span>
            </button>
          </div>
        )}

        {/* File Attachment Banner (Image or PDF Thumbnail) */}
        {record.attachment && !isVideo && (
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {isPdf ? (
              /* PDF THUMBNAIL CARD PREVIEW */
              <div className="relative group bg-slate-900 border border-rose-950/40 rounded-xl overflow-hidden shadow-sm">
                {pdfTargetUrl && pdfTargetUrl.startsWith('data:application/pdf') ? (
                  <iframe
                    src={`${pdfTargetUrl}#toolbar=0&navpanes=0&view=FitH`}
                    title={record.attachment.name}
                    className="w-full h-40 pointer-events-none bg-white opacity-90 group-hover:opacity-100 transition-opacity border-b border-rose-900/30"
                  />
                ) : record.attachment.previewUrl ? (
                  <div className="relative max-h-40 overflow-hidden bg-slate-900 flex items-center justify-center p-1">
                    <img
                      src={record.attachment.previewUrl}
                      alt={record.attachment.name}
                      className="max-h-36 w-auto object-contain rounded shadow-sm opacity-90 group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="truncate text-left">
                      <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        PDF Document
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-1">{record.attachment.name}</p>
                      {record.attachment.size > 0 && (
                        <p className="text-[10px] text-rose-200 font-mono mt-0.5">{formatBytes(record.attachment.size)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* PDF Badge & Action Bar Overlay */}
                <div className="bg-slate-900/90 border-t border-rose-900/50 p-2 flex items-center justify-between text-white text-[10px] font-bold">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[9px] uppercase tracking-wider shrink-0">
                      📄 PDF
                    </span>
                    <span className="truncate max-w-[130px] text-slate-200 font-medium">{record.attachment.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const urlToOpen = pdfTargetUrl || record.attachment?.previewUrl;
                      if (urlToOpen && onOpenPdfModal) {
                        onOpenPdfModal(urlToOpen, record.subject, record.attachment!.name, record.attachment!.size);
                      } else if (onOpenPdfModal && record.attachment?.dataUrl) {
                        onOpenPdfModal(record.attachment.dataUrl, record.subject, record.attachment.name, record.attachment.size);
                      } else {
                        onPrint(record);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center space-x-1 shrink-0 transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View PDF</span>
                  </button>
                </div>
              </div>
            ) : isImage && (record.attachment.previewUrl || record.attachment.dataUrl) ? (
              /* IMAGE THUMBNAIL PREVIEW */
              <div className="relative group bg-slate-900 flex items-center justify-center p-2 max-h-48">
                <img
                  src={record.attachment.previewUrl || record.attachment.dataUrl}
                  alt={record.attachment.name}
                  className="max-h-44 w-auto object-contain rounded shadow-sm transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center space-x-1 border border-white/20">
                  <Paperclip className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[150px]">{record.attachment.name}</span>
                </div>
              </div>
            ) : (
              /* OTHER FILE ATTACHMENT */
              <div className="p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-[#4A0427] shrink-0" />
                  <span className="truncate font-medium text-slate-700">{record.attachment.name}</span>
                </div>
                {record.attachment.size > 0 && (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{formatBytes(record.attachment.size)}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description Body / Decrypted View */}
        <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 min-h-[60px]">
          {record.isEncrypted && !isDecrypted ? (
            <div className="flex flex-col items-center justify-center py-2 text-slate-400 space-y-1 text-center">
              <Lock className="w-5 h-5 text-amber-600" />
              <p className="text-[11px] font-semibold text-slate-500">
                Encrypted Data Payload (AES-256)
              </p>
              <p className="text-[9px] text-slate-400">Click decrypt button to view plain text</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed font-sans">
              {decryptedText || record.description}
            </p>
          )}

          {decryptError && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{decryptError}</p>
          )}
        </div>

        {/* Tags Chips */}
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {record.tags.map(t => (
              <span key={t} className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Tag className="w-2.5 h-2.5 text-[#4A0427]" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
        
        {/* Decrypt Toggle Button */}
        {record.isEncrypted ? (
          <button
            onClick={handleToggleDecrypt}
            disabled={isDecrypting}
            className="px-3 py-1.5 rounded-lg bg-[#4A0427] hover:bg-[#70002A] text-[#F3E5AB] font-bold text-xs transition-all flex items-center space-x-1 shadow-sm"
          >
            {isDecrypted ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isDecrypting ? 'Decrypting...' : 'Decrypt'}</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
            Unlocked Item
          </div>
        )}

        {/* Secondary Buttons: Download, Print PDF, Edit, Delete */}
        <div className="flex items-center space-x-1">
          {/* Download Record Button */}
          <button
            onClick={() => downloadRecord(record, isDecrypted ? decryptedText : undefined)}
            title="Download Record & Details"
            className="p-1.5 rounded-lg bg-[#4A0427] hover:bg-[#70002A] text-[#F3E5AB] border border-[#D4AF37]/30 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* Printable in PDF format */}
          <button
            onClick={() => onPrint(record)}
            title="Printable in PDF format"
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#4A0427]" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(record)}
            title="Edit Document"
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-blue-700" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${record.subject}"?`)) {
                onDelete(record.id);
              }
            }}
            title="Delete Record"
            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
