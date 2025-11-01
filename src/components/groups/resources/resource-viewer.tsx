'use client';

import { X, ExternalLink } from 'lucide-react';

interface ResourceViewerProps {
  resource: {
    id: string;
    title: string;
    description: string | null;
    resourceType: string;
    url: string | null;
    fileUrl: string | null;
    content: string | null;
  };
  onClose: () => void;
}

export default function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  const renderContent = () => {
    // If it's a video URL (YouTube, Vimeo, etc.)
    if (resource.url && resource.resourceType === 'VIDEO') {
      // YouTube embed
      if (resource.url.includes('youtube.com') || resource.url.includes('youtu.be')) {
        let videoId = '';
        if (resource.url.includes('youtube.com')) {
          const urlParams = new URLSearchParams(new URL(resource.url).search);
          videoId = urlParams.get('v') || '';
        } else {
          videoId = resource.url.split('/').pop() || '';
        }
        
        if (videoId) {
          return (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
      }
      
      // Vimeo embed
      if (resource.url.includes('vimeo.com')) {
        const videoId = resource.url.split('/').pop();
        if (videoId) {
          return (
            <div className="aspect-video w-full">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                className="w-full h-full rounded-lg"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
      }
    }

    // If it's a PDF
    if (resource.fileUrl && resource.resourceType === 'PDF') {
      return (
        <div className="w-full h-[600px]">
          <iframe
            src={resource.fileUrl}
            className="w-full h-full rounded-lg border border-gray-200"
            title={resource.title}
          />
        </div>
      );
    }

    // If it has text content
    if (resource.content) {
      return (
        <div className="prose prose-purple max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {resource.content}
          </div>
        </div>
      );
    }

    // Default: show link
    if (resource.url || resource.fileUrl) {
      const link = resource.url || resource.fileUrl;
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            Bu kaynak harici bir bağlantıda bulunuyor.
          </p>
          <a
            href={link!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Kaynağı Aç
          </a>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-600">İçerik görüntülenemiyor.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{resource.title}</h2>
            {resource.description && (
              <p className="text-gray-600 text-sm">{resource.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
