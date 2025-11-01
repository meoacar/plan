/**
 * Grup Yetkilendirme Middleware'leri
 * 
 * Bu dosya, grup işlemleri için yetkilendirme kontrollerini sağlar.
 */

import { prisma } from '@/lib/prisma';

/**
 * Grup üye rolleri
 */
export enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

/**
 * Rol hiyerarşisi değerleri
 */
const ROLE_HIERARCHY: Record<GroupMemberRole, number> = {
  [GroupMemberRole.ADMIN]: 3,
  [GroupMemberRole.MODERATOR]: 2,
  [GroupMemberRole.MEMBER]: 1,
};

/**
 * API Hata sınıfı
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Kullanıcının grup üyesi olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @returns Grup üyelik bilgisi
 * @throws ApiError - Kullanıcı grup üyesi değilse
 */
export async function checkGroupMembership(
  userId: string,
  groupId: string
) {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!member) {
    throw new ApiError(403, 'Bu grubun üyesi değilsiniz', 'NOT_GROUP_MEMBER');
  }

  return member;
}

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @param requiredRole - Gerekli rol
 * @returns Grup üyelik bilgisi
 * @throws ApiError - Kullanıcı grup üyesi değilse veya yetersiz yetkiye sahipse
 */
export async function checkGroupRole(
  userId: string,
  groupId: string,
  requiredRole: GroupMemberRole
) {
  const member = await checkGroupMembership(userId, groupId);

  if (!hasRole(member.role as GroupMemberRole, requiredRole)) {
    throw new ApiError(
      403,
      'Bu işlem için yetkiniz yok',
      'INSUFFICIENT_PERMISSIONS'
    );
  }

  return member;
}

/**
 * Kullanıcının gerekli role sahip olup olmadığını kontrol eder
 * Rol hiyerarşisi: ADMIN > MODERATOR > MEMBER
 * 
 * @param userRole - Kullanıcının rolü
 * @param requiredRole - Gerekli rol
 * @returns Kullanıcının yeterli yetkiye sahip olup olmadığı
 */
export function hasRole(
  userRole: GroupMemberRole,
  requiredRole: GroupMemberRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @returns Grup üyelik bilgisi
 * @throws ApiError - Kullanıcı admin değilse
 */
export async function checkGroupAdmin(userId: string, groupId: string) {
  return checkGroupRole(userId, groupId, GroupMemberRole.ADMIN);
}

/**
 * Kullanıcının moderatör veya admin olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @returns Grup üyelik bilgisi
 * @throws ApiError - Kullanıcı moderatör veya admin değilse
 */
export async function checkGroupModerator(userId: string, groupId: string) {
  return checkGroupRole(userId, groupId, GroupMemberRole.MODERATOR);
}

/**
 * Kullanıcının grup üyesi olup olmadığını kontrol eder (herhangi bir rol)
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @returns Grup üyelik bilgisi
 * @throws ApiError - Kullanıcı grup üyesi değilse
 */
export async function checkGroupMember(userId: string, groupId: string) {
  return checkGroupRole(userId, groupId, GroupMemberRole.MEMBER);
}

/**
 * Kullanıcının grup oluşturucusu olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @returns Grup bilgisi
 * @throws ApiError - Kullanıcı grup oluşturucusu değilse
 */
export async function checkGroupCreator(userId: string, groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      slug: true,
      createdBy: true,
    },
  });

  if (!group) {
    throw new ApiError(404, 'Grup bulunamadı', 'GROUP_NOT_FOUND');
  }

  if (group.createdBy !== userId) {
    throw new ApiError(
      403,
      'Bu işlem sadece grup oluşturucusu tarafından yapılabilir',
      'NOT_GROUP_CREATOR'
    );
  }

  return group;
}

/**
 * Birden fazla kullanıcının grup üyesi olup olmadığını kontrol eder
 * 
 * @param userIds - Kullanıcı ID'leri
 * @param groupId - Grup ID'si
 * @returns Grup üyelik bilgileri
 */
export async function checkMultipleGroupMemberships(
  userIds: string[],
  groupId: string
) {
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
      userId: {
        in: userIds,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  const memberMap = new Map(members.map((m) => [m.userId, m]));
  const nonMembers = userIds.filter((id) => !memberMap.has(id));

  if (nonMembers.length > 0) {
    throw new ApiError(
      403,
      'Bazı kullanıcılar grup üyesi değil',
      'SOME_USERS_NOT_MEMBERS'
    );
  }

  return members;
}

/**
 * Kullanıcının belirli bir kaynağa erişim yetkisi olup olmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param groupId - Grup ID'si
 * @param resourceOwnerId - Kaynak sahibinin ID'si
 * @param requiredRole - Gerekli rol (kaynak sahibi değilse)
 * @returns Erişim yetkisi var mı
 */
export async function checkResourceAccess(
  userId: string,
  groupId: string,
  resourceOwnerId: string,
  requiredRole: GroupMemberRole = GroupMemberRole.MODERATOR
): Promise<boolean> {
  // Kaynak sahibi her zaman erişebilir
  if (userId === resourceOwnerId) {
    return true;
  }

  // Diğer kullanıcılar için rol kontrolü
  try {
    await checkGroupRole(userId, groupId, requiredRole);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Grup durumunu kontrol eder (aktif, askıya alınmış, vb.)
 * 
 * @param groupId - Grup ID'si
 * @returns Grup bilgisi
 * @throws ApiError - Grup bulunamazsa veya aktif değilse
 */
export async function checkGroupStatus(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });

  if (!group) {
    throw new ApiError(404, 'Grup bulunamadı', 'GROUP_NOT_FOUND');
  }

  if (group.status !== 'APPROVED') {
    throw new ApiError(
      403,
      'Bu grup şu anda aktif değil',
      'GROUP_NOT_ACTIVE'
    );
  }

  return group;
}

/**
 * Kullanıcının grup üye limitine ulaşıp ulaşmadığını kontrol eder
 * 
 * @param userId - Kullanıcı ID'si
 * @param maxGroups - Maksimum grup sayısı (varsayılan: 10)
 * @throws ApiError - Kullanıcı limite ulaştıysa
 */
export async function checkGroupMembershipLimit(
  userId: string,
  maxGroups: number = 10
) {
  const membershipCount = await prisma.groupMember.count({
    where: { userId },
  });

  if (membershipCount >= maxGroups) {
    throw new ApiError(
      403,
      `En fazla ${maxGroups} gruba üye olabilirsiniz`,
      'GROUP_MEMBERSHIP_LIMIT_REACHED'
    );
  }
}

/**
 * Grubun üye limitine ulaşıp ulaşmadığını kontrol eder
 * 
 * @param groupId - Grup ID'si
 * @throws ApiError - Grup limite ulaştıysa
 */
export async function checkGroupCapacity(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      maxMembers: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!group) {
    throw new ApiError(404, 'Grup bulunamadı', 'GROUP_NOT_FOUND');
  }

  if (group.maxMembers && group._count.members >= group.maxMembers) {
    throw new ApiError(
      403,
      'Grup üye kapasitesi dolmuş',
      'GROUP_CAPACITY_FULL'
    );
  }
}
