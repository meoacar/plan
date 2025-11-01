import { prisma } from '@/lib/prisma';
import { JoinRequestCard } from './join-request-card';

interface JoinRequestListProps {
  groupId: string;
  currentUserRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export async function JoinRequestList({
  groupId,
  currentUserRole,
}: JoinRequestListProps) {
  // Sadece admin ve moderatör görebilir
  if (currentUserRole === 'MEMBER') {
    return null;
  }

  const joinRequests = await prisma.groupJoinRequest.findMany({
    where: {
      groupId,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Her istek için kullanıcı bilgilerini al
  const requestsWithUsers = await Promise.all(
    joinRequests.map(async (request) => {
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          bio: true,
          startWeight: true,
          goalWeight: true,
          level: true,
          streak: true,
        },
      });

      return {
        ...request,
        user,
      };
    })
  );

  if (requestsWithUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bekleyen İstek Yok
        </h3>
        <p className="text-gray-600">
          Şu anda gruba katılmak için bekleyen istek bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Bekleyen İstekler ({requestsWithUsers.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requestsWithUsers.map((request) => (
          <JoinRequestCard
            key={request.id}
            request={request}
            groupId={groupId}
          />
        ))}
      </div>
    </div>
  );
}
