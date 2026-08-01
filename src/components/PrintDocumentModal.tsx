import React from 'react';
import { Printer, X, ShieldCheck, Lock, Calendar, Tag, CheckCircle2 } from 'lucide-react';
import { DocumentRecord } from '../types';

interface PrintDocumentModalProps {
  record: DocumentRecord;
  decryptedText?: string;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  record,
  decryptedText,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const textToDisplay = decryptedText || record.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Card */}
      <div className="w-full max-w-3xl bg-white border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Screen Action Bar (Hidden in Print) */}
        <div className="bg-[#4A0427] px-6 py-4 border-b border-[#D4AF37]/40 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif font-bold text-sm text-[#F3E5AB] uppercase tracking-wider">
              Printable PDF Document Preview
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#4A0427] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#36011B] hover:bg-[#70002A] text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate / Document Voucher Area (Targeted by @media print) */}
        <div id="printable-voucher" className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 font-sans">
          
          {/* Header Banner */}
          <div className="border-b-2 border-[#4A0427] pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-widest text-[#4A0427] uppercase">
                  Personal Data Bank
                </span>
                <span className="bg-[#4A0427] text-[#D4AF37] text-xs font-bold px-2.5 py-1 rounded uppercase">
                  Akter
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Official Encrypted Document Record Voucher • Qatar Airways Inspired Vault
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 border border-amber-300 rounded-md text-[11px] font-bold text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{record.encryptionLevel}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                REF: {record.id.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Document Subject & Metadata Grid */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#4A0427] tracking-wider block">
                  Document Category
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {record.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#4A0427] tracking-wider block">
                  Date Encrypted
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {new Date(record.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#4A0427] tracking-wider block">
                  Security Status
                </span>
                <span className="text-sm font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PIN 2020 Verified</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-[#4A0427] tracking-wider block">
                Subject (Title)
              </span>
              <h1 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                {record.subject}
              </h1>
            </div>
          </div>

          {/* Decrypted Text Body */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#4A0427] uppercase tracking-wider border-b border-slate-200 pb-1">
              Encrypted Payload & Confidential Description
            </h4>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
              {textToDisplay}
            </div>
          </div>

          {/* Attachment Info */}
          {record.attachment && (
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1 text-xs">
              <span className="font-bold text-amber-900 uppercase text-[10px] block">
                Attachment Reference
              </span>
              <p className="font-medium text-slate-800">
                {record.attachment.name} ({record.attachment.type})
              </p>
              {record.attachment.videoUrl && (
                <p className="font-mono text-[11px] text-blue-700 underline truncate">
                  {record.attachment.videoUrl}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
            <div className="flex items-center space-x-2 pt-2">
              <Tag className="w-3.5 h-3.5 text-[#4A0427]" />
              <span className="text-xs font-semibold text-slate-500">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {record.tags.map(t => (
                  <span key={t} className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certificate Footer Verification Stamp */}
          <div className="pt-8 border-t-2 border-[#4A0427] flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div>
              <p className="font-bold text-slate-800">Personal Data Bank (Akter)</p>
              <p>Hardware Cryptography • PIN 2020 Master Key</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-[#4A0427]">VERIFIED AUDIT SEAL</p>
              <p>Printed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
