import { prisma } from '@/lib/prisma';
import { MemberCard } from './member-card';

interface MemberListProps {
  groupId: string;
  groupSlug: string;
  currentUserId: string;
  currentUserRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export async function MemberList({
  groupId,
  groupSlug,
  currentUserId,
  currentUserRole,
}: MemberListProps) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: true,
    },
    orderBy: [
      { role: 'asc' }, // ADMIN önce, sonra MODERATOR, sonra MEMBER
      { joinedAt: 'asc' },
    ],
  });

  // Rollere göre grupla
  const admins = members.filter((m) => m.role === 'ADMIN');
  const moderators = members.filter((m) => m.role === 'MODERATOR');
  const regularMembers = members.filter((m) => m.role === 'MEMBER');

  return (
    <div className="space-y-8">
      {/* Adminler */}
      {admins.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-yellow-500">👑</span>
            Yöneticiler ({admins.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                groupSlug={groupSlug}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* Moderatörler */}
      {moderators.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-500">🛡️</span>
            Moderatörler ({moderators.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moderators.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                groupSlug={groupSlug}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* Üyeler */}
      {regularMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Üyeler ({regularMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                groupSlug={groupSlug}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Henüz üye yok</p>
        </div>
      )}
    </div>
  );
}
