export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-8 rounded-xl mb-8 h-32 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
