import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

// Tarifleri listele (onaylı tarifler)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    const where: any = {
      status: "APPROVED",
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          images: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Tarif listesi hatası:", error);
    return NextResponse.json(
      { error: "Tarifler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni tarif oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      calories,
      protein,
      carbs,
      fat,
      images,
    } = body;

    // Validasyon
    if (!title || !description || !ingredients || !instructions || !category) {
      return NextResponse.json(
        { error: "Zorunlu alanları doldurun" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "En az 1 resim yüklemelisiniz" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "En fazla 5 resim yükleyebilirsiniz" },
        { status: 400 }
      );
    }

    // Slug oluştur
    let slug = slugify(title, { lower: true, strict: true });
    const existingSlug = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Tarif oluştur
    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        title,
        slug,
        description,
        ingredients: JSON.stringify(ingredients),
        instructions,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : null,
        difficulty,
        category,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        status: "PENDING",
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Tarif oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Tarif oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
