import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Sadece resim dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Uploads klasörünü oluştur
    const uploadsDir = join(process.cwd(), "public", "uploads", "recipes");
    
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("Klasör oluşturma hatası:", mkdirError);
      return NextResponse.json(
        { error: "Yükleme klasörü oluşturulamadı" },
        { status: 500 }
      );
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const filename = `${session.user.id}-${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Dosyayı kaydet
    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error("Dosya yazma hatası:", writeError);
      return NextResponse.json(
        { error: "Dosya kaydedilemedi" },
        { status: 500 }
      );
    }

    // URL'i döndür
    const url = `/uploads/recipes/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Tarif resmi yükleme hatası:", error);
    return NextResponse.json(
      { error: "Resim yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
