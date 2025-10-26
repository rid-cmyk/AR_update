# Script untuk mengganti semua referensi tahunAkademik dengan tahunAjaran
$files = @(
    "app/api/admin/tahun-akademik/[id]/route.ts",
    "app/api/admin/tahun-akademik/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file"
        $content = Get-Content $file -Raw
        
        # Replace model references
        $content = $content -replace "prisma\.tahunAkademik", "prisma.tahunAjaran"
        
        # Replace variable names
        $content = $content -replace "updatedTahunAkademik", "updatedTahunAjaran"
        $content = $content -replace "newTahunAkademik", "newTahunAjaran"
        $content = $content -replace "duplicateTahun", "duplicateTahunAjaran"
        
        Set-Content $file $content -NoNewline
        Write-Host "Fixed $file"
    } else {
        Write-Host "File $file not found"
    }
}

Write-Host "Done fixing all tahun akademik files"