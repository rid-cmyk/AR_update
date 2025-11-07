import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// TEMPORARY: PUT endpoint tanpa auth untuk testing
// TODO: Tambahkan auth setelah masalah session resolved
export async function PUT(request: NextRequest) {
  console.log('=== PUT /api/admin-settings/update-no-auth START ===');
  
  try {
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageRegistered,
      whatsappMessageUnregistered
    } = body;

    // Validasi data
    if (!whatsappNumber || !whatsappMessageHelp || !whatsappMessageRegistered || !whatsappMessageUnregistered) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Cari settings yang ada
    let settings = await prisma.adminSettings.findFirst();
    console.log('Existing settings:', settings ? 'found' : 'not found');

    if (!settings) {
      // Buat baru jika belum ada
      console.log('Creating new settings');
      settings = await prisma.adminSettings.create({
        data: {
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageRegistered,
          whatsappMessageUnregistered
        }
      });
    } else {
      // Update yang sudah ada
      console.log('Updating existing settings');
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          whatsappNumber,
          whatsappMessageHelp,
          whatsappMessageRegistered,
          whatsappMessageUnregistered
        }
      });
    }

    console.log('Settings saved successfully:', settings);
    console.log('=== PUT /api/admin-settings/update-no-auth END (SUCCESS) ===');
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("=== ERROR updating admin settings ===");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("=== PUT /api/admin-settings/update-no-auth END (ERROR) ===");
    
    return NextResponse.json(
      { 
        error: "Failed to update admin settings", 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
