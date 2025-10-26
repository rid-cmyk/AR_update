# Script untuk mengganti referensi raport dengan raportSantri di template raport
$file = "app/api/admin/template-raport/route.ts"

if (Test-Path $file) {
    Write-Host "Fixing $file"
    $content = Get-Content $file | Out-String
    
    # Replace raport references
    $content = $content -replace "raport: true", "raportSantri: true"
    
    Set-Content $file $content
    Write-Host "Fixed $file"
} else {
    Write-Host "File $file not found"
}

Write-Host "Done fixing template raport file"