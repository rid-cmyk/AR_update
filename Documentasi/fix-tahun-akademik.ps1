# Script untuk mengganti referensi tahunAkademik dengan tahunAjaran
$file = "app/api/admin/raport/generate/route.ts"

if (Test-Path $file) {
    Write-Host "Fixing $file"
    $content = Get-Content $file -Raw
    
    # Replace tahunAkademik variable references
    $content = $content -replace "tahunAkademik\.tahunAkademik", "tahunAjaran.namaLengkap"
    $content = $content -replace "tahunAkademik\.semester", "tahunAjaran.semester"
    
    Set-Content $file $content -NoNewline
    Write-Host "Fixed $file"
} else {
    Write-Host "File $file not found"
}

Write-Host "Done fixing tahun akademik references"