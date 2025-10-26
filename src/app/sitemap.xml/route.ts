import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zayiflamaplanim.com';

  // Blog yazılarını al
  const blogPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      isPublished: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Planları al
  const plans = await prisma.plan.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Tarifleri al
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/plan</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/recipes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${blogPosts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${plans
    .map(
      (plan) => `
  <url>
    <loc>${baseUrl}/plan/${plan.slug}</loc>
    <lastmod>${plan.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${recipes
    .map(
      (recipe) => `
  <url>
    <loc>${baseUrl}/recipes/${recipe.slug}</loc>
    <lastmod>${recipe.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
