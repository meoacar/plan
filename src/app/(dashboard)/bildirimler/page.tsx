import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationsList } from '@/components/notifications/notifications-list';

export const metadata = {
  title: 'Bildirimler',
  description: 'Tüm bildirimlerinizi görüntüleyin',
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/giris');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
        <p className="mt-2 text-gray-600">Tüm bildirimleriniz</p>
      </div>

      <NotificationsList />
    </div>
  );
}
