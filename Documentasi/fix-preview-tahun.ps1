# Script untuk mengganti referensi tahunAkademik dengan tahunAjaran di preview
$file = "app/api/admin/raport/preview/route.ts"

if (Test-Path $file) {
    Write-Host "Fixing $file"
    $content = Get-Content $file -Raw
    
    # Replace tahunAkademik variable references
    $content = $content -replace "if \(!tahunAkademik\)", "if (!tahunAjaran)"
    $content = $content -replace "tahunAkademik\.tahunAkademik", "tahunAjaran.namaLengkap"
    $content = $content -replace "tahunAkademik\.semester", "tahunAjaran.semester"
    
    # Replace prisma.raport with prisma.raportSantri
    $content = $content -replace "prisma\.raport\.", "prisma.raportSantri."
    
    Set-Content $file $content -NoNewline
    Write-Host "Fixed $file"
} else {
    Write-Host "File $file not found"
}

Write-Host "Done fixing preview file"