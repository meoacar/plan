import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, XCircle, Home, Users, ArrowRight } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

async function getGroup(id: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!group) {
    return null;
  }

  // Sadece grup sahibi görebilir
  if (group.createdBy !== userId) {
    return null;
  }

  return group;
}

export default async function GroupPendingPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const group = await getGroup(params.id, session.user.id);

  if (!group) {
    notFound();
  }

  // Eğer grup onaylandıysa, grup sayfasına yönlendir
  if (group.status === 'APPROVED') {
    redirect(`/groups/${group.slug}`);
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      title: 'Onay Bekleniyor',
      description: 'Grubunuz admin onayı için inceleniyor',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      gradient: 'from-yellow-500 to-orange-500',
    },
    APPROVED: {
      icon: CheckCircle,
      title: 'Onaylandı',
      description: 'Grubunuz onaylandı ve yayında',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      gradient: 'from-green-500 to-emerald-500',
    },
    REJECTED: {
      icon: XCircle,
      title: 'Reddedildi',
      description: 'Grubunuz onaylanmadı',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      gradient: 'from-red-500 to-pink-500',
    },
  };

  const config = statusConfig[group.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${config.gradient} p-8 text-white text-center`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <StatusIcon className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
            <p className="text-white/90 text-lg">{config.description}</p>
          </div>

          {/* Group Info */}
          <div className="p-8">
            <div className="flex items-start gap-6 mb-8">
              {group.imageUrl ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src={group.imageUrl}
                    alt={group.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-16 h-16 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>
                <p className="text-gray-600 mb-4">{group.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    {group._count.members} üye
                  </span>
                  {group.isPrivate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      🔒 Özel Grup
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Details */}
            {group.status === 'PENDING' && (
              <div className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 mb-6`}>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${config.color}`} />
                  Onay Süreci Hakkında
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Grubunuz kalite kontrolü için admin ekibimiz tarafından inceleniyor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Onay süreci genellikle 24 saat içinde tamamlanır</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Onaylandığında size bildirim gönderilecektir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Bu sayfayı kapatabilirsiniz, durum değiştiğinde haberdar edileceksiniz</span>
                  </li>
                </ul>
              </div>
            )}

            {group.status === 'REJECTED' && group.rejectionReason && (
              <div className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 mb-6`}>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className={`w-5 h-5 ${config.color}`} />
                  Ret Nedeni
                </h3>
                <p className="text-gray-700">{group.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/groups"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Users className="w-5 h-5" />
                Diğer Grupları Keşfet
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                <Home className="w-5 h-5" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            💡 İpucu
          </h3>
          <p className="text-gray-700">
            Grubunuzun daha hızlı onaylanması için açıklayıcı bir isim ve detaylı bir açıklama kullandığınızdan emin olun. 
            Topluluk kurallarına uygun içerik paylaşımı yapmanız önemlidir.
          </p>
        </div>
      </div>
    </div>
  );
}
