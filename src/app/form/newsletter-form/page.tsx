import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Bülten Kayıt | Zayıflama Planım',
  description: 'E-bültenimize abone olun, sağlıklı yaşam ve zayıflama ipuçlarını kaçırmayın.',
};

export default function NewsletterFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📧 E-Bülten Kayıt
            </h1>
            <p className="text-lg text-gray-600">
              Sağlıklı yaşam ve zayıflama ipuçlarını e-postanıza alın
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Adınız Soyadınız
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="ornek@email.com"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="consent" className="ml-2 text-sm text-gray-600">
                E-bülten almayı kabul ediyorum. İstediğim zaman abonelikten çıkabilirim.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Abone Ol
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">E-bültende neler var?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Haftalık sağlıklı tarifler
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Zayıflama ipuçları ve motivasyon
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Egzersiz önerileri
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Özel kampanya ve fırsatlar
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
