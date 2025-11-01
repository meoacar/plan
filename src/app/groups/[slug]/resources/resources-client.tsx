'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ResourceUploadForm from '@/components/groups/resources/resource-upload-form';

interface ResourcesClientProps {
  groupId: string;
}

export default function ResourcesClient({ groupId }: ResourcesClientProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUploadForm(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        <Plus className="w-5 h-5" />
        Kaynak Ekle
      </button>

      {showUploadForm && (
        <ResourceUploadForm
          groupId={groupId}
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </>
  );
}
