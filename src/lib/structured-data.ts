/**
 * Structured Data (JSON-LD) Generator
 * Google'da zengin sonuçlar için Schema.org formatında veri üretir
 */

interface RecipeStructuredData {
    name: string
    description: string
    image?: string
    author: {
        name: string
        url?: string
    }
    datePublished: string
    dateModified?: string
    prepTime?: string
    cookTime?: string
    totalTime?: string
    recipeYield?: string
    recipeCategory?: string
    recipeCuisine?: string
    keywords?: string[]
    nutrition?: {
        calories?: string
        proteinContent?: string
        fatContent?: string
        carbohydrateContent?: string
    }
    recipeInstructions?: string[]
    recipeIngredient?: string[]
    aggregateRating?: {
        ratingValue: number
        reviewCount: number
    }
}

interface PlanStructuredData {
    name: string
    description: string
    image?: string
    author: {
        name: string
        url?: string
    }
    datePublished: string
    dateModified?: string
    startWeight: number
    goalWeight: number
    duration: string
    category?: string
    keywords?: string[]
    aggregateRating?: {
        ratingValue: number
        reviewCount: number
    }
}

/**
 * Recipe için JSON-LD structured data oluşturur
 */
export function generateRecipeStructuredData(data: RecipeStructuredData) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"

    const structuredData: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": data.name,
        "description": data.description,
        "image": data.image ? [data.image] : undefined,
        "author": {
            "@type": "Person",
            "name": data.author.name,
            "url": data.author.url ? `${baseUrl}${data.author.url}` : undefined
        },
        "datePublished": data.datePublished,
        "dateModified": data.dateModified || data.datePublished,
        "prepTime": data.prepTime,
        "cookTime": data.cookTime,
        "totalTime": data.totalTime,
        "recipeYield": data.recipeYield,
        "recipeCategory": data.recipeCategory,
        "recipeCuisine": data.recipeCuisine || "Turkish",
        "keywords": data.keywords?.join(", "),
        "nutrition": data.nutrition ? {
            "@type": "NutritionInformation",
            "calories": data.nutrition.calories,
            "proteinContent": data.nutrition.proteinContent,
            "fatContent": data.nutrition.fatContent,
            "carbohydrateContent": data.nutrition.carbohydrateContent
        } : undefined,
        "recipeInstructions": data.recipeInstructions?.map((instruction, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "text": instruction
        })),
        "recipeIngredient": data.recipeIngredient,
        "publisher": {
            "@type": "Organization",
            "name": "Zayıflama Planım",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        }
    }

    // AggregateRating sadece review varsa ekle ve itemReviewed ile birlikte
    if (data.aggregateRating && data.aggregateRating.reviewCount > 0) {
        structuredData.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": data.aggregateRating.ratingValue,
            "reviewCount": data.aggregateRating.reviewCount,
            "bestRating": 5,
            "worstRating": 1,
            "itemReviewed": {
                "@type": "Recipe",
                "name": data.name
            }
        }
    }

    return structuredData
}

/**
 * Plan (Article) için JSON-LD structured data oluşturur
 */
export function generatePlanStructuredData(data: PlanStructuredData) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
    const weightLoss = data.startWeight - data.goalWeight
    const lossPercentage = ((weightLoss / data.startWeight) * 100).toFixed(1)

    // Article structured data (AggregateRating olmadan)
    const articleData: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${baseUrl}/plan/${data.name}`,
        "headline": data.name,
        "description": data.description,
        "image": data.image ? [data.image] : undefined,
        "datePublished": data.datePublished,
        "dateModified": data.dateModified || data.datePublished,
        "author": {
            "@type": "Person",
            "name": data.author.name,
            "url": data.author.url ? `${baseUrl}${data.author.url}` : undefined
        },
        "publisher": {
            "@type": "Organization",
            "name": "Zayıflama Planım",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/plan/${data.name}`
        },
        "articleSection": data.category || "Zayıflama Planları",
        "keywords": data.keywords?.join(", "),
        // Custom properties for diet plan
        "about": {
            "@type": "Thing",
            "name": "Zayıflama Planı",
            "description": `${data.startWeight}kg'dan ${data.goalWeight}kg'a (${weightLoss}kg kayıp, %${lossPercentage}) ${data.duration} süresinde`
        }
    }

    return {
        article: articleData,
        // AggregateRating'i ayrı bir obje olarak döndür
        rating: data.aggregateRating && data.aggregateRating.reviewCount > 0 ? {
            "@context": "https://schema.org",
            "@type": "AggregateRating",
            "ratingValue": data.aggregateRating.ratingValue,
            "reviewCount": data.aggregateRating.reviewCount,
            "bestRating": 5,
            "worstRating": 1,
            "itemReviewed": {
                "@type": "Article",
                "@id": `${baseUrl}/plan/${data.name}`,
                "name": data.name
            }
        } : null
    }
}

/**
 * Breadcrumb için JSON-LD structured data oluşturur
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${baseUrl}${item.url}`
        }))
    }
}

/**
 * Website için JSON-LD structured data oluşturur
 */
export function generateWebsiteStructuredData() {
    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"

    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Zayıflama Planım",
        "url": baseUrl,
        "description": "Gerçek kullanıcıların başarılı zayıflama hikayeleri ve diyetleri. Sağlıklı kilo verme planları, motivasyon ve destek.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/plans?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Zayıflama Planım",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        }
    }
}

/**
 * JSON-LD string olarak döndürür
 * Server Component'lerde kullanılır
 */
export function getStructuredDataScript(data: Record<string, any>): string {
    return JSON.stringify(data)
}
