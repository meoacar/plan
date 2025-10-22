// src/app/partnerships/[id]/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PartnershipDashboard from '@/components/partnerships/PartnershipDashboard';

async function getPartnership(id: string, userId: string) {
  const partnership = await prisma.accountabilityPartnership.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          startWeight: true,
          goalWeight: true,
          streak: true,
          level: true,
          xp: true,
        },
      },
      partner: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          startWeight: true,
          goalWeight: true,
          streak: true,
          level: true,
          xp: true,
        },
      },
      sharedGoals: {
        orderBy: [{ completed: 'asc' }, { targetDate: 'asc' }],
      },
    },
  });

  if (!partnership) {
    return null;
  }

  // Sadece ilgili kullanıcılar görebilir
  if (partnership.requesterId !== userId && partnership.partnerId !== userId) {
    return null;
  }

  return partnership;
}

async function getPartnerCheckIns(partnerId: string) {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: partnerId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return checkIns;
}

async function getWeightLogs(userId: string) {
  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 30,
  });

  return logs;
}

export default async function PartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const partnership = await getPartnership(id, session.user.id);

  if (!partnership) {
    notFound();
  }

  const partner =
    partnership.requesterId === session.user.id
      ? partnership.partner
      : partnership.requester;

  const currentUser =
    partnership.requesterId === session.user.id
      ? partnership.requester
      : partnership.partner;

  const partnerCheckIns = await getPartnerCheckIns(partner.id);
  const currentUserWeightLogs = await getWeightLogs(session.user.id);
  const partnerWeightLogs = await getWeightLogs(partner.id);

  return (
    <PartnershipDashboard
      partnership={partnership}
      partner={partner}
      currentUser={currentUser}
      partnerCheckIns={partnerCheckIns}
      currentUserWeightLogs={currentUserWeightLogs}
      partnerWeightLogs={partnerWeightLogs}
    />
  );
}
