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
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    if (file.size > 5 * 1024 * 1024) {
      console.error(`Dosya boyutu çok büyük: ${file.name} - ${fileSizeMB}MB`);
      return NextResponse.json(
        { error: `Dosya boyutu 5MB'dan küçük olmalıdır (Mevcut: ${fileSizeMB}MB)` },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      console.error(`Geçersiz dosya tipi: ${file.name} - ${file.type}`);
      return NextResponse.json(
        { error: `Sadece resim dosyaları yüklenebilir (Mevcut tip: ${file.type})` },
        { status: 400 }
      );
    }

    // Dosya adı kontrolü - özel karakterler
    const fileName = file.name;
    console.log(`Yüklenen dosya: ${fileName}, Boyut: ${fileSizeMB}MB, Tip: ${file.type}`);

    // Dosyayı buffer'a çevir
    let bytes: ArrayBuffer;
    let buffer: Buffer;
    
    try {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      
      // Buffer boş mu kontrol et
      if (buffer.length === 0) {
        console.error("Dosya içeriği boş");
        return NextResponse.json(
          { error: "Dosya içeriği okunamadı veya boş" },
          { status: 400 }
        );
      }
      
      console.log(`Buffer boyutu: ${buffer.length} bytes`);
    } catch (bufferError) {
      console.error("Buffer oluşturma hatası:", bufferError);
      return NextResponse.json(
        { error: "Dosya içeriği işlenirken hata oluştu" },
        { status: 500 }
      );
    }

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
    
    // Dosya uzantısını güvenli şekilde al
    let extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    
    // Geçerli resim uzantıları
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    if (!validExtensions.includes(extension)) {
      console.error(`Geçersiz dosya uzantısı: ${extension}`);
      // MIME type'dan uzantı çıkar
      const mimeToExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp",
      };
      extension = mimeToExt[file.type] || "jpg";
    }
    
    const filename = `${session.user.id}-${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);
    
    console.log(`Kaydedilecek dosya: ${filename}`);

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
