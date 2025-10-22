export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#2d7a4a] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Yükleniyor...</h2>
        <p className="text-gray-600">Lütfen bekleyin</p>
      </div>
    </div>
  )
}
