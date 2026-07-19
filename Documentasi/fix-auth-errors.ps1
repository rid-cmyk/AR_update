# Script untuk memperbaiki error ApiResponse.unauthorized(error)
$files = @(
    "app/api/target/route.ts",
    "app/api/users/[id]/route.ts", 
    "app/api/users/[id]/assigned-santris/route.ts",
    "app/api/users/route.ts",
    "app/api/roles/[id]/route.ts",
    "app/api/roles/route.ts",
    "app/api/santri/jadwal/route.ts",
    "app/api/guru/prestasi/route.ts",
    "app/api/guru/prestasi/[id]/route.ts",
    "app/api/guru/jadwal/route.ts",
    "app/api/pengumuman/route.ts",
    "app/api/pengumuman/[id]/route.ts",
    "app/api/pengumuman/[id]/read/route.ts",
    "app/api/guru/grafik/top-santri/route.ts",
    "app/api/notifikasi/route.ts",
    "app/api/guru/dashboard/route.ts",
    "app/api/guru/grafik/hafalan/route.ts",
    "app/api/notifikasi/[id]/route.ts",
    "app/api/jadwal/route.ts",
    "app/api/jadwal/[id]/toggle/route.ts",
    "app/api/jadwal/[id]/route.ts",
    "app/api/hafalan/route.ts",
    "app/api/dashboard/ortu/route.ts",
    "app/api/admin/guru-permissions/[id]/route.ts",
    "app/api/admin/users/available/route.ts",
    "app/api/admin/users/route.ts",
    "app/api/admin/guru-permissions/route.ts",
    "app/api/admin/sync/halaqah/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file"
        $content = Get-Content $file -Raw
        $content = $content -replace "ApiResponse\.unauthorized\(error\)", "ApiResponse.unauthorized(error || 'Unauthorized')"
        Set-Content $file $content -NoNewline
    }
}

Write-Host "Done fixing auth errors"