import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateChallengeForm from "@/components/groups/create-challenge-form";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getGroup(slug: string, userId?: string) {
  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: userId || "" },
      },
    },
  });

  if (!group) {
    return null;
  }

  const member = group.members[0];
  if (!member || member.role !== "ADMIN") {
    return null;
  }

  return group;
}

export default async function CreateChallengePage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Suspense fallback={<div className="text-center py-8">Yükleniyor...</div>}>
          <CreateChallengeForm groupId={group.id} groupSlug={group.slug} />
        </Suspense>
      </div>
    </div>
  );
}
