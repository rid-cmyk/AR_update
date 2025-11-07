import { NextRequest, NextResponse } from 'next/server'

// Simulasi data template raport
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

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: templateRaportData,
      message: 'Data template raport berhasil diambil'
    })
  } catch (error) {
    console.error('Error fetching template raport:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil data template raport' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const nama = formData.get('nama') as string
    const header = formData.get('header') as string
    const footer = formData.get('footer') as string
    const logoFile = formData.get('logo') as File | null

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

    // Simulasi upload logo (dalam implementasi nyata, simpan ke storage)
    let logoPath = null
    if (logoFile && logoFile.size > 0) {
      // Simulasi path logo yang diupload
      logoPath = `/uploads/logo-${Date.now()}-${logoFile.name}`
      console.log('Logo uploaded:', logoPath)
    }

    // Buat template raport baru
    const newTemplate = {
      id: (templateRaportData.length + 1).toString(),
      nama,
      header,
      footer,
      logo: logoPath,
      status: 'aktif' as const,
      createdAt: new Date().toISOString()
    }

    templateRaportData.push(newTemplate)

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template raport berhasil dibuat'
    })
  } catch (error) {
    console.error('Error creating template raport:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template raport' 
      },
      { status: 500 }
    )
  }
}