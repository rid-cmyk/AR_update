import { withAuth } from "@/lib/api-helpers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { detectImageType } from "@/lib/utils/imageUpload";

export async function POST(request: NextRequest) {
  const { user, error } = await withAuth(request);
  if (!user || error) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 2MB" 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Deteksi tipe gambar dari isi file (magic bytes), bukan header yang bisa dipalsukan
    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json({
        error: "Invalid file type. Only JPG, PNG, and WebP are allowed"
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename dengan ekstensi aman (bukan dari nama file user)
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `profile_${timestamp}_${random}.${detected.ext}`;
    const filepath = join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/profiles/${filename}`;

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Failed to upload file" 
    }, { status: 500 });
  }
}