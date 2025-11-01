import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filters
    const goalType = searchParams.get('goalType');
    const minMembers = searchParams.get('minMembers');
    const maxMembers = searchParams.get('maxMembers');
    const activityLevel = searchParams.get('activityLevel');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const gender = searchParams.get('gender');
    const ageGroup = searchParams.get('ageGroup');
    const search = searchParams.get('search');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {
      status: 'APPROVED',
    };

    // Goal type filter
    if (goalType) {
      where.goalType = goalType;
    }

    // Member count filters
    if (minMembers || maxMembers) {
      where.members = {
        some: {},
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter (based on goal type categories)
    if (category) {
      where.goalType = category;
    }

    // Fetch groups with filters
    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            challenges: true,
            posts: true,
          },
        },
      },
      orderBy: sortBy === 'members' 
        ? { members: { _count: sortOrder as 'asc' | 'desc' } }
        : sortBy === 'activity'
        ? { posts: { _count: sortOrder as 'asc' | 'desc' } }
        : { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Post-process filters (for complex filters that can't be done in Prisma query)
    let filteredGroups = groups;

    // Filter by member count
    if (minMembers) {
      const min = parseInt(minMembers);
      filteredGroups = filteredGroups.filter(g => g._count.members >= min);
    }
    if (maxMembers) {
      const max = parseInt(maxMembers);
      filteredGroups = filteredGroups.filter(g => g._count.members <= max);
    }

    // Filter by activity level (based on post count as a proxy for activity)
    if (activityLevel) {
      filteredGroups = filteredGroups.filter(group => {
        const postCount = group._count.posts;
        const memberCount = group._count.members;
        // Calculate activity rate as posts per member
        const activityRate = memberCount > 0 ? postCount / memberCount : 0;
        
        switch (activityLevel) {
          case 'high':
            return activityRate >= 2; // 2+ posts per member
          case 'medium':
            return activityRate >= 0.5 && activityRate < 2;
          case 'low':
            return activityRate < 0.5;
          default:
            return true;
        }
      });
    }

    // Filter by city (check group creator's city)
    if (city && filteredGroups.length > 0) {
      // Get admin members
      const adminMembers = await prisma.groupMember.findMany({
        where: {
          groupId: { in: filteredGroups.map(g => g.id) },
          role: 'ADMIN',
        },
        select: {
          groupId: true,
          userId: true,
        },
      });

      // Get users with city info
      const userIds = adminMembers.map(m => m.userId);
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          city: { equals: city, mode: 'insensitive' },
        },
        select: { id: true },
      });

      const userIdSet = new Set(users.map(u => u.id));
      const cityFilteredIds = adminMembers
        .filter(m => userIdSet.has(m.userId))
        .map(m => m.groupId);

      filteredGroups = filteredGroups.filter(g => cityFilteredIds.includes(g.id));
    }

    // Filter by level (beginner/advanced based on member count and activity)
    if (level) {
      filteredGroups = filteredGroups.filter(group => {
        const memberCount = group._count.members;
        const postCount = group._count.posts;
        const activityRate = memberCount > 0 ? postCount / memberCount : 0;
        
        if (level === 'beginner') {
          return memberCount < 20 || activityRate < 1;
        } else if (level === 'advanced') {
          return memberCount >= 20 && activityRate >= 1;
        }
        return true;
      });
    }

    // Filter by gender (check group members' gender distribution)
    // Note: Gender field is not currently in User model
    // This filter is prepared for future implementation
    if (gender && filteredGroups.length > 0) {
      // For now, we'll keep all groups as we don't have gender field in User model
      // This can be enhanced when gender field is added
      filteredGroups = filteredGroups;
    }

    // Filter by age group
    if (ageGroup) {
      // Similar to gender, this would require birthdate or age field in User model
      // Keeping all groups for now
      filteredGroups = filteredGroups;
    }

    // Recalculate total after post-processing filters
    const finalTotal = filteredGroups.length;
    const paginatedGroups = filteredGroups.slice(0, limit);

    // Get total count from database for accurate pagination
    const dbTotal = await prisma.group.count({ where });

    return NextResponse.json({
      groups: paginatedGroups,
      pagination: {
        total: finalTotal > 0 ? finalTotal : dbTotal,
        page,
        limit,
        totalPages: Math.ceil((finalTotal > 0 ? finalTotal : dbTotal) / limit),
      },
      filters: {
        goalType,
        minMembers,
        maxMembers,
        activityLevel,
        city,
        category,
        level,
        gender,
        ageGroup,
        search,
      },
    });
  } catch (error) {
    console.error('Gelişmiş arama hatası:', error);
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
