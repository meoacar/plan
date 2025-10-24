import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';

export const metadata = {
  title: 'Bildirim Ayarları',
  description: 'Bildirim tercihlerinizi yönetin',
};

export default async function NotificationPreferencesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/giris');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bildirim Ayarları</h1>
        <p className="mt-2 text-gray-600">
          Hangi bildirimleri almak istediğinizi seçin
        </p>
      </div>

      <NotificationPreferencesForm />
    </div>
  );
}
