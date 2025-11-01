'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Video, 
  FileText, 
  Dumbbell, 
  Link as LinkIcon, 
  BookOpen, 
  ChefHat,
  Eye,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
// Toast removed - using alert instead

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string | null;
    resourceType: string;
    url: string | null;
    fileUrl: string | null;
    category: string;
    tags: string[];
    views: number;
    createdAt: Date;
    uploader: {
      id: string;
      name: string;
      image: string | null;
      username: string | null;
    };
  };
  groupId: string;
  groupSlug: string;
  currentUserId: string;
  userRole?: string;
  onDelete?: () => void;
}

const resourceTypeConfig = {
  VIDEO: { label: 'Video', icon: Video, color: 'bg-red-100 text-red-700' },
  RECIPE: { label: 'Tarif', icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
  EXERCISE: { label: 'Egzersiz', icon: Dumbbell, color: 'bg-green-100 text-green-700' },
  PDF: { label: 'PDF', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  ARTICLE: { label: 'Makale', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
  LINK: { label: 'Link', icon: LinkIcon, color: 'bg-gray-100 text-gray-700' },
};

const categoryColors: Record<string, string> = {
  'egzersiz': 'bg-green-50 text-green-700 border-green-200',
  'beslenme': 'bg-orange-50 text-orange-700 border-orange-200',
  'motivasyon': 'bg-purple-50 text-purple-700 border-purple-200',
  'genel': 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function ResourceCard({ 
  resource, 
  groupId, 
  groupSlug, 
  currentUserId,
  userRole,
  onDelete 
}: ResourceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const typeConfig = resourceTypeConfig[resource.resourceType as keyof typeof resourceTypeConfig] || resourceTypeConfig.LINK;
  const TypeIcon = typeConfig.icon;

  const canDelete = 
    userRole === 'ADMIN' || 
    userRole === 'MODERATOR' || 
    resource.uploader.id === currentUserId;

  const handleDelete = async () => {
    if (!confirm('Bu kaynağı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/resources/${resource.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kaynak silinemedi');
      }

      alert('Kaynak başarıyla silindi');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Kaynak silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.color}`}>
                <TypeIcon className="w-3 h-3" />
                {typeConfig.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[resource.category.toLowerCase()] || categoryColors.genel}`}>
                {resource.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{resource.description}</p>
            )}
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Kaynağı sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{resource.views} görüntülenme</span>
          </div>
          <span>•</span>
          <span>{format(new Date(resource.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
        </div>

        {/* Uploader */}
        <Link
          href={`/profile/${resource.uploader.username || resource.uploader.id}`}
          className="flex items-center gap-2 mb-4 group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
            {resource.uploader.image ? (
              <Image
                src={resource.uploader.image}
                alt={resource.uploader.name}
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {resource.uploader.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
            {resource.uploader.name} tarafından eklendi
          </span>
        </Link>

        {/* Action Button */}
        {(resource.url || resource.fileUrl) && (
          <button
            onClick={handleView}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Kaynağı Görüntüle
          </button>
        )}
      </div>
    </div>
  );
}
