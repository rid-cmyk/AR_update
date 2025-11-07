import { NextRequest, NextResponse } from 'next/server'

// Import data dari route utama (dalam implementasi nyata, gunakan database)
// Untuk simulasi, kita akan menggunakan array yang sama
let templateRaportData = [
  {
    id: '1',
    nama: 'Template Raport Semester Ganjil 2024',
    header: 'PONDOK PESANTREN AL-HIKMAH\nJl. Raya Pendidikan No. 123\nTelp: (021) 1234567 | Email: info@alhikmah.ac.id',
    footer: 'Kepala Sekolah,\n\n\nDr. H. Ahmad Fauzi, M.Pd\nNIP. 123456789',
    logo: '/uploads/logo-alhikmah.png',
    status: 'aktif',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nama: 'Template Raport Semester Genap 2024',
    header: 'PONDOK PESANTREN AL-HIKMAH\nJl. Raya Pendidikan No. 123\nTelp: (021) 1234567 | Email: info@alhikmah.ac.id',
    footer: 'Kepala Sekolah,\n\n\nDr. H. Ahmad Fauzi, M.Pd\nNIP. 123456789',
    logo: null,
    status: 'aktif',
    createdAt: '2024-06-15T10:00:00Z'
  }
]

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cari index template yang akan dihapus
    const templateIndex = templateRaportData.findIndex(template => template.id === id)
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template raport tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    // Hapus template dari array
    const deletedTemplate = templateRaportData.splice(templateIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedTemplate,
      message: 'Template raport berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting template raport:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menghapus template raport' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Cari template berdasarkan ID
    const template = templateRaportData.find(template => template.id === id)
    
    if (!template) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template raport tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template raport berhasil diambil'
    })
  } catch (error) {
    console.error('Error fetching template raport:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil template raport' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const formData = await request.formData()
    
    const nama = formData.get('nama') as string
    const header = formData.get('header') as string
    const footer = formData.get('footer') as string
    const logoFile = formData.get('logo') as File | null

    // Cari template yang akan diupdate
    const templateIndex = templateRaportData.findIndex(template => template.id === id)
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template raport tidak ditemukan' 
        },
        { status: 404 }
      )
    }

    // Validasi input
    if (!nama || !header || !footer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nama, header, dan footer wajib diisi' 
        },
        { status: 400 }
      )
    }

    // Simulasi upload logo baru jika ada
    let logoPath = templateRaportData[templateIndex].logo
    if (logoFile && logoFile.size > 0) {
      logoPath = `/uploads/logo-${Date.now()}-${logoFile.name}`
      console.log('Logo updated:', logoPath)
    }

    // Update template
    templateRaportData[templateIndex] = {
      ...templateRaportData[templateIndex],
      nama,
      header,
      footer,
      logo: logoPath,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: templateRaportData[templateIndex],
      message: 'Template raport berhasil diupdate'
    })
  } catch (error) {
    console.error('Error updating template raport:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengupdate template raport' 
      },
      { status: 500 }
    )
  }
}