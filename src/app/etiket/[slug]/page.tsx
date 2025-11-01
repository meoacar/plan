import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tag } from "lucide-react"

interface PageProps {
  params: {
    slug: string
  }
}

async function getTagWithPlans(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      plans: {
        where: {
          plan: {
            status: "APPROVED",
          },
        },
        include: {
          plan: {
            include: {
              user: {
                select: {
                  name: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: {
          plan: {
            createdAt: "desc",
          },
        },
      },
      _count: {
        select: {
          plans: true,
        },
      },
    },
  })

  return tag
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = await getTagWithPlans(params.slug)

  if (!tag) {
    return {
      title: "Etiket Bulunamadı",
    }
  }

  return {
    title: `${tag.name} - Zayıflama Planları`,
    description: `${tag.name} etiketiyle ilgili ${tag._count.plans} plan bulundu.`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const tag = await getTagWithPlans(params.slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Tag className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
              <p className="text-gray-600 mt-1">
                {tag._count.plans} plan bulundu
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {tag.plans.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz plan yok
            </h3>
            <p className="text-gray-600">
              Bu etiketle ilgili henüz onaylanmış plan bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tag.plans.map(({ plan }) => (
              <Link
                key={plan.id}
                href={`/plan/${plan.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {plan.title}
                  </h3>
                  
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {plan.description}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4">
                    {plan.user.image ? (
                      <img
                        src={plan.user.image}
                        alt={plan.user.name || "Kullanıcı"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {plan.user.name?.[0] || "?"}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700">
                      {plan.user.name}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👁️ {plan.views} görüntülenme</span>
                    <span>❤️ {plan._count.likes} beğeni</span>
                    <span>💬 {plan._count.comments} yorum</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
