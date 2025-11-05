import { Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <Wifi className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          İnternet Bağlantısı Yok
        </h1>
        
        <p className="mb-8 text-lg text-gray-600">
          İnternet bağlantınızı kontrol edin ve tekrar deneyin.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
        >
          <RefreshCw className="h-5 w-5" />
          Yeniden Dene
        </button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Bazı özellikler çevrimdışı modda kullanılamayabilir.</p>
        </div>
      </div>
    </div>
  );
}
