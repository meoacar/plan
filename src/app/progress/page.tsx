import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProgressGallery } from '@/components/progress-gallery';

export const metadata = {
  title: 'İlerleme Galerisi',
  description: 'Önce/sonra fotoğraflarınız',
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressGallery userId={session.user.id} isOwner={true} />
    </div>
  );
}
