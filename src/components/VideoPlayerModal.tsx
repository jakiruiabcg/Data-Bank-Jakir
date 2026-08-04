import React from 'react';
import { X, Youtube, Facebook, Video, ExternalLink, ShieldCheck } from 'lucide-react';
import { parseVideoUrl } from '../utils/crypto';

interface VideoPlayerModalProps {
  videoUrl: string;
  title: string;
  description: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  videoUrl,
  title,
  description,
  onClose,
}) => {
  const parsed = parseVideoUrl(videoUrl);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-4xl bg-[#4A0427] border-2 border-[#D4AF37] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#70002A] via-[#5C0632] to-[#36011B] px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {parsed?.type === 'youtube' ? (
              <Youtube className="w-6 h-6 text-rose-500 shrink-0" />
            ) : parsed?.type === 'facebook' ? (
              <Facebook className="w-6 h-6 text-blue-400 shrink-0" />
            ) : (
              <Video className="w-6 h-6 text-[#D4AF37] shrink-0" />
            )}
            <div className="truncate">
              <h3 className="font-serif font-bold text-lg text-[#F3E5AB] truncate">
                {title || 'Saved Video Watchroom'}
              </h3>
              <p className="text-xs text-slate-300 font-mono truncate">
                {videoUrl}
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

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {parsed && parsed.embedUrl ? (
            <iframe
              src={parsed.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <Video className="w-12 h-12 text-[#D4AF37] mx-auto opacity-80" />
              <p className="text-sm font-semibold text-slate-200">
                Direct embed preview unavailable for this URL.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] text-[#4A0427] font-bold text-xs rounded-xl shadow hover:brightness-110 transition-all"
              >
                <span>Open Video in New Tab</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Video Notes & Info Footer */}
        <div className="p-5 bg-[#36011B] space-y-2 border-t border-[#D4AF37]/30 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Data Bank • Jakir Vault Saved Item</span>
            </span>

            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#E2C376] hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>Original Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {description && (
            <p className="text-xs text-slate-200 leading-relaxed bg-[#4A0427]/60 p-3 rounded-xl border border-[#D4AF37]/20">
              {description}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
