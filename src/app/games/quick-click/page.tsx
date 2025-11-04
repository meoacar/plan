import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import QuickClickGamePage from './QuickClickGamePage';

export const metadata: Metadata = {
  title: 'Hızlı Tıklama Oyunu | Zayıflama Planım',
  description: 'Sağlıklı yiyecekleri hızlıca seçerek reflekslerinizi test edin ve coin kazanın!',
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/games/quick-click');
  }

  return <QuickClickGamePage />;
}
