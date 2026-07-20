import { NextRequest, NextResponse } from "next/server";

// TEMPORARY: PUT endpoint tanpa auth untuk testing
// Uses shared in-memory store concept
export async function PUT(request: NextRequest) {
  console.log('=== PUT /api/admin-settings/update-no-auth START ===');
  
  try {
    const body = await request.json();
    
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

    const settings = {
      whatsappNumber,
      whatsappMessageHelp,
      whatsappMessageRegistered,
      whatsappMessageUnregistered
    };

    console.log('=== PUT /api/admin-settings/update-no-auth END (SUCCESS) ===');
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating admin settings:", error instanceof Error ? error.message : error);
    
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
