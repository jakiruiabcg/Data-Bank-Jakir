import React from 'react';
import { FileText, X, Download, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/crypto';

interface PdfPreviewModalProps {
  title: string;
  pdfUrl: string;
  fileName: string;
  fileSize?: number;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  title,
  pdfUrl,
  fileName,
  fileSize,
  onClose,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-rose-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#4A0427] px-5 py-3.5 border-b border-rose-500/30 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  PDF Document
                </span>
                <h3 className="font-serif font-bold text-base text-white truncate">
                  {title || fileName}
                </h3>
              </div>
              <p className="text-xs text-rose-200/90 truncate font-mono mt-0.5">
                {fileName} {fileSize ? `(${formatBytes(fileSize)})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5"
              title="Print PDF"
            >
              <Printer className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-600 text-white transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame Display */}
        <div className="p-3 bg-slate-950 flex-1 overflow-hidden min-h-[60vh] flex flex-col items-center justify-center relative">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&view=FitH`}
              title={fileName}
              className="w-full h-full min-h-[65vh] rounded-xl border border-slate-800 bg-white shadow-inner"
            />
          ) : (
            <div className="text-center p-8 text-rose-300 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-rose-500" />
              <p className="font-bold">PDF Document Preview Unavailable</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Client-Side Verified PDF Viewer</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
