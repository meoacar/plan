import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CollectionManager } from '@/components/collection-manager';

export const metadata = {
  title: 'Koleksiyonlarım',
  description: 'Plan koleksiyonlarınızı yönetin',
};

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CollectionManager />
    </div>
  );
}
