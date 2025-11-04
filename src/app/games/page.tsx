import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import GamesPage from './GamesPage';

export const metadata: Metadata = {
  title: 'Mini Oyunlar | Zayıflama Planım',
  description: 'Eğlenceli mini oyunlar oynayarak coin kazanın ve bilginizi test edin!',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/games');
  }

  return <GamesPage />;
}
