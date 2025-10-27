import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yeme Günahı İtiraf Duvarı | Zayıflama Planım',
  description: 'Yeme günahlarını anonim olarak paylaş, AI\'dan esprili yanıtlar al, toplulukla bağ kur!',
};

export default function ConfessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
