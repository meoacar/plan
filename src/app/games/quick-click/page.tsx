import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import QuickClickGamePage from './QuickClickGamePage';

export const metadata: Metadata = {
  title: 'Hızlı Tıklama Oyunu | Zayıflama Planım',
  description: 'Sağlıklı yiyecekleri hızlıca seçerek reflekslerinizi test edin ve coin kazanın!',
};

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/games/quick-click');
  }

  return <QuickClickGamePage />;
}
