import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { detectImageType } from "@/lib/utils/imageUpload";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthUser(request);
  if (!user || error) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Deteksi tipe gambar dari isi file (magic bytes), bukan header yang bisa dipalsukan
    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "users");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    // Generate unique filename dengan ekstensi aman (bukan dari nama file user)
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `user_${timestamp}_${random}.${detected.ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    // Return the URL path
    const photoUrl = `/uploads/users/${filename}`;

    return NextResponse.json({
      success: true,
      url: photoUrl,
      filename: filename
    });
    } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}