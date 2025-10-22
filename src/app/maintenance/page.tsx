/**
 * Bakım Modu Sayfası
 * Bakım modu aktifken admin olmayan kullanıcılara gösterilir
 * Requirements: 3.8
 */
export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Mesh Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }} />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Icon with Animation */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-3xl mb-6 relative group">
            {/* Rotating Ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-yellow-500/30 animate-spin-slow" />
            
            {/* Tools Icon */}
            <svg
              className="w-16 h-16 text-yellow-400 relative z-10 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-3xl bg-yellow-500/20 animate-ping [animation-duration:3s]" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-yellow-400 text-sm font-semibold">Bakım Çalışması Devam Ediyor</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 mb-6 leading-tight animate-gradient">
          Sistemimizi Güncelliyoruz
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
          Daha iyi bir deneyim sunabilmek için sistemimizde iyileştirmeler yapıyoruz.
        </p>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Ne Zaman Geri Döneceğiz?</h3>
              <p className="text-gray-400">
                Bakım çalışmamız kısa sürede tamamlanacak. Lütfen birkaç dakika sonra tekrar deneyin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Neler Yapıyoruz?</h3>
              <p className="text-gray-400">
                Performans iyileştirmeleri, yeni özellikler ve güvenlik güncellemeleri ekliyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
          <p className="text-gray-400 mb-3">Acil bir durumunuz mu var?</p>
          <a
            href="mailto:info@zayiflamaplanim.com"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@zayiflamaplanim.com
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-gray-500 text-sm mt-8">
          Anlayışınız için teşekkür ederiz 🙏
        </p>
      </div>
    </div>
  )
}
