import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopClient } from "./shop-client";

export const metadata = {
  title: "Mağaza - Zayıflama Planım",
  description: "Coinlerinle harika ödüller satın al",
};

export default async function ShopPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Kullanıcı bilgilerini al
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Coin bakiyesini al
  let coins = 0;
  try {
    const userWithCoins = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    });
    coins = (userWithCoins as any)?.coins || 0;
  } catch (error) {
    console.log('Coins field not yet available');
  }

  // Ödülleri al
  let rewards: any[] = [];
  try {
    rewards = await (prisma as any).reward.findMany({
      where: { isActive: true },
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
      ],
    });
  } catch (error) {
    console.log('Reward table not yet available');
  }

  // Kullanıcının sahip olduğu ödülleri al
  let ownedRewardIds: string[] = [];
  try {
    const userRewards = await (prisma as any).userReward.findMany({
      where: { userId: session.user.id },
      select: { rewardId: true },
    });
    ownedRewardIds = userRewards.map((ur: any) => ur.rewardId);
  } catch (error) {
    console.log('UserReward table not yet available');
  }

  // Kullanıcının ödüllerini al (Ödüllerim sekmesi için)
  let userRewards: any[] = [];
  try {
    userRewards = await (prisma as any).userReward.findMany({
      where: { userId: session.user.id },
      include: {
        reward: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    // Ödülleri işle (aktif, kullanılmış, süresi dolmuş)
    const now = new Date();
    userRewards = userRewards.map((ur: any) => {
      const isExpired = ur.expiresAt ? new Date(ur.expiresAt) < now : false;
      const isActive = !ur.isUsed && !isExpired;

      return {
        ...ur,
        isExpired,
        isActive,
      };
    });
  } catch (error) {
    console.log('UserReward table not yet available');
  }

  return (
    <ShopClient
      user={{
        ...user,
        coins,
      }}
      initialRewards={rewards}
      ownedRewardIds={ownedRewardIds}
      userRewards={userRewards}
    />
  );
}
