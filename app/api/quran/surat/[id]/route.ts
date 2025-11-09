import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const suratId = parseInt(id)

    if (isNaN(suratId) || suratId < 1 || suratId > 114) {
      return NextResponse.json({
        success: false,
        message: 'Invalid surat ID'
      }, { status: 400 })
    }

    // Fetch dari equran.id API
    const response = await fetch(`https://equran.id/api/v2/surat/${suratId}`, {
      next: { revalidate: 86400 } // Cache 24 jam
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from equran.id')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data.data
    })

  } catch (error) {
    console.error('Error fetching surat:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data surat dari equran.id'
    }, { status: 500 })
  }
}
