'use client';

import { Download } from 'lucide-react';

interface PdfExportButtonProps {
  slug: string;
  title: string;
}

export function PdfExportButton({ slug, title }: PdfExportButtonProps) {
  const handleExport = () => {
    // Open in new window for print
    const url = `/plan/${slug}/pdf`;
    const win = window.open(url, '_blank');
    
    // Wait for load then trigger print dialog
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
      title="PDF olarak indir"
    >
      <Download size={20} />
      <span className="hidden sm:inline">PDF İndir</span>
    </button>
  );
}
