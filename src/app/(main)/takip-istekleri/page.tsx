import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FollowRequests from '@/components/follow-requests';

export const metadata: Metadata = {
  title: 'Takip İstekleri | Zayıflama Planım',
  description: 'Bekleyen takip isteklerinizi görüntüleyin ve yönetin',
};

export default async function FollowRequestsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/giris');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <FollowRequests />
      </div>
    </div>
  );
}
