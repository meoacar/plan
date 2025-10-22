'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Linkedin, Link2, Check, X } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Paylaşım hatası:', err);
        }
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
        aria-label="Planı paylaş"
      >
        <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        <span>Paylaş</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-200">
            <div className="relative mx-4 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-2xl">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30" />
              
              {/* Content */}
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Share2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Paylaş</h3>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Kapat"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-[#1DA1F2] hover:bg-gray-800 transition-all"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="w-12 h-12 bg-[#1DA1F2]/20 rounded-xl flex items-center justify-center group-hover:bg-[#1DA1F2]/30 transition-colors">
                      <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">Twitter</div>
                      <div className="text-sm text-gray-400">Tweet olarak paylaş</div>
                    </div>
                  </a>

                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-[#1877F2] hover:bg-gray-800 transition-all"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="w-12 h-12 bg-[#1877F2]/20 rounded-xl flex items-center justify-center group-hover:bg-[#1877F2]/30 transition-colors">
                      <Facebook className="h-6 w-6 text-[#1877F2]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">Facebook</div>
                      <div className="text-sm text-gray-400">Arkadaşlarınla paylaş</div>
                    </div>
                  </a>

                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-[#25D366] hover:bg-gray-800 transition-all"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="w-12 h-12 bg-[#25D366]/20 rounded-xl flex items-center justify-center group-hover:bg-[#25D366]/30 transition-colors">
                      <MessageCircle className="h-6 w-6 text-[#25D366]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">WhatsApp</div>
                      <div className="text-sm text-gray-400">Mesaj olarak gönder</div>
                    </div>
                  </a>

                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-[#0A66C2] hover:bg-gray-800 transition-all"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="w-12 h-12 bg-[#0A66C2]/20 rounded-xl flex items-center justify-center group-hover:bg-[#0A66C2]/30 transition-colors">
                      <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">LinkedIn</div>
                      <div className="text-sm text-gray-400">Profesyonel ağınla paylaş</div>
                    </div>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="group flex w-full items-center gap-4 rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-gray-800 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      copied 
                        ? 'bg-green-500/20' 
                        : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                    }`}>
                      {copied ? (
                        <Check className="h-6 w-6 text-green-500" />
                      ) : (
                        <Link2 className="h-6 w-6 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-bold ${copied ? 'text-green-500' : 'text-white'}`}>
                        {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {copied ? 'Link panoya kopyalandı' : 'Bağlantıyı kopyala'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
