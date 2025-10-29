// src/app/partnerships/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, UserPlus, Clock } from 'lucide-react';
import PartnershipActions from '@/components/partnerships/PartnershipActions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Hesap Verebilirlik Partnerleri',
  description: 'Partnerlerinizi yönetin ve yeni partnerler bulun',
};

type Partnership = {
  id: string;
  status: string;
  requesterId: string;
  partnerId: string;
  message: string | null;
  createdAt: Date;
  requester: {
    id: string;
    name: string | null;
    image: string | null;
    startWeight: number | null;
    goalWeight: number | null;
    streak: number;
  };
  partner: {
    id: string;
    name: string | null;
    image: string | null;
    startWeight: number | null;
    goalWeight: number | null;
    streak: number;
  };
  _count: {
    messages: number;
    sharedGoals: number;
  };
};

async function getPartnerships(userId: string): Promise<Partnership[]> {
  const partnerships = await prisma.accountabilityPartnership.findMany({
    where: {
      OR: [{ requesterId: userId }, { partnerId: userId }],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          image: true,
          startWeight: true,
          goalWeight: true,
          streak: true,
        },
      },
      partner: {
        select: {
          id: true,
          name: true,
          image: true,
          startWeight: true,
          goalWeight: true,
          streak: true,
        },
      },
      _count: {
        select: {
          messages: true,
          sharedGoals: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return partnerships as Partnership[];
}

export default async function PartnershipsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  console.log('Partnerships page - Current user:', { id: session.user.id, name: session.user.name, email: session.user.email });

  const partnerships = await getPartnerships(session.user.id);
  
  console.log('Partnerships found:', partnerships.length, partnerships.map(p => ({ 
    id: p.id, 
    status: p.status, 
    requester: p.requester.name, 
    partner: p.partner.name 
  })));

  const activePartnerships = partnerships.filter((p: Partnership) => p.status === 'ACTIVE');
  const pendingRequests = partnerships.filter(
    (p: Partnership) => p.status === 'PENDING' && p.partnerId === session.user.id
  );
  const sentRequests = partnerships.filter(
    (p: Partnership) => p.status === 'PENDING' && p.requesterId === session.user.id
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hesap Verebilirlik Partnerleri</h1>
        <p className="text-gray-600">
          Partnerlerinizle birlikte hedeflerinize ulaşın
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Partnerler</p>
              <p className="text-3xl font-bold text-green-600">
                {activePartnerships.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Talepler</p>
              <p className="text-3xl font-bold text-orange-600">
                {pendingRequests.length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gönderilen Talepler</p>
              <p className="text-3xl font-bold text-blue-600">
                {sentRequests.length}
              </p>
            </div>
            <UserPlus className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Yeni Partner Bul */}
      <div className="mb-8">
        <Link
          href="/partnerships/find"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          Yeni Partner Bul
        </Link>
      </div>

      {/* Bekleyen Talepler */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bekleyen Talepler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((partnership: Partnership) => {
              const partner = partnership.requester;
              return (
                <div key={partnership.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={partner.image || '/default-avatar.png'}
                      alt={partner.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      <p className="text-sm text-gray-600">
                        {partner.startWeight}kg → {partner.goalWeight}kg
                      </p>
                      {partnership.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{partnership.message}"
                        </p>
                      )}
                      <PartnershipActions partnershipId={partnership.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aktif Partnerler */}
      {activePartnerships.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Aktif Partnerler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePartnerships.map((partnership: Partnership) => {
              const partner =
                partnership.requesterId === session.user.id
                  ? partnership.partner
                  : partnership.requester;
              return (
                <Link
                  key={partnership.id}
                  href={`/partnerships/${partnership.id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={partner.image || '/default-avatar.png'}
                      alt={partner.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      <p className="text-sm text-gray-600">
                        {partner.startWeight}kg → {partner.goalWeight}kg
                      </p>
                      <p className="text-sm text-orange-600">
                        🔥 {partner.streak} gün streak
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{partnership._count.messages} mesaj</span>
                    <span>{partnership._count.sharedGoals} ortak hedef</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Gönderilen Talepler */}
      {sentRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Gönderilen Talepler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sentRequests.map((partnership: Partnership) => {
              const partner = partnership.partner;
              return (
                <div key={partnership.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={partner.image || '/default-avatar.png'}
                      alt={partner.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      <p className="text-sm text-gray-600">
                        {partner.startWeight}kg → {partner.goalWeight}kg
                      </p>
                      <p className="text-sm text-orange-600 mt-1">
                        Beklemede...
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {partnerships.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Henüz partneriniz yok</h3>
          <p className="text-gray-600 mb-6">
            Hedeflerinize birlikte ulaşmak için bir partner bulun
          </p>
          <Link
            href="/partnerships/find"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <UserPlus className="w-5 h-5" />
            Partner Bul
          </Link>
        </div>
      )}
    </div>
  );
}
