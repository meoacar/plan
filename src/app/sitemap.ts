import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zayiflamaplanim.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/groups`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Categories
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Tags
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  });

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/etiket/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Plans (Zayıflama Planları)
  const plans = await prisma.plan.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const planPages: MetadataRoute.Sitemap = plans.map((plan) => ({
    url: `${baseUrl}/plan/${plan.slug}`,
    lastModified: plan.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Recipes (Tarifler)
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Pages (Statik Sayfalar)
  const pages = await prisma.page.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const customPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/pages/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Groups (Gruplar)
  const groups = await prisma.group.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const groupPages: MetadataRoute.Sitemap = groups.map((group) => ({
    url: `${baseUrl}/groups/${group.slug}`,
    lastModified: group.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...tagPages,
    ...planPages,
    ...recipePages,
    ...customPages,
    ...groupPages,
  ];
}
