import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { PlanEditForm } from "@/components/plan-edit-form"

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getPlan(slug: string, userId: string) {
    const plan = await prisma.plan.findUnique({
        where: { slug },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                }
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            }
        }
    })

    // Sadece plan sahibi düzenleyebilir
    if (!plan || plan.userId !== userId) {
        return null
    }

    return plan
}

async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { order: "asc" }
    })
}

async function getTags() {
    return await prisma.tag.findMany({
        orderBy: { name: "asc" }
    })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: "Planı Düzenle - Zayıflama Planım",
    }
}

export default async function EditPlanPage({ params }: PageProps) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { slug } = await params
    const plan = await getPlan(slug, session.user.id)

    if (!plan) {
        notFound()
    }

    const [categories, tags] = await Promise.all([
        getCategories(),
        getTags()
    ])

    return <PlanEditForm plan={plan} categories={categories} tags={tags} />
}
